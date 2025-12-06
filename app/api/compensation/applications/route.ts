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
