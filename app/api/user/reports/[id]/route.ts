import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAnonymousUserIdFromCookies } from '@/lib/utils/anonymousUser';
import { cookies } from 'next/headers';
import { z } from 'zod';

const updateMissingPersonSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  age: z.number().min(0, 'Age must be at least 0').max(120, 'Age must be at most 120').optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  photoUrl: z.union([z.string().url(), z.literal('')]).optional(),
  lastSeenLocation: z.string().min(2, 'Location must be at least 2 characters').max(200).optional(),
  lastSeenDistrict: z.union([z.string(), z.literal('')]).optional(),
  lastSeenDate: z.string().min(1, 'Date is required').optional(),
  clothing: z.union([z.string().max(500), z.literal('')]).optional(),
  reporterName: z.string().min(2, 'Reporter name must be at least 2 characters').max(100).optional(),
  reporterPhone: z.string().regex(/^0\d{9}$/, 'Phone must be 10 digits starting with 0').optional(),
});

/**
 * PUT /api/user/reports/[id]
 * Update a missing person report (only if user owns it)
 */
export async function PUT(
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
      .select('anonymous_user_id')
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
        { error: 'Unauthorized: You can only edit your own reports' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Normalize photoUrl - if empty string, set to null
    if (body.photoUrl === '') {
      body.photoUrl = null;
    }

    // Validate request data
    const validated = updateMissingPersonSchema.parse(body);

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (validated.fullName !== undefined) updateData.full_name = validated.fullName;
    if (validated.age !== undefined) updateData.age = validated.age;
    if (validated.gender !== undefined) updateData.gender = validated.gender;
    if (validated.photoUrl !== undefined) updateData.photo_url = validated.photoUrl || null;
    if (validated.lastSeenLocation !== undefined) updateData.last_seen_location = validated.lastSeenLocation;
    if (validated.lastSeenDistrict !== undefined) updateData.last_seen_district = validated.lastSeenDistrict || null;
    if (validated.lastSeenDate !== undefined) updateData.last_seen_date = validated.lastSeenDate || null;
    if (validated.clothing !== undefined) updateData.clothing = validated.clothing || null;
    if (validated.reporterName !== undefined) updateData.reporter_name = validated.reporterName;
    if (validated.reporterPhone !== undefined) updateData.reporter_phone = validated.reporterPhone;

    // Update the report
    const { data: updatedReport, error: updateError } = await supabase
      .from('missing_persons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating report:', updateError);
      return NextResponse.json(
        { error: 'Failed to update report' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      report: updatedReport,
    });
  } catch (error) {
    console.error('Update report error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/reports/[id]
 * Delete a missing person report (only if user owns it)
 */
export async function DELETE(
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
      .select('anonymous_user_id')
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
        { error: 'Unauthorized: You can only delete your own reports' },
        { status: 403 }
      );
    }

    // Delete the report
    const { error: deleteError } = await supabase
      .from('missing_persons')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting report:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete report' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}

