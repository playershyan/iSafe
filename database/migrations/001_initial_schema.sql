-- =====================================================
-- Initial Database Schema Migration
-- Created: 2025-12-07
-- Purpose: Create all core tables for the iSafe platform
--          This includes missing persons, persons, shelters,
--          matches, and statistics tables
-- =====================================================

-- =====================================================
-- 1. MISSING PERSONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS missing_persons (
  id VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Person Details
  full_name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
  nic VARCHAR(12),
  photo_url TEXT,
  photo_public_id VARCHAR(255),
  
  -- Last Known Information
  last_seen_location VARCHAR(255) NOT NULL,
  last_seen_district VARCHAR(100),
  last_seen_date DATE,
  clothing TEXT,
  
  -- Reporter Information
  reporter_name VARCHAR(255) NOT NULL,
  reporter_phone VARCHAR(15) NOT NULL,
  alt_contact VARCHAR(15),
  
  -- Status and Metadata
  status VARCHAR(20) DEFAULT 'MISSING' CHECK (status IN ('MISSING', 'FOUND', 'CLOSED')),
  poster_code VARCHAR(50) UNIQUE NOT NULL,
  poster_url TEXT,
  locale VARCHAR(10) DEFAULT 'en',
  anonymous_user_id VARCHAR(255)
);

-- Indexes for missing_persons
CREATE INDEX IF NOT EXISTS idx_missing_persons_full_name ON missing_persons(full_name);
CREATE INDEX IF NOT EXISTS idx_missing_persons_poster_code ON missing_persons(poster_code);
CREATE INDEX IF NOT EXISTS idx_missing_persons_status ON missing_persons(status);
CREATE INDEX IF NOT EXISTS idx_missing_persons_nic ON missing_persons(nic);
CREATE INDEX IF NOT EXISTS idx_missing_persons_last_seen_district ON missing_persons(last_seen_district);
CREATE INDEX IF NOT EXISTS idx_missing_persons_created_at ON missing_persons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_missing_persons_anonymous_user_id ON missing_persons(anonymous_user_id);

