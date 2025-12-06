/**
 * API Route: Get Compensation Statistics
 * GET /api/compensation/stats
 *
 * Protected route - requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyCompensationAdminToken } from '@/lib/auth/compensationAdminAuth';
import { getStatistics } from '@/lib/services/compensationService';

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

    // Get statistics
    const { success, stats, error } = await getStatistics();

    if (!success) {
      return NextResponse.json(
        { error: error || 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
