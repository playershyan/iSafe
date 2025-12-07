import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase/serviceRoleClient';
import { normalizeSriLankaPhone } from '@/lib/utils/phoneFormatter';

/**
 * Admin endpoint to reset OTP rate limit cache
 * DELETE /api/admin/reset-otp-rate-limit?phoneNumber=0771234567
 * 
 * If phoneNumber is provided, resets rate limit for that specific phone number.
 * If no phoneNumber is provided, resets rate limit for all phone numbers.
 * 
 * Deletes all OTP records within the rate limiting window (1 hour) that affect rate limiting
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getServiceRoleClient();
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');
    
    let query = supabase
      .from('phone_verifications')
      .delete()
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());
    
    // If phone number is provided, only reset for that number
    if (phoneNumber) {
      const normalizedPhone = normalizeSriLankaPhone(phoneNumber);
      query = query.eq('phone_number', normalizedPhone);
    }
    
    const { error, count } = await query;
    
    if (error) {
      console.error('Error resetting OTP rate limit:', error);
      return NextResponse.json(
        { error: 'Failed to reset rate limit cache', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: phoneNumber 
        ? `OTP rate limit cache has been reset for ${phoneNumber}`
        : 'OTP rate limit cache has been reset for all phone numbers',
      recordsDeleted: count || 0,
    });
  } catch (error) {
    console.error('Error in reset OTP rate limit:', error);
    return NextResponse.json(
      { error: 'Failed to reset rate limit cache' },
      { status: 500 }
    );
  }
}