-- =====================================================
-- 2. DISTRICTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS districts (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(100) NOT NULL,
  name_sinhala VARCHAR(100),
  name_tamil VARCHAR(100),
  province VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_districts_name ON districts(name);

-- =====================================================
-- 3. ADMINISTRATIVE DIVISIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS administrative_divisions (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  district VARCHAR(100) NOT NULL,
  divisional_secretariat VARCHAR(100) NOT NULL,
  grama_niladhari_division VARCHAR(100) NOT NULL,
  gn_code VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_admin_divisions_district ON administrative_divisions(district);
CREATE INDEX IF NOT EXISTS idx_admin_divisions_ds ON administrative_divisions(divisional_secretariat);
CREATE INDEX IF NOT EXISTS idx_admin_divisions_gn ON administrative_divisions(grama_niladhari_division);

-- =====================================================
-- 4. SHELTERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS shelters (
  id VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Basic Information
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  district VARCHAR(100) NOT NULL,
  address TEXT,
  
  -- Contact Information
  contact_person VARCHAR(255),
  contact_number VARCHAR(15),
  
  -- Capacity
  capacity INTEGER,
  current_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for shelters
CREATE INDEX IF NOT EXISTS idx_shelters_code ON shelters(code);
CREATE INDEX IF NOT EXISTS idx_shelters_district ON shelters(district);
CREATE INDEX IF NOT EXISTS idx_shelters_is_active ON shelters(is_active);

-- =====================================================
-- 5. SHELTER AUTH TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS shelter_auth (
  id VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  shelter_id VARCHAR(255) UNIQUE NOT NULL,
  access_code VARCHAR(255) NOT NULL,
  
  -- Audit Fields
  last_access_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  
  FOREIGN KEY (shelter_id) REFERENCES shelters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_shelter_auth_shelter_id ON shelter_auth(shelter_id);
CREATE INDEX IF NOT EXISTS idx_shelter_auth_access_code ON shelter_auth(access_code);

-- =====================================================
-- 6. PERSONS TABLE (Registered at Shelters)
-- =====================================================
CREATE TABLE IF NOT EXISTS persons (
  id VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Basic Information
  full_name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
  nic VARCHAR(12),
  contact_number VARCHAR(15),
  
  -- Shelter Information
  shelter_id VARCHAR(255) NOT NULL,
  
  -- Health Status
  health_status VARCHAR(20) DEFAULT 'HEALTHY' CHECK (health_status IN ('HEALTHY', 'MINOR_INJURIES', 'REQUIRES_CARE', 'CRITICAL')),
  special_notes TEXT,
  
  -- Photo
  photo_url TEXT,
  photo_public_id VARCHAR(255),
  
  -- Matching
  missing_report_id VARCHAR(255),
  matched_at TIMESTAMPTZ,
  
  FOREIGN KEY (shelter_id) REFERENCES shelters(id) ON DELETE RESTRICT,
  FOREIGN KEY (missing_report_id) REFERENCES missing_persons(id) ON DELETE SET NULL
);

-- Indexes for persons
CREATE INDEX IF NOT EXISTS idx_persons_full_name ON persons(full_name);
CREATE INDEX IF NOT EXISTS idx_persons_nic ON persons(nic);
CREATE INDEX IF NOT EXISTS idx_persons_shelter_id ON persons(shelter_id);
CREATE INDEX IF NOT EXISTS idx_persons_missing_report_id ON persons(missing_report_id);

-- =====================================================
-- 7. MATCHES TABLE (Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS matches (
  id VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Match Information
  missing_person_id VARCHAR(255) NOT NULL,
  person_id VARCHAR(255) NOT NULL,
  match_score DECIMAL(5,2),
  matched_at TIMESTAMPTZ,
  matched_by VARCHAR(20) CHECK (matched_by IN ('MANUAL', 'AUTOMATIC', 'PHOTO_MATCH')),
  
  -- Confirmation
  confirmed_at TIMESTAMPTZ,
  confirmed_by VARCHAR(255),
  
  -- Notification
  notification_sent BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ,
  
  FOREIGN KEY (missing_person_id) REFERENCES missing_persons(id) ON DELETE CASCADE,
  FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE
);

-- Indexes for matches
CREATE INDEX IF NOT EXISTS idx_matches_missing_person_id ON matches(missing_person_id);
CREATE INDEX IF NOT EXISTS idx_matches_person_id ON matches(person_id);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at DESC);

-- =====================================================
-- 8. STATISTICS TABLE (Cached Statistics)
-- =====================================================
CREATE TABLE IF NOT EXISTS statistics (
  id VARCHAR(255) PRIMARY KEY DEFAULT 'singleton',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  total_persons INTEGER DEFAULT 0,
  total_shelters INTEGER DEFAULT 0,
  active_shelters INTEGER DEFAULT 0,
  total_missing INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  
  -- Per District Statistics (JSON)
  by_district JSONB
);

-- =====================================================
-- 9. UPDATE TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_missing_persons_updated_at ON missing_persons;
CREATE TRIGGER update_missing_persons_updated_at
  BEFORE UPDATE ON missing_persons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_persons_updated_at ON persons;
CREATE TRIGGER update_persons_updated_at
  BEFORE UPDATE ON persons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shelters_updated_at ON shelters;
CREATE TRIGGER update_shelters_updated_at
  BEFORE UPDATE ON shelters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shelter_auth_updated_at ON shelter_auth;
CREATE TRIGGER update_shelter_auth_updated_at
  BEFORE UPDATE ON shelter_auth
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_districts_updated_at ON districts;
CREATE TRIGGER update_districts_updated_at
  BEFORE UPDATE ON districts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_statistics_updated_at ON statistics;
CREATE TRIGGER update_statistics_updated_at
  BEFORE UPDATE ON statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE missing_persons IS 'Stores missing person reports from the public';
COMMENT ON TABLE persons IS 'Stores people registered at displacement camps/shelters';
COMMENT ON TABLE shelters IS 'Stores displacement camp/shelter information';
COMMENT ON TABLE shelter_auth IS 'Stores authentication credentials for shelter staff';
COMMENT ON TABLE matches IS 'Audit trail of matches between missing persons and registered persons';
COMMENT ON TABLE statistics IS 'Cached statistics for dashboard display';
COMMENT ON TABLE districts IS 'Sri Lankan districts reference data';
COMMENT ON TABLE administrative_divisions IS 'Administrative divisions (District, DS Division, GN Division)';

