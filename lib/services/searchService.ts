import { createClient } from '@/utils/supabase/server';
import { calculateNameSimilarity } from '@/lib/utils/nameSimilarity';
import { UnifiedSearchResult, SearchStatus } from '@/types';

const NAME_SIMILARITY_THRESHOLD = 0.3; // Lowered to allow more matches

function classifyStatus(
  hasPerson: boolean,
  hasLinkedReport: boolean,
  reportStatus?: string | null,
  hasShelterData?: boolean
): SearchStatus {
  // FOUND_AND_SHELTERED: Person is in shelter (with shelter data) AND has a linked missing report
  if (hasPerson && hasShelterData && hasLinkedReport) {
    return 'FOUND_AND_SHELTERED';
  }

  // SHELTERED: Person is registered into a shelter with shelter data
  if (hasPerson && hasShelterData) {
    return 'SHELTERED';
  }

  // FOUND: Missing person report is marked as found
  if (reportStatus === 'FOUND') {
    return 'FOUND';
  }

  // MISSING: Default status for missing person reports
  return 'MISSING';
}

/**
 * Unified search by name across sheltered persons and missing person reports.
 * Uses basic ILIKE to get candidates, then fuzzy matching for typos.
 */
export async function unifiedSearchByName(query: string): Promise<UnifiedSearchResult[]> {
  try {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const supabase = await createClient();

    const [personsResult, missingReportsResult] = await Promise.all([
      supabase
        .from('persons')
        .select(`
          *,
          shelter:shelters(
            name,
            district,
            contact_number
          ),
          missing_report:missing_persons!persons_missingReportId_fkey(*)
        `)
        .ilike('full_name', `%${trimmed}%`)
        .limit(50),
      supabase
        .from('missing_persons')
        .select(`
          *,
          found_persons:persons(
            *,
            shelter:shelters(
              name,
              district,
              contact_number
            )
          )
        `)
        .ilike('full_name', `%${trimmed}%`)
        .limit(50),
    ]);

    if (personsResult.error) {
      console.error('Persons search error:', {
        message: personsResult.error.message,
        details: personsResult.error.details,
        hint: personsResult.error.hint,
        code: personsResult.error.code,
      });
      throw personsResult.error;
    }
    if (missingReportsResult.error) {
      console.error('Missing reports search error:', {
        message: missingReportsResult.error.message,
        details: missingReportsResult.error.details,
        hint: missingReportsResult.error.hint,
        code: missingReportsResult.error.code,
      });
      throw missingReportsResult.error;
    }

    const persons = personsResult.data || [];
    const missingReports = missingReportsResult.data || [];
    
    console.log(`Search for "${trimmed}": Found ${persons.length} persons, ${missingReports.length} missing reports`);

    const usedMissingIds = new Set<string>();
    const results: UnifiedSearchResult[] = [];

    // First, build results for all persons (sheltered database)
    for (const person of persons) {
      const similarity = calculateNameSimilarity(trimmed, person.full_name);
      if (similarity < NAME_SIMILARITY_THRESHOLD) continue;

      const linkedReport = person.missing_report;
      const hasShelterData = !!person.shelter;
      const status = classifyStatus(
        true,
        !!linkedReport,
        linkedReport ? linkedReport.status : null,
        hasShelterData
      );

      if (linkedReport) {
        usedMissingIds.add(linkedReport.id);
      }

      results.push({
        id: `person-${person.id}`,
        status,
        similarityScore: similarity,
        person: {
          id: person.id,
          fullName: person.full_name,
          age: person.age,
          gender: person.gender,
          nic: person.nic || undefined,
          photoUrl: person.photo_url || undefined,
          shelter: person.shelter
            ? {
                name: person.shelter.name,
                district: person.shelter.district,
                contactNumber: person.shelter.contact_number || undefined,
              }
            : undefined,
          createdAt: new Date(person.created_at),
        },
        missingReport: linkedReport
          ? {
              id: linkedReport.id,
              posterCode: linkedReport.poster_code,
              fullName: linkedReport.full_name,
              age: linkedReport.age,
              gender: linkedReport.gender,
              nic: linkedReport.nic || undefined,
              photoUrl: linkedReport.photo_url || undefined,
              lastSeenLocation: linkedReport.last_seen_location,
              lastSeenDistrict: linkedReport.last_seen_district,
              lastSeenDate: linkedReport.last_seen_date ? new Date(linkedReport.last_seen_date) : undefined,
              clothing: linkedReport.clothing || undefined,
              reporterName: linkedReport.reporter_name,
              reporterPhone: linkedReport.reporter_phone,
              altContact: linkedReport.alt_contact || undefined,
              status: linkedReport.status,
              createdAt: new Date(linkedReport.created_at),
            }
          : undefined,
      });
    }

    // Then add remaining missing reports (no linked sheltered person)
    for (const missing of missingReports) {
      if (usedMissingIds.has(missing.id)) continue;

      const similarity = calculateNameSimilarity(trimmed, missing.full_name);
      if (similarity < NAME_SIMILARITY_THRESHOLD) continue;

      const status = classifyStatus(false, false, missing.status);

      results.push({
        id: `missing-${missing.id}`,
        status,
        similarityScore: similarity,
        missingReport: {
          id: missing.id,
          posterCode: missing.poster_code,
          fullName: missing.full_name,
          age: missing.age,
          gender: missing.gender,
          nic: missing.nic || undefined,
          photoUrl: missing.photo_url || undefined,
          lastSeenLocation: missing.last_seen_location,
          lastSeenDistrict: missing.last_seen_district,
          lastSeenDate: missing.last_seen_date ? new Date(missing.last_seen_date) : undefined,
          clothing: missing.clothing || undefined,
          reporterName: missing.reporter_name,
          reporterPhone: missing.reporter_phone,
          altContact: missing.alt_contact || undefined,
          status: missing.status,
          createdAt: new Date(missing.created_at),
        },
      });
    }

    // Sort by status and similarity (found & sheltered first, then sheltered, found, missing)
    const statusOrder: Record<SearchStatus, number> = {
      FOUND_AND_SHELTERED: 0,
      SHELTERED: 1,
      FOUND: 2,
      MISSING: 3,
    };

    return results
      .sort((a, b) => {
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        return (b.similarityScore || 0) - (a.similarityScore || 0);
      })
      .slice(0, 50);
  } catch (error) {
    console.error('Unified search by name error:', error);
    return [];
  }
}

