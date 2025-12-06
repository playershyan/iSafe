import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { textlkService } from '@/lib/services/textlkService'
import { normalizeSriLankaPhone, isValidSriLankanPhone } from '@/lib/utils/phoneFormatter'

/**
 * Anonymous Phone OTP Sending API
 * 
 * This endpoint is for anonymous users (missing person reporters) to verify their phone number
 * No authentication required - uses anonymous user ID from cookie
 */

// Simple OTP generation function
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json({ 
        error: 'Invalid request body',
        message: 'Request body must be valid JSON'
      }, { status: 400 })
    }

    const { phoneNumber, anonymousUserId } = body

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Normalize phone once for all downstream usage
    const normalizedPhone = normalizeSriLankaPhone(phoneNumber)

    // Validate normalized phone format
    if (!isValidSriLankanPhone(normalizedPhone)) {
      return NextResponse.json({
        error: 'Invalid phone number format. Please use Sri Lankan format (e.g., 0771234567)'
      }, { status: 400 })
    }

    // Validate phone number format using Text.lk service
    const isValidPhone = textlkService.validatePhoneNumber(normalizedPhone)
    if (!isValidPhone) {
      return NextResponse.json({
        error: 'Invalid phone number format. Please use Sri Lankan format (e.g., 0771234567)'
      }, { status: 400 })
    }

    // Use admin client to bypass RLS for phone_verifications table
    let adminClient
    try {
      adminClient = createAdminClient()
    } catch (adminError) {
      console.error('Failed to create admin client:', adminError)
      return NextResponse.json({
        error: 'Server configuration error',
        details: process.env.NODE_ENV === 'development' 
          ? (adminError instanceof Error ? adminError.message : 'Unknown error')
          : undefined
      }, { status: 500 })
    }

    // For anonymous users, use anonymousUserId or null
    const userId = anonymousUserId || null

    // Check for rate limiting (max 3 OTPs per hour per phone)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: recentOtps, error: countError } = await adminClient
      .from('phone_verifications')
      .select('id')
      .gte('created_at', oneHourAgo)
      .eq('phone_number', normalizedPhone)
      .is('user_id', null) // Only check anonymous requests (user_id is null)

    if (countError) {
      console.error('Database error checking rate limit:', countError)
      return NextResponse.json({ 
        error: 'Database error',
        details: process.env.NODE_ENV === 'development' ? countError.message : undefined
      }, { status: 500 })
    }

    if (recentOtps && recentOtps.length >= 3) {
      return NextResponse.json({
        error: 'Too many OTP requests. Please wait an hour before requesting again.'
      }, { status: 429 })
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Delete existing pending OTPs for this phone (anonymous)
    await adminClient
      .from('phone_verifications')
      .delete()
      .eq('phone_number', normalizedPhone)
      .is('user_id', null)
      .eq('verified', false)

    // Store OTP in database (user_id is null for anonymous users)
    const { error: insertError } = await adminClient
      .from('phone_verifications')
      .insert({
        user_id: null, // Anonymous users have null user_id
        phone_number: normalizedPhone,
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        verified: false
      })

    if (insertError) {
      console.error('Database error inserting OTP:', insertError)
      return NextResponse.json({
        error: 'Failed to generate OTP',
        details: process.env.NODE_ENV === 'development' 
          ? (insertError.message || JSON.stringify(insertError))
          : undefined
      }, { status: 500 })
    }

    // Send SMS using Text.lk service
    const smsResult = await textlkService.sendOTP(normalizedPhone, otp)

    if (!smsResult.success) {
      // In production, return error
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({
          error: smsResult.error || 'Failed to send SMS'
        }, { status: 500 })
      }
      // In development, continue (OTP is still stored in DB)
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 600 // 10 minutes in seconds
    })

  } catch (error) {
    console.error('Send OTP anonymous error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    // Log full error details for debugging
    if (process.env.NODE_ENV === 'production') {
      console.error('Production error details:', {
        message: errorMessage,
        stack: errorStack,
        name: error instanceof Error ? error.name : undefined
      })
    }

    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      message: 'Failed to send OTP. Please try again.'
    }, { status: 500 })
  }
}

