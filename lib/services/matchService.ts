import { createClient } from '@/utils/supabase/server';
import { calculateNameSimilarity } from '@/lib/utils/nameSimilarity';
import { generateId } from '@/lib/utils/helpers';
import { sendMatchNotification } from './notificationService';
import { logger } from '@/lib/utils/logger';

export interface MatchResult {
  missingPersonId: string;
  posterCode: string;
  fullName: string;
  age: number;
  gender: string;
  photoUrl: string | null;
  lastSeenLocation: string;
  reporterPhone: string;
  matchScore: number;
  matchReasons: string[];
}

export interface PersonData {
  fullName: string;
  age: number;
  gender: string;
  nic?: string;
}

/**
 * Find potential matches for a registered person against missing person reports
 */
export async function findMatches(personData: PersonData): Promise<MatchResult[]> {
  try {
    const supabase = await createClient();
    
    // Fetch all active missing person reports
    const { data: missingPersons, error } = await supabase
      .from('missing_persons')
      .select('*')
      .eq('status', 'MISSING');

    if (error) throw error;
    if (!missingPersons) return [];

    const matches: MatchResult[] = [];

    for (const missing of missingPersons) {
      let matchScore = 0;
      const matchReasons: string[] = [];

      // 1. NIC exact match (highest priority)
      if (personData.nic && missing.nic && personData.nic === missing.nic) {
        matchScore += 100;
        matchReasons.push('NIC matches exactly');
      }

      // 2. Name similarity (fuzzy matching)
      const nameSimilarity = calculateNameSimilarity(personData.fullName, missing.full_name);

      if (nameSimilarity > 0.7) {
        matchScore += nameSimilarity * 50;
        matchReasons.push(`Name similarity: ${Math.round(nameSimilarity * 100)}%`);
      }

      // 3. Age match (within ±2 years)
      const ageDiff = Math.abs(personData.age - missing.age);
      if (ageDiff <= 2) {
        matchScore += (3 - ageDiff) * 10;
        if (ageDiff === 0) {
          matchReasons.push('Age matches exactly');
        } else {
          matchReasons.push(`Age within ${ageDiff} year(s)`);
        }
      }

      // 4. Gender match
      if (personData.gender === missing.gender) {
        matchScore += 10;
        matchReasons.push('Gender matches');
      }

      // Only include if match score is above threshold (70)
      if (matchScore >= 70) {
        matches.push({
          missingPersonId: missing.id,
          posterCode: missing.poster_code,
          fullName: missing.full_name,
          age: missing.age,
          gender: missing.gender,
          photoUrl: missing.photo_url,
          lastSeenLocation: missing.last_seen_location,
          reporterPhone: missing.reporter_phone,
          matchScore: Math.round(matchScore),
          matchReasons,
        });
      }
    }

    // Sort by match score (highest first) and return top 5
    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
  } catch (error) {
    console.error('Match finding error:', error);
    return [];
  }
}

/**
 * Send notifications for matches found during registration
 * This function handles duplicate prevention and creates match records
 */
export async function sendNotificationsForMatches(
  personId: string,
  personName: string,
  matches: MatchResult[],
  shelterId: string
): Promise<void> {
  if (!matches || matches.length === 0) {
    return;
  }

  try {
    const supabase = await createClient();

    // Fetch shelter details including contact number
    const { data: shelter, error: shelterError } = await supabase
      .from('shelters')
      .select('name, contact_number')
      .eq('id', shelterId)
      .single();

    if (shelterError || !shelter) {
      logger.error('Failed to fetch shelter details for notifications', new Error(shelterError?.message || 'Shelter not found'), {
        shelterId,
        personId,
      });
      return;
    }

    const now = new Date().toISOString();

    // Process each match
    for (const match of matches) {
      try {
        // Check if match record already exists and if notification was sent
        const { data: existingMatch } = await supabase
          .from('matches')
          .select('id, notification_sent')
          .eq('person_id', personId)
          .eq('missing_person_id', match.missingPersonId)
          .single();

        // Skip if notification already sent
        if (existingMatch?.notification_sent) {
          logger.debug('Notification already sent for this match', {
            personId,
            missingPersonId: match.missingPersonId,
            posterCode: match.posterCode,
          });
          continue;
        }

        // Create or update match record
        let matchId: string;
        if (existingMatch) {
          matchId = existingMatch.id;
        } else {
          matchId = generateId();
          const { error: insertError } = await supabase
            .from('matches')
            .insert({
              id: matchId,
              created_at: now,
              person_id: personId,
              missing_person_id: match.missingPersonId,
              match_score: match.matchScore,
              matched_at: now,
              matched_by: 'AUTOMATIC',
              notification_sent: false,
            });

          if (insertError) {
            logger.error('Failed to create match record', insertError, {
              personId,
              missingPersonId: match.missingPersonId,
            });
            continue;
          }
        }

        // Send SMS notification
        const notificationResult = await sendMatchNotification({
          personName,
          shelterName: shelter.name,
          shelterContactNumber: shelter.contact_number,
          posterCode: match.posterCode,
          reporterPhone: match.reporterPhone,
          locale: 'en', // Default to English, can be enhanced later
        });

        // Update match record with notification status
        const updateData: {
          notification_sent: boolean;
          notified_at?: string;
        } = {
          notification_sent: notificationResult.success,
        };

        if (notificationResult.success) {
          updateData.notified_at = now;
        }

        const { error: updateError } = await supabase
          .from('matches')
          .update(updateData)
          .eq('id', matchId);

        if (updateError) {
          logger.error('Failed to update match notification status', updateError, {
            matchId,
            personId,
            missingPersonId: match.missingPersonId,
          });
        }

        if (!notificationResult.success) {
          logger.warn('Failed to send match notification', new Error(notificationResult.error || 'Unknown error'), {
            personId,
            missingPersonId: match.missingPersonId,
            reporterPhone: match.reporterPhone,
          });
        }
      } catch (error) {
        // Log error but continue with other matches
        logger.error('Error processing match notification', error as Error, {
          personId,
          missingPersonId: match.missingPersonId,
          posterCode: match.posterCode,
        });
      }
    }
  } catch (error) {
    logger.error('Error in sendNotificationsForMatches', error as Error, {
      personId,
      shelterId,
      matchCount: matches.length,
    });
    // Don't throw - we don't want to fail registration if notifications fail
  }
}

/**
 * Create a match record after manual confirmation
 */
export async function createMatch(
  personId: string,
  missingPersonId: string,
  matchScore: number
): Promise<void> {
  try {
    const supabase = await createClient();

    // Generate unique ID
    const id = generateId();
    const now = new Date().toISOString();

    // Create match record
    const { error: matchError } = await supabase
      .from('matches')
      .insert({
        id: id,
        created_at: now,
        person_id: personId,
        missing_person_id: missingPersonId,
        match_score: matchScore,
        matched_at: now,
        matched_by: 'MANUAL',
      });

    if (matchError) throw matchError;

    // Update missing person status
    const { error: missingError } = await supabase
      .from('missing_persons')
      .update({ status: 'FOUND' })
      .eq('id', missingPersonId);

    if (missingError) throw missingError;

    // Link person to missing report
    const { error: personError } = await supabase
      .from('persons')
      .update({ missing_report_id: missingPersonId })
      .eq('id', personId);

    if (personError) throw personError;
  } catch (error) {
    console.error('Create match error:', error);
    throw error;
  }
}
