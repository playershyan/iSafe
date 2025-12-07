-- =====================================================
-- Staff Centers and Authentication Migration
-- Created: 2025-12-07
-- Purpose: Create tables for staff center management
--          (displacement camps managed through compensation dashboard)
-- =====================================================

-- =====================================================
-- 1. STAFF CENTERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS staff_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for staff_centers
CREATE INDEX IF NOT EXISTS idx_staff_centers_code ON staff_centers(code);
CREATE INDEX IF NOT EXISTS idx_staff_centers_district ON staff_centers(district);
CREATE INDEX IF NOT EXISTS idx_staff_centers_is_active ON staff_centers(is_active);

-- =====================================================
-- 2. STAFF AUTH TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS staff_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  center_id UUID UNIQUE NOT NULL,
  access_code VARCHAR(255) NOT NULL,
  
  -- Audit Fields
  last_access_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  
  FOREIGN KEY (center_id) REFERENCES staff_centers(id) ON DELETE CASCADE
);

-- Indexes for staff_auth
CREATE INDEX IF NOT EXISTS idx_staff_auth_center_id ON staff_auth(center_id);
CREATE INDEX IF NOT EXISTS idx_staff_auth_access_code ON staff_auth(access_code);

-- =====================================================
-- 3. UPDATE TRIGGERS
-- =====================================================
-- Function should already exist from migration 001, but ensure it exists
-- Updated with secure search_path setting
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
DROP TRIGGER IF EXISTS update_staff_centers_updated_at ON staff_centers;
CREATE TRIGGER update_staff_centers_updated_at
  BEFORE UPDATE ON staff_centers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_auth_updated_at ON staff_auth;
CREATE TRIGGER update_staff_auth_updated_at
  BEFORE UPDATE ON staff_auth
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE staff_centers IS 'Displacement camps/staff centers managed through compensation dashboard';
COMMENT ON TABLE staff_auth IS 'Authentication credentials for staff center access';
COMMENT ON COLUMN staff_centers.code IS 'Unique center code used for login (e.g., CMB-CC-001)';
COMMENT ON COLUMN staff_auth.access_code IS 'Bcrypt hashed access code/password';

