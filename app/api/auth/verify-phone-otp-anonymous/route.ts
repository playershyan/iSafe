import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { normalizeSriLankaPhone, isValidSriLankanPhone } from '@/lib/utils/phoneFormatter'

/**
 * Anonymous Phone OTP Verification API
 * 
 * This endpoint is for anonymous users (missing person reporters) to verify their phone number
 * No authentication required
 */

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otpCode } = await request.json()

    if (!phoneNumber || !otpCode) {
      return NextResponse.json({
        error: 'Phone number and OTP code are required'
      }, { status: 400 })
    }

    // Normalize phone
    const normalizedPhone = normalizeSriLankaPhone(phoneNumber)
    const trimmedOtpCode = otpCode.trim()

    // Validate normalized phone format
    if (!isValidSriLankanPhone(normalizedPhone)) {
      return NextResponse.json({
        error: 'Invalid phone number format'
      }, { status: 400 })
    }

    // Use admin client to bypass RLS for phone_verifications table
    const adminClient = createAdminClient()

    // Find the most recent unverified OTP for this phone number (anonymous - user_id is null)
    const { data: otpRecord, error: otpError } = await adminClient
      .from('phone_verifications')
      .select('*')
      .eq('phone_number', normalizedPhone)
      .eq('otp_code', trimmedOtpCode)
      .eq('verified', false)
      .is('user_id', null) // Anonymous users have null user_id
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpRecord) {
      const otpErrorCode = (otpError as any)?.code
      if (!otpRecord && otpError && (otpErrorCode === 'PGRST116' || otpErrorCode === 'PGRST123')) {
        return NextResponse.json({
          error: 'Invalid or expired verification code'
        }, { status: 400 })
      }

      if (!otpRecord) {
        return NextResponse.json({
          error: 'Invalid or expired verification code'
        }, { status: 400 })
      }

      if (otpError) {
        return NextResponse.json({
          error: 'Verification failed. Please try again.'
        }, { status: 500 })
      }
    }

    // Check attempt limit
    if (otpRecord.attempts >= 3) {
      return NextResponse.json({
        error: 'Too many verification attempts. Please request a new code.'
      }, { status: 400 })
    }

    // Mark as verified
    const { error: updateError } = await adminClient
      .from('phone_verifications')
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
        attempts: (otpRecord.attempts || 0) + 1
      })
      .eq('id', otpRecord.id)

    if (updateError) {
      return NextResponse.json({
        error: 'Verification failed'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
      verified: true
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

