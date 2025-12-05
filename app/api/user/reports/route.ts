import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAnonymousUserIdFromCookies } from '@/lib/utils/anonymousUser';
import { cookies } from 'next/headers';

/**
 * GET /api/user/reports
 * Get all reports for the anonymous user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const cookieStore = await cookies();
    
    // Get anonymous user ID from cookies
    const anonymousUserId = getAnonymousUserIdFromCookies(cookieStore);
    
    if (!anonymousUserId) {
      return NextResponse.json(
        { error: 'No anonymous user ID found' },
        { status: 401 }
      );
    }

    // Fetch all reports for this anonymous user
    const { data: reports, error } = await supabase
      .from('missing_persons')
      .select('*')
      .eq('anonymous_user_id', anonymousUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user reports:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reports: reports || [],
    });
  } catch (error) {
    console.error('Get user reports error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

