/**
 * API Route: Manage Single Staff Center
 * PATCH /api/compensation/staff-centers/[id] - Update center
 * DELETE /api/compensation/staff-centers/[id] - Delete center
 *
 * Protected route - requires compensation admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyCompensationAdminToken } from '@/lib/auth/compensationAdminAuth';
import { createClient } from '@/utils/supabase/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const updateCenterSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).transform((val) => val.toUpperCase()).optional(),
  district: z.string().min(1).optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  contactNumber: z.string().optional(),
  isActive: z.boolean().optional(),
  accessCode: z.string().min(4).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
    const validated = updateCenterSchema.parse(body);

    const supabase = await createClient();

    // Check if center exists
    const { data: existingCenter } = await supabase
      .from('staff_centers')
      .select('id, code')
      .eq('id', id)
      .single();

    if (!existingCenter) {
      return NextResponse.json(
        { error: 'Center not found' },
        { status: 404 }
      );
    }

    // If code is being updated, check for duplicates
    if (validated.code && validated.code !== existingCenter.code) {
      const { data: duplicateCenter } = await supabase
        .from('staff_centers')
        .select('id')
        .eq('code', validated.code)
        .single();

      if (duplicateCenter) {
        return NextResponse.json(
          { error: 'Center code already exists' },
          { status: 400 }
        );
      }
    }

    // Update center
    const updateData: any = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.code !== undefined) updateData.code = validated.code;
    if (validated.district !== undefined) updateData.district = validated.district;
    if (validated.address !== undefined) updateData.address = validated.address || null;
    if (validated.contactPerson !== undefined) updateData.contact_person = validated.contactPerson || null;
    if (validated.contactNumber !== undefined) updateData.contact_number = validated.contactNumber || null;
    if (validated.isActive !== undefined) updateData.is_active = validated.isActive;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('staff_centers')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }
    }

    // Update access code if provided
    if (validated.accessCode) {
      const hashedAccessCode = await bcrypt.hash(validated.accessCode, 10);

      const { error: authError } = await supabase
        .from('staff_auth')
        .update({ access_code: hashedAccessCode })
        .eq('center_id', id);

      if (authError) {
        throw authError;
      }
    }

    // Fetch updated center
    const { data: updatedCenter } = await supabase
      .from('staff_centers')
      .select('*')
      .eq('id', id)
      .single();

    return NextResponse.json({
      success: true,
      center: updatedCenter,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating staff center:', error);
    return NextResponse.json(
      { error: 'Failed to update center' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Delete auth record first (foreign key constraint)
    await supabase.from('staff_auth').delete().eq('center_id', id);

    // Delete center
    const { error: deleteError } = await supabase
      .from('staff_centers')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: 'Center deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting staff center:', error);
    return NextResponse.json(
      { error: 'Failed to delete center' },
      { status: 500 }
    );
  }
}

