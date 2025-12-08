/**
 * API Route: Get Compensation Applications (with filters)
 * GET /api/compensation/applications
 *
 * Protected route - requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyCompensationAdminToken } from '@/lib/auth/compensationAdminAuth';
import { getApplications, getStatistics } from '@/lib/services/compensationService';
import { compensationFilterSchema } from '@/lib/utils/validation';
import { z } from 'zod';

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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get('status') || undefined,
      district: searchParams.get('district') || undefined,
      divisionalSecretariat: searchParams.get('divisionalSecretariat') || undefined,
      gramaNiladhariDivision: searchParams.get('gramaNiladhariDivision') || undefined,
      claimType: searchParams.get('claimType') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
    };

    // Validate filters
    const validated = compensationFilterSchema.parse(filters);

    // Get applications
    const { success, applications, pagination, error } = await getApplications(validated);

    if (!success) {
      return NextResponse.json(
        { error: error || 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      applications,
      pagination,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid filters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

const bulkDeleteSchema = z.object({
  applicationIds: z.array(z.string().uuid()).min(1, 'At least one application ID is required'),
});

/**
 * Bulk delete compensation applications
 * DELETE /api/compensation/applications
 */
export async function DELETE(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const validated = bulkDeleteSchema.parse(body);

    const { getServiceRoleClient } = await import('@/lib/supabase/serviceRoleClient');
    const supabase = getServiceRoleClient();

    // Delete claims first (due to foreign key constraint)
    const { error: claimsDeleteError } = await supabase
      .from('compensation_claims')
      .delete()
      .in('application_id', validated.applicationIds);

    if (claimsDeleteError) {
      console.error('Error deleting claims:', claimsDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete claims', details: claimsDeleteError.message },
        { status: 500 }
      );
    }

    // Delete applications
    const { error: applicationsDeleteError } = await supabase
      .from('compensation_applications')
      .delete()
      .in('id', validated.applicationIds);

    if (applicationsDeleteError) {
      console.error('Error deleting applications:', applicationsDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete applications', details: applicationsDeleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount: validated.applicationIds.length,
      message: `Successfully deleted ${validated.applicationIds.length} application(s)`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error deleting applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}