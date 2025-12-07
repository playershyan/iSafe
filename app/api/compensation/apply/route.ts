/**
 * API Route: Submit Compensation Application
 * POST /api/compensation/apply
 */

import { NextRequest, NextResponse } from 'next/server';
import { compensationApplicationSchema } from '@/lib/utils/validation';
import { createApplication, markSmsSent } from '@/lib/services/compensationService';
import { z } from 'zod';
import { textlkService } from '@/lib/services/textlkService';
// Static imports for translations (Next.js can analyze these)
import enMessages from '@/messages/en.json';
import siMessages from '@/messages/si.json';
import taMessages from '@/messages/ta.json';

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
      locale: validated.locale || 'en',
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
      application.id,
      application.locale || 'en'
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
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Application submission error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Send confirmation SMS to applicant
 * Uses locale from application to send message in the correct language
 */
async function sendConfirmationSms(
  phone: string,
  applicationCode: string,
  applicationId: string,
  locale: string = 'en'
): Promise<void> {
  try {
    // Get messages based on locale (using static imports for Next.js compatibility)
    let messages: any;
    switch (locale) {
      case 'si':
        messages = siMessages;
        break;
      case 'ta':
        messages = taMessages;
        break;
      case 'en':
      default:
        messages = enMessages;
        break;
    }

    // Get SMS message template from translations
    const messageTemplate = messages?.compensation?.success?.smsMessage;
    
    if (!messageTemplate || typeof messageTemplate !== 'string') {
      // Fallback to English if translation missing
      console.warn(`SMS message translation missing for locale: ${locale}, using English`);
      const fallbackMessage = enMessages?.compensation?.success?.smsMessage || 
        `Your disaster compensation application has been submitted successfully. Application Code: ${applicationCode}. The relevant authorities will contact you if you are eligible. For inquiries: Ministry of Defence 011-2430860, Disaster Management Centre 117.`;
      
      const message = fallbackMessage.replace('{applicationCode}', applicationCode);
      
      const result = await textlkService.sendSMS({
        to: phone,
        message,
      });

      if (result.success) {
        await markSmsSent(applicationId);
      }
      return;
    }

    // Replace placeholder with actual application code
    const message = messageTemplate.replace('{applicationCode}', applicationCode);

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
