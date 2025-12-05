import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAnonymousUserIdFromCookies } from '@/lib/utils/anonymousUser';
import { cookies } from 'next/headers';

/**
 * PATCH /api/user/reports/[id]/found
 * Mark a missing person report as FOUND (only if user owns it)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const { id } = await params;
    
    // Get anonymous user ID from cookies
    const anonymousUserId = getAnonymousUserIdFromCookies(cookieStore);
    
    if (!anonymousUserId) {
      return NextResponse.json(
        { error: 'No anonymous user ID found' },
        { status: 401 }
      );
    }

    // Verify the report belongs to this user
    const { data: existingReport, error: checkError } = await supabase
      .from('missing_persons')
      .select('anonymous_user_id, status')
      .eq('id', id)
      .single();

    if (checkError || !existingReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    if (existingReport.anonymous_user_id !== anonymousUserId) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only update your own reports' },
        { status: 403 }
      );
    }

    // Update status to FOUND
    const { data: updatedReport, error: updateError } = await supabase
      .from('missing_persons')
      .update({
        status: 'FOUND',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error marking report as found:', updateError);
      return NextResponse.json(
        { error: 'Failed to update report status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      report: updatedReport,
    });
  } catch (error) {
    console.error('Mark as found error:', error);
    return NextResponse.json(
      { error: 'Failed to update report status' },
      { status: 500 }
    );
  }
}