/**
 * Unified search by NIC across sheltered persons and missing person reports.
 */
export async function unifiedSearchByNIC(nic: string): Promise<UnifiedSearchResult[]> {
  try {
    const normalizedNIC = nic.trim().toUpperCase();
    if (!normalizedNIC) return [];

    const supabase = await createClient();

    const [personsResult, missingReportsResult] = await Promise.all([
      supabase
        .from('persons')
        .select(`
          *,
          shelter:shelters(
            name,
            district,
            contact_number
          ),
          missing_report:missing_persons!persons_missingReportId_fkey(*)
        `)
        .ilike('nic', normalizedNIC)
        .limit(10),
      supabase
        .from('missing_persons')
        .select(`
          *,
          found_persons:persons(
            *,
            shelter:shelters(
              name,
              district,
              contact_number
            )
          )
        `)
        .ilike('nic', normalizedNIC)
        .limit(10),
    ]);

    if (personsResult.error) throw personsResult.error;
    if (missingReportsResult.error) throw missingReportsResult.error;

    const persons = personsResult.data || [];
    const missingReports = missingReportsResult.data || [];

    const usedMissingIds = new Set<string>();
    const results: UnifiedSearchResult[] = [];

    for (const person of persons) {
      const linkedReport = person.missing_report;
      const hasShelterData = !!person.shelter;
      const status = classifyStatus(
        true,
        !!linkedReport,
        linkedReport ? linkedReport.status : null,
        hasShelterData
      );

      if (linkedReport) {
        usedMissingIds.add(linkedReport.id);
      }

      results.push({
        id: `person-${person.id}`,
        status,
        person: {
          id: person.id,
          fullName: person.full_name,
          age: person.age,
          gender: person.gender,
          nic: person.nic || undefined,
          photoUrl: person.photo_url || undefined,
          shelter: person.shelter
            ? {
                name: person.shelter.name,
                district: person.shelter.district,
                contactNumber: person.shelter.contact_number || undefined,
              }
            : undefined,
          createdAt: new Date(person.created_at),
        },
        missingReport: linkedReport
          ? {
              id: linkedReport.id,
              posterCode: linkedReport.poster_code,
              fullName: linkedReport.full_name,
              age: linkedReport.age,
              gender: linkedReport.gender,
              nic: linkedReport.nic || undefined,
              photoUrl: linkedReport.photo_url || undefined,
              lastSeenLocation: linkedReport.last_seen_location,
              lastSeenDistrict: linkedReport.last_seen_district,
              lastSeenDate: linkedReport.last_seen_date ? new Date(linkedReport.last_seen_date) : undefined,
              clothing: linkedReport.clothing || undefined,
              reporterName: linkedReport.reporter_name,
              reporterPhone: linkedReport.reporter_phone,
              altContact: linkedReport.alt_contact || undefined,
              status: linkedReport.status,
              createdAt: new Date(linkedReport.created_at),
            }
          : undefined,
      });
    }

    for (const missing of missingReports) {
      if (usedMissingIds.has(missing.id)) continue;

      const status = classifyStatus(false, false, missing.status);

      results.push({
        id: `missing-${missing.id}`,
        status,
        missingReport: {
          id: missing.id,
          posterCode: missing.poster_code,
          fullName: missing.full_name,
          age: missing.age,
          gender: missing.gender,
          nic: missing.nic || undefined,
          photoUrl: missing.photo_url || undefined,
          lastSeenLocation: missing.last_seen_location,
          lastSeenDistrict: missing.last_seen_district,
          lastSeenDate: missing.last_seen_date ? new Date(missing.last_seen_date) : undefined,
          clothing: missing.clothing || undefined,
          reporterName: missing.reporter_name,
          reporterPhone: missing.reporter_phone,
          altContact: missing.alt_contact || undefined,
          status: missing.status,
          createdAt: new Date(missing.created_at),
        },
      });
    }

    const statusOrder: Record<SearchStatus, number> = {
      FOUND_AND_SHELTERED: 0,
      SHELTERED: 1,
      FOUND: 2,
      MISSING: 3,
    };

    return results.sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return (b.person?.createdAt?.getTime() || 0) - (a.person?.createdAt?.getTime() || 0);
    });
  } catch (error) {
    console.error('Unified search by NIC error:', error);
    return [];
  }
}

