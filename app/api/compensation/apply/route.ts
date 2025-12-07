/**
 * API Route: Submit Compensation Application
 * POST /api/compensation/apply
 */

import { NextRequest, NextResponse } from 'next/server';
import { compensationApplicationSchema } from '@/lib/utils/validation';
import { createApplication, markSmsSent } from '@/lib/services/compensationService';
import { z } from 'zod';
import { textlkService } from '@/lib/services/textlkService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = compensationApplicationSchema.parse(body);

    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || undefined;

    // Create application
    const { success, application, error } = await createApplication({
      applicantName: validated.applicantName,
      applicantNic: validated.applicantNic,
      applicantPhone: validated.applicantPhone,
      applicantAddress: validated.applicantAddress,
      district: validated.district,
      divisionalSecretariat: validated.divisionalSecretariat,
      gramaNiladhariDivision: validated.gramaNiladhariDivision,
      claims: validated.claims,
      phoneVerified: validated.phoneVerified,
      submittedFromIp: ip,
    });

    if (!success || !application) {
      return NextResponse.json(
        { error: error || 'Failed to create application' },
        { status: 500 }
      );
    }

    // Send confirmation SMS (non-blocking)
    sendConfirmationSms(
      application.applicant_phone,
      application.application_code,
      application.id
    ).catch((err) => {
      console.error('Failed to send confirmation SMS:', err);
    });

    return NextResponse.json({
      success: true,
      applicationCode: application.application_code,
      applicationId: application.id,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Application submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Send confirmation SMS to applicant
 */
async function sendConfirmationSms(
  phone: string,
  applicationCode: string,
  applicationId: string
): Promise<void> {
  try {
    // Format message
    const message = `Your disaster compensation application has been submitted successfully. Application Code: ${applicationCode}. The relevant authorities will contact you if you are eligible. For inquiries: Ministry of Defence 011-2430860, Disaster Management Centre 117.`;

    // Send SMS
    const result = await textlkService.sendSMS({
      to: phone,
      message,
    });

    if (result.success) {
      // Mark SMS as sent
      await markSmsSent(applicationId);
    }
  } catch (error) {
    console.error('Error sending confirmation SMS:', error);
    // Don't throw - this is non-critical
  }
}
