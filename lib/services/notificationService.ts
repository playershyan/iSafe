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

    // Load translations manually (getTranslations requires request context)
    // Use a function to load the correct translation file
    const loadMessages = async (loc: string): Promise<any> => {
      try {
        // Try dynamic import with the locale - try both relative and @ alias paths
        let messages;
        const importPath = `@/messages/${loc}.json`;
        const relativePath = `../../messages/${loc}.json`;
        
        try {
          // First try with @ alias
          messages = (await import(importPath)).default;
        } catch (aliasError) {
          // Fallback to relative path
          try {
            messages = (await import(relativePath)).default;
          } catch (relativeError) {
            // If both fail, try English
            if (loc !== 'en') {
              const aliasErr = aliasError instanceof Error ? aliasError : new Error(String(aliasError));
              const relativeErr = relativeError instanceof Error ? relativeError : new Error(String(relativeError));
              logger.warn('Failed to load locale, trying English', aliasErr, { 
                locale: loc, 
                aliasError: aliasErr.message, 
                relativeError: relativeErr.message 
              });
              return await loadMessages('en');
            }
            throw new Error(`Failed to load translations for locale: ${loc}`);
          }
        }
        
        // Validate that messages loaded correctly
        if (!messages || typeof messages !== 'object') {
          throw new Error(`Invalid messages structure for locale: ${loc}`);
        }
        
        return messages;
      } catch (error) {
        logger.error('Failed to load translations, falling back to English', error as Error, { locale: loc });
        // Always try to load English as fallback
        if (loc !== 'en') {
          try {
            return await loadMessages('en');
          } catch (fallbackError) {
            logger.error('Failed to load English fallback translations', fallbackError as Error);
            throw new Error('Unable to load any translation files');
          }
        }
        throw error;
      }
    };

    let messages: any;
    try {
      messages = await loadMessages(locale);
      logger.debug('Loaded translations successfully', { locale, hasNotifications: !!messages.notifications });
    } catch (error) {
      logger.error('Failed to load translations, using English fallback', error as Error, { locale });
      messages = await loadMessages('en');
    }

    // Validate messages structure
    if (!messages || !messages.notifications) {
      logger.error('Invalid messages structure - missing notifications', undefined, { 
        locale, 
        hasMessages: !!messages,
        hasNotifications: !!messages?.notifications 
      });
      throw new Error('Invalid translation structure');
    }

    // Get translation template
    const messageTemplate = shelterContactNumber 
      ? messages.notifications.matchFound
      : messages.notifications.matchFoundNoContact;

    // Validate template exists
    if (!messageTemplate || typeof messageTemplate !== 'string') {
      logger.warn('Translation template not found or invalid, using English fallback', undefined, { 
        locale, 
        hasContact: !!shelterContactNumber,
        templateType: shelterContactNumber ? 'matchFound' : 'matchFoundNoContact'
      });
      
      const enMessages = await loadMessages('en');
      const fallbackTemplate = shelterContactNumber 
        ? enMessages.notifications?.matchFound
        : enMessages.notifications?.matchFoundNoContact;
      
      if (!fallbackTemplate || typeof fallbackTemplate !== 'string') {
        logger.error('English fallback translation also missing', undefined, {
          hasContact: !!shelterContactNumber
        });
        throw new Error('Failed to load notification translations');
      }
      
      const message = fallbackTemplate
        .replace('{personName}', personName)
        .replace('{shelterName}', shelterName)
        .replace('{shelterContactNumber}', shelterContactNumber || '')
        .replace('{viewLink}', viewLink);
      
      // Send SMS with fallback
      const result = await textlkService.sendSMS({
        to: reporterPhone,
        message,
      });
      return result;
    }
    
    const message = messageTemplate
      .replace('{personName}', personName)
      .replace('{shelterName}', shelterName)
      .replace('{shelterContactNumber}', shelterContactNumber || '')
      .replace('{viewLink}', viewLink);

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

