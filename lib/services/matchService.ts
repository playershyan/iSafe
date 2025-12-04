import { prisma } from '@/lib/db/prisma';

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
    // Fetch all active missing person reports
    const missingPersons = await prisma.missingPerson.findMany({
      where: {
        status: 'MISSING',
      },
    });

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
      const nameSimilarity = calculateNameSimilarity(
        personData.fullName.toLowerCase(),
        missing.fullName.toLowerCase()
      );

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
          posterCode: missing.posterCode,
          fullName: missing.fullName,
          age: missing.age,
          gender: missing.gender,
          photoUrl: missing.photoUrl,
          lastSeenLocation: missing.lastSeenLocation,
          reporterPhone: missing.reporterPhone,
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
 * Calculate name similarity using Levenshtein distance
 */
function calculateNameSimilarity(name1: string, name2: string): number {
  const len1 = name1.length;
  const len2 = name2.length;

  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;

  // Create a 2D array for dynamic programming
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Calculate Levenshtein distance
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = name1[i - 1] === name2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);

  // Convert distance to similarity score (0-1)
  return 1 - distance / maxLen;
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
    await prisma.$transaction(async (tx) => {
      // Create match record
      await tx.match.create({
        data: {
          personId,
          missingPersonId,
          matchScore,
          matchedAt: new Date(),
        },
      });

      // Update missing person status
      await tx.missingPerson.update({
        where: { id: missingPersonId },
        data: { status: 'FOUND' },
      });

      // Link person to missing report
      await tx.person.update({
        where: { id: personId },
        data: { missingReportId: missingPersonId },
      });
    });
  } catch (error) {
    console.error('Create match error:', error);
    throw error;
  }
}
