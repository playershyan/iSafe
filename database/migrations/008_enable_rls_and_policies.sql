-- =====================================================
-- Enable Row Level Security (RLS) and Create Policies
-- Created: 2025-12-07
-- Purpose: Enable RLS on all tables for security
--          Note: Service role key bypasses RLS, but this
--          provides security for anon/authenticated users
-- =====================================================

-- =====================================================
-- 1. MISSING PERSONS TABLE
-- =====================================================
ALTER TABLE missing_persons ENABLE ROW LEVEL SECURITY;

-- Public can read active missing person reports
CREATE POLICY "Public can read missing persons"
  ON missing_persons
  FOR SELECT
  TO public
  USING (status = 'MISSING' OR status = 'FOUND');

-- Service role can do everything (bypasses RLS, but explicit for clarity)
CREATE POLICY "Service role full access to missing_persons"
  ON missing_persons
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 2. PERSONS TABLE
-- =====================================================
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;

-- Service role only (shelter staff operations)
CREATE POLICY "Service role full access to persons"
  ON persons
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 3. SHELTERS TABLE
-- =====================================================
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;

-- Public can read active shelters
CREATE POLICY "Public can read active shelters"
  ON shelters
  FOR SELECT
  TO public
  USING (is_active = true);

-- Service role full access
CREATE POLICY "Service role full access to shelters"
  ON shelters
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 4. SHELTER_AUTH TABLE
-- =====================================================
ALTER TABLE shelter_auth ENABLE ROW LEVEL SECURITY;

-- Service role only (sensitive authentication data)
CREATE POLICY "Service role full access to shelter_auth"
  ON shelter_auth
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 5. MATCHES TABLE
-- =====================================================
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Service role only
CREATE POLICY "Service role full access to matches"
  ON matches
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 6. STATISTICS TABLE
-- =====================================================
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;

-- Public can read statistics
CREATE POLICY "Public can read statistics"
  ON statistics
  FOR SELECT
  TO public
  USING (true);

-- Service role can update
CREATE POLICY "Service role can update statistics"
  ON statistics
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Service role can insert
CREATE POLICY "Service role can insert statistics"
  ON statistics
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- =====================================================
-- 7. DISTRICTS TABLE
-- =====================================================
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

-- Public can read districts (reference data)
CREATE POLICY "Public can read districts"
  ON districts
  FOR SELECT
  TO public
  USING (true);

-- Service role full access
CREATE POLICY "Service role full access to districts"
  ON districts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 8. ADMINISTRATIVE_DIVISIONS TABLE
-- =====================================================
ALTER TABLE administrative_divisions ENABLE ROW LEVEL SECURITY;

-- Public can read administrative divisions (reference data)
CREATE POLICY "Public can read administrative_divisions"
  ON administrative_divisions
  FOR SELECT
  TO public
  USING (true);

-- Service role full access
CREATE POLICY "Service role full access to administrative_divisions"
  ON administrative_divisions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 9. COMPENSATION_APPLICATIONS TABLE
-- =====================================================
ALTER TABLE compensation_applications ENABLE ROW LEVEL SECURITY;

-- Public can insert (submit applications)
CREATE POLICY "Public can insert compensation applications"
  ON compensation_applications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Service role full access (admin operations)
CREATE POLICY "Service role full access to compensation_applications"
  ON compensation_applications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 10. COMPENSATION_CLAIMS TABLE
-- =====================================================
ALTER TABLE compensation_claims ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access to compensation_claims"
  ON compensation_claims
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 11. COMPENSATION_ADMINS TABLE
-- =====================================================
ALTER TABLE compensation_admins ENABLE ROW LEVEL SECURITY;

-- Service role only (sensitive admin data)
CREATE POLICY "Service role full access to compensation_admins"
  ON compensation_admins
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 12. STAFF_CENTERS TABLE
-- =====================================================
ALTER TABLE staff_centers ENABLE ROW LEVEL SECURITY;

-- Service role only
CREATE POLICY "Service role full access to staff_centers"
  ON staff_centers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 13. STAFF_AUTH TABLE
-- =====================================================
ALTER TABLE staff_auth ENABLE ROW LEVEL SECURITY;

-- Service role only (sensitive authentication data)
CREATE POLICY "Service role full access to staff_auth"
  ON staff_auth
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 14. PHONE_VERIFICATIONS TABLE
-- =====================================================
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;

-- Service role only (sensitive OTP data)
CREATE POLICY "Service role full access to phone_verifications"
  ON phone_verifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- NOTES
-- =====================================================
-- 
-- Security Model:
-- - Service role key bypasses RLS (all operations allowed)
-- - Public/anonymous users have limited read access where appropriate
-- - All sensitive operations require service role key
-- 
-- Tables with public read access:
-- - missing_persons (active reports only)
-- - shelters (active only)
-- - statistics
-- - districts (reference data)
-- - administrative_divisions (reference data)
--
-- Tables with public insert:
-- - compensation_applications (form submissions)
--
-- Tables restricted to service role only:
-- - persons, shelter_auth, matches, compensation_admins,
--   staff_centers, staff_auth, phone_verifications,
--   compensation_claims
--
-- The application uses SUPABASE_SERVICE_ROLE_KEY for all API
-- operations, so RLS policies primarily protect against direct
-- database access or if anon key is accidentally exposed.

