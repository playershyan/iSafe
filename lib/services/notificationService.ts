/**
 * Notification Service for Match Alerts
 * Sends SMS notifications to missing person reporters when potential matches are found
 */

import { textlkService } from './textlkService';
import { logger } from '@/lib/utils/logger';

export interface MatchNotificationData {
  personName: string;
  shelterName: string;
  shelterContactNumber: string | null;
  posterCode: string;
  reporterPhone: string;
  locale?: string;
}

/**
 * Send SMS notification to missing person reporter about a potential match
 */
export async function sendMatchNotification(
  data: MatchNotificationData
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const { personName, shelterName, shelterContactNumber, posterCode, reporterPhone, locale = 'en' } = data;

    // Get app URL from environment
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://isafe.lk');
    
    // Build the link to view details
    const viewLink = `${appUrl}/search?poster=${posterCode}`;

    // Format shelter contact info
    const shelterContact = shelterContactNumber 
      ? `Contact: ${shelterContactNumber}` 
      : 'Contact the shelter directly for more information';

    // Build message based on locale
    let message: string;
    
    if (locale === 'si') {
      // Sinhala message
      message = `iSafe: ${personName} නම් පුද්ගලයෙකු ${shelterName} ශරණාගාරයට ඇතුළත් වී ඇත. ${shelterContact}. විස්තර: ${viewLink}\n\nමෙය හැකි ගැලපීමක් විය හැක. කරුණාකර සත්‍යාපනය කරන්න.`;
    } else if (locale === 'ta') {
      // Tamil message
      message = `iSafe: ${personName} என்பவர் ${shelterName} தஞ்சமிடத்தில் சேர்க்கப்பட்டுள்ளார். ${shelterContact}. விவரங்கள்: ${viewLink}\n\nஇது சாத்தியமான பொருத்தமாக இருக்கலாம். தயவுசெய்து சரிபார்க்கவும்.`;
    } else {
      // English message (default)
      message = `iSafe: Potential match found. ${personName} has been admitted to ${shelterName}. ${shelterContact}. View details: ${viewLink}\n\nThis is a potential match, please verify.`;
    }

    // Send SMS
    const result = await textlkService.sendSMS({
      to: reporterPhone,
      message,
    });

    if (result.success) {
      logger.info('Match notification sent successfully', {
        reporterPhone,
        posterCode,
        personName,
        shelterName,
        messageId: result.messageId,
      });
    } else {
      logger.error('Failed to send match notification', new Error(result.error || 'Unknown error'), {
        reporterPhone,
        posterCode,
        personName,
        shelterName,
      });
    }

    return result;
  } catch (error) {
    logger.error('Error sending match notification', error as Error, {
      reporterPhone: data.reporterPhone,
      posterCode: data.posterCode,
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

