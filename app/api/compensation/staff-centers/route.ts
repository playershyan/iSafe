/**
 * API Route: Manage Staff Centers
 * GET /api/compensation/staff-centers - List all centers
 * POST /api/compensation/staff-centers - Create new center
 *
 * Protected route - requires compensation admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyCompensationAdminToken } from '@/lib/auth/compensationAdminAuth';
import { createClient } from '@/utils/supabase/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createCenterSchema = z.object({
  name: z.string().min(1, 'Center name is required'),
  code: z.string().min(1, 'Center code is required').transform((val) => val.toUpperCase()),
  district: z.string().min(1, 'District is required'),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  contactNumber: z.string().optional(),
  accessCode: z.string().min(4, 'Access code must be at least 4 characters'),
});

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('compensation_admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const session = await verifyCompensationAdminToken(token);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Get all centers with their auth info
    const { data: centers, error: centersError } = await supabase
      .from('staff_centers')
      .select('*')
      .order('created_at', { ascending: false });

    if (centersError) {
      throw centersError;
    }

    // Get auth info for each center
    const centersWithAuth = await Promise.all(
      (centers || []).map(async (center) => {
        const { data: auth } = await supabase
          .from('staff_auth')
          .select('access_code, last_access_at, access_count')
          .eq('center_id', center.id)
          .single();

        return {
          ...center,
          hasAccessCode: !!auth,
          lastAccessAt: auth?.last_access_at || null,
          accessCount: auth?.access_count || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      centers: centersWithAuth,
    });
  } catch (error) {
    console.error('Error fetching staff centers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch centers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('compensation_admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const session = await verifyCompensationAdminToken(token);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = createCenterSchema.parse(body);

    const supabase = await createClient();

    // Check if center code already exists
    const { data: existingCenter } = await supabase
      .from('staff_centers')
      .select('id')
      .eq('code', validated.code)
      .single();

    if (existingCenter) {
      return NextResponse.json(
        { error: 'Center code already exists' },
        { status: 400 }
      );
    }

    // Create center
    const { data: center, error: centerError } = await supabase
      .from('staff_centers')
      .insert({
        name: validated.name,
        code: validated.code,
        district: validated.district,
        address: validated.address || null,
        contact_person: validated.contactPerson || null,
        contact_number: validated.contactNumber || null,
        is_active: true,
      })
      .select()
      .single();

    if (centerError || !center) {
      throw centerError || new Error('Failed to create center');
    }

    // Hash access code and create auth record
    const hashedAccessCode = await bcrypt.hash(validated.accessCode, 10);

    const { error: authError } = await supabase
      .from('staff_auth')
      .insert({
        center_id: center.id,
        access_code: hashedAccessCode,
        access_count: 0,
      });

    if (authError) {
      // Rollback: delete center if auth creation fails
      await supabase.from('staff_centers').delete().eq('id', center.id);
      throw authError;
    }

    return NextResponse.json({
      success: true,
      center: {
        ...center,
        hasAccessCode: true,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating staff center:', error);
    return NextResponse.json(
      { error: 'Failed to create center' },
      { status: 500 }
    );
  }
}

