-- Migration: Convert all column names from camelCase to snake_case
-- Date: 2024-12-05
-- Description:
--   Aligns database column names with Supabase/PostgreSQL conventions
--   Ensures compatibility with Supabase client queries

-- ============================================================================
-- MISSING_PERSONS TABLE
-- ============================================================================

-- Rename columns from camelCase to snake_case
ALTER TABLE missing_persons RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE missing_persons RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE missing_persons RENAME COLUMN "fullName" TO full_name;
ALTER TABLE missing_persons RENAME COLUMN "photoUrl" TO photo_url;
ALTER TABLE missing_persons RENAME COLUMN "photoPublicId" TO photo_public_id;
ALTER TABLE missing_persons RENAME COLUMN "lastSeenLocation" TO last_seen_location;
ALTER TABLE missing_persons RENAME COLUMN "lastSeenDistrict" TO last_seen_district;
ALTER TABLE missing_persons RENAME COLUMN "lastSeenDate" TO last_seen_date;
ALTER TABLE missing_persons RENAME COLUMN "reporterName" TO reporter_name;
ALTER TABLE missing_persons RENAME COLUMN "reporterPhone" TO reporter_phone;
ALTER TABLE missing_persons RENAME COLUMN "altContact" TO alt_contact;
ALTER TABLE missing_persons RENAME COLUMN "posterCode" TO poster_code;
ALTER TABLE missing_persons RENAME COLUMN "posterUrl" TO poster_url;

-- ============================================================================
-- PERSONS TABLE
-- ============================================================================

ALTER TABLE persons RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE persons RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE persons RENAME COLUMN "fullName" TO full_name;
ALTER TABLE persons RENAME COLUMN "contactNumber" TO contact_number;
ALTER TABLE persons RENAME COLUMN "shelterId" TO shelter_id;
ALTER TABLE persons RENAME COLUMN "healthStatus" TO health_status;
ALTER TABLE persons RENAME COLUMN "specialNotes" TO special_notes;
ALTER TABLE persons RENAME COLUMN "photoUrl" TO photo_url;
ALTER TABLE persons RENAME COLUMN "photoPublicId" TO photo_public_id;
ALTER TABLE persons RENAME COLUMN "missingReportId" TO missing_report_id;
ALTER TABLE persons RENAME COLUMN "matchedAt" TO matched_at;

-- ============================================================================
-- SHELTERS TABLE
-- ============================================================================

ALTER TABLE shelters RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE shelters RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE shelters RENAME COLUMN "contactPerson" TO contact_person;
ALTER TABLE shelters RENAME COLUMN "contactNumber" TO contact_number;
ALTER TABLE shelters RENAME COLUMN "currentCount" TO current_count;
ALTER TABLE shelters RENAME COLUMN "isActive" TO is_active;

-- ============================================================================
-- SHELTER_AUTH TABLE
-- ============================================================================

ALTER TABLE shelter_auth RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE shelter_auth RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE shelter_auth RENAME COLUMN "shelterId" TO shelter_id;
ALTER TABLE shelter_auth RENAME COLUMN "accessCode" TO access_code;
ALTER TABLE shelter_auth RENAME COLUMN "lastAccessAt" TO last_access_at;
ALTER TABLE shelter_auth RENAME COLUMN "accessCount" TO access_count;

-- ============================================================================
-- MATCHES TABLE
-- ============================================================================

ALTER TABLE matches RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE matches RENAME COLUMN "matchedAt" TO matched_at;
ALTER TABLE matches RENAME COLUMN "missingPersonId" TO missing_person_id;
ALTER TABLE matches RENAME COLUMN "personId" TO person_id;
ALTER TABLE matches RENAME COLUMN "matchScore" TO match_score;
ALTER TABLE matches RENAME COLUMN "matchedBy" TO matched_by;
ALTER TABLE matches RENAME COLUMN "confirmedAt" TO confirmed_at;
ALTER TABLE matches RENAME COLUMN "confirmedBy" TO confirmed_by;
ALTER TABLE matches RENAME COLUMN "notificationSent" TO notification_sent;
ALTER TABLE matches RENAME COLUMN "notifiedAt" TO notified_at;

-- ============================================================================
-- STATISTICS TABLE
-- ============================================================================

ALTER TABLE statistics RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE statistics RENAME COLUMN "totalPersons" TO total_persons;
ALTER TABLE statistics RENAME COLUMN "totalShelters" TO total_shelters;
ALTER TABLE statistics RENAME COLUMN "activeShelters" TO active_shelters;
ALTER TABLE statistics RENAME COLUMN "totalMissing" TO total_missing;
ALTER TABLE statistics RENAME COLUMN "totalMatches" TO total_matches;
ALTER TABLE statistics RENAME COLUMN "byDistrict" TO by_district;
