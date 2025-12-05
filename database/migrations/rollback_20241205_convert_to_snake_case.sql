-- Rollback: Convert column names back from snake_case to camelCase
-- Date: 2024-12-05

-- ============================================================================
-- MISSING_PERSONS TABLE
-- ============================================================================

ALTER TABLE missing_persons RENAME COLUMN created_at TO "createdAt";
ALTER TABLE missing_persons RENAME COLUMN updated_at TO "updatedAt";
ALTER TABLE missing_persons RENAME COLUMN full_name TO "fullName";
ALTER TABLE missing_persons RENAME COLUMN photo_url TO "photoUrl";
ALTER TABLE missing_persons RENAME COLUMN photo_public_id TO "photoPublicId";
ALTER TABLE missing_persons RENAME COLUMN last_seen_location TO "lastSeenLocation";
ALTER TABLE missing_persons RENAME COLUMN last_seen_district TO "lastSeenDistrict";
ALTER TABLE missing_persons RENAME COLUMN last_seen_date TO "lastSeenDate";
ALTER TABLE missing_persons RENAME COLUMN reporter_name TO "reporterName";
ALTER TABLE missing_persons RENAME COLUMN reporter_phone TO "reporterPhone";
ALTER TABLE missing_persons RENAME COLUMN alt_contact TO "altContact";
ALTER TABLE missing_persons RENAME COLUMN poster_code TO "posterCode";
ALTER TABLE missing_persons RENAME COLUMN poster_url TO "posterUrl";

-- ============================================================================
-- PERSONS TABLE
-- ============================================================================

ALTER TABLE persons RENAME COLUMN created_at TO "createdAt";
ALTER TABLE persons RENAME COLUMN updated_at TO "updatedAt";
ALTER TABLE persons RENAME COLUMN full_name TO "fullName";
ALTER TABLE persons RENAME COLUMN contact_number TO "contactNumber";
ALTER TABLE persons RENAME COLUMN shelter_id TO "shelterId";
ALTER TABLE persons RENAME COLUMN health_status TO "healthStatus";
ALTER TABLE persons RENAME COLUMN special_notes TO "specialNotes";
ALTER TABLE persons RENAME COLUMN photo_url TO "photoUrl";
ALTER TABLE persons RENAME COLUMN photo_public_id TO "photoPublicId";
ALTER TABLE persons RENAME COLUMN missing_report_id TO "missingReportId";
ALTER TABLE persons RENAME COLUMN matched_at TO "matchedAt";

-- ============================================================================
-- SHELTERS TABLE
-- ============================================================================

ALTER TABLE shelters RENAME COLUMN created_at TO "createdAt";
ALTER TABLE shelters RENAME COLUMN updated_at TO "updatedAt";
ALTER TABLE shelters RENAME COLUMN contact_person TO "contactPerson";
ALTER TABLE shelters RENAME COLUMN contact_number TO "contactNumber";
ALTER TABLE shelters RENAME COLUMN current_count TO "currentCount";
ALTER TABLE shelters RENAME COLUMN is_active TO "isActive";

-- ============================================================================
-- SHELTER_AUTH TABLE
-- ============================================================================

ALTER TABLE shelter_auth RENAME COLUMN created_at TO "createdAt";
ALTER TABLE shelter_auth RENAME COLUMN updated_at TO "updatedAt";
ALTER TABLE shelter_auth RENAME COLUMN shelter_id TO "shelterId";
ALTER TABLE shelter_auth RENAME COLUMN access_code TO "accessCode";
ALTER TABLE shelter_auth RENAME COLUMN last_access_at TO "lastAccessAt";
ALTER TABLE shelter_auth RENAME COLUMN access_count TO "accessCount";

-- ============================================================================
-- MATCHES TABLE
-- ============================================================================

ALTER TABLE matches RENAME COLUMN created_at TO "createdAt";
ALTER TABLE matches RENAME COLUMN matched_at TO "matchedAt";
ALTER TABLE matches RENAME COLUMN missing_person_id TO "missingPersonId";
ALTER TABLE matches RENAME COLUMN person_id TO "personId";
ALTER TABLE matches RENAME COLUMN match_score TO "matchScore";
ALTER TABLE matches RENAME COLUMN matched_by TO "matchedBy";
ALTER TABLE matches RENAME COLUMN confirmed_at TO "confirmedAt";
ALTER TABLE matches RENAME COLUMN confirmed_by TO "confirmedBy";
ALTER TABLE matches RENAME COLUMN notification_sent TO "notificationSent";
ALTER TABLE matches RENAME COLUMN notified_at TO "notifiedAt";

-- ============================================================================
-- STATISTICS TABLE
-- ============================================================================

ALTER TABLE statistics RENAME COLUMN updated_at TO "updatedAt";
ALTER TABLE statistics RENAME COLUMN total_persons TO "totalPersons";
ALTER TABLE statistics RENAME COLUMN total_shelters TO "totalShelters";
ALTER TABLE statistics RENAME COLUMN active_shelters TO "activeShelters";
ALTER TABLE statistics RENAME COLUMN total_missing TO "totalMissing";
ALTER TABLE statistics RENAME COLUMN total_matches TO "totalMatches";
ALTER TABLE statistics RENAME COLUMN by_district TO "byDistrict";
