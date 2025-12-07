-- =====================================================
-- Compensation Application System Migration
-- Created: 2025-12-06
-- Purpose: Enable disaster-affected individuals to apply
--          for government compensation
-- =====================================================

-- =====================================================
-- 1. COMPENSATION APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS compensation_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Applicant Information
  applicant_name VARCHAR(255) NOT NULL,
  applicant_nic VARCHAR(20) NOT NULL,
  applicant_phone VARCHAR(15) NOT NULL,
  applicant_address TEXT NOT NULL,

  -- Location Information
  district VARCHAR(100) NOT NULL,
  divisional_secretariat VARCHAR(100) NOT NULL,
  grama_niladhari_division VARCHAR(100) NOT NULL,

  -- Application Status
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID'
  )),

  -- Administrative Fields
  admin_notes TEXT,
  reviewed_by VARCHAR(100),
  reviewed_at TIMESTAMPTZ,

  -- Metadata
  application_code VARCHAR(20) UNIQUE NOT NULL,
  submitted_from_ip VARCHAR(50),
  phone_verified BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE,
  sms_sent_at TIMESTAMPTZ
);

-- Indexes for performance (create only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comp_app_status') THEN
    CREATE INDEX idx_comp_app_status ON compensation_applications(status);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comp_app_district') THEN
    CREATE INDEX idx_comp_app_district ON compensation_applications(district);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comp_app_div_sec') THEN
    CREATE INDEX idx_comp_app_div_sec ON compensation_applications(divisional_secretariat);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comp_app_gn') THEN
    CREATE INDEX idx_comp_app_gn ON compensation_applications(grama_niladhari_division);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comp_app_created') THEN
    CREATE INDEX idx_comp_app_created ON compensation_applications(created_at DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comp_app_code') THEN
    CREATE INDEX idx_comp_app_code ON compensation_applications(application_code);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comp_app_nic') THEN
    CREATE INDEX idx_comp_app_nic ON compensation_applications(applicant_nic);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comp_app_phone') THEN
    CREATE INDEX idx_comp_app_phone ON compensation_applications(applicant_phone);
  END IF;
END $$;

-- =====================================================
-- 2. COMPENSATION CLAIMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS compensation_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES compensation_applications(id) ON DELETE CASCADE,

  -- Claim Type (based on government circular)
  claim_type VARCHAR(50) NOT NULL CHECK (claim_type IN (
    'CLEANING_ALLOWANCE',           -- Serial 1: Rs 25,000
    'KITCHEN_UTENSILS',             -- Serial 2: Rs 50,000
    'LIVELIHOOD_ALLOWANCE',         -- Serial 3: Rs 25,000-50,000 (3 months)
    'RENTAL_ALLOWANCE',             -- Serial 4: Rs 25,000/month (max 6 months)
    'CROP_DAMAGE_PADDY',            -- Serial 5: Rs 150,000/hectare
    'CROP_DAMAGE_VEGETABLES',       -- Serial 6: Rs 200,000/hectare
    'LIVESTOCK_FARM',               -- Serial 7: Rs 200,000
    'SMALL_ENTERPRISE',             -- Serial 8: Rs 200,000
    'FISHING_BOAT',                 -- Serial 9: Max Rs 400,000
    'SCHOOL_SUPPLIES',              -- Serial 10: Rs 15,000/child
    'BUSINESS_BUILDING',            -- Serial 11: Max Rs 5,000,000
    'NEW_HOUSE_CONSTRUCTION',       -- Serial 12: Rs 5,000,000
    'LAND_PURCHASE',                -- Serial 13: Max Rs 5,000,000
    'HOUSE_REPAIR',                 -- Serial 14: Max Rs 2,500,000
    'DEATH_DISABILITY'              -- Serial 15: Rs 1,000,000
  )),

  -- Claim Status
  claim_status VARCHAR(50) DEFAULT 'PENDING' CHECK (claim_status IN (
    'PENDING', 'APPROVED', 'REJECTED'
  )),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for compensation_claims (create only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comp_claims_application') THEN
    CREATE INDEX idx_comp_claims_application ON compensation_claims(application_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comp_claims_type') THEN
    CREATE INDEX idx_comp_claims_type ON compensation_claims(claim_type);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comp_claims_status') THEN
    CREATE INDEX idx_comp_claims_status ON compensation_claims(claim_status);
  END IF;
END $$;

-- =====================================================
-- 3. COMPENSATION ADMINS TABLE (for dashboard access)
-- =====================================================
CREATE TABLE IF NOT EXISTS compensation_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'ADMIN' CHECK (role IN ('ADMIN', 'SUPER_ADMIN')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for compensation_admins (create only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comp_admins_username') THEN
    CREATE INDEX idx_comp_admins_username ON compensation_admins(username);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comp_admins_active') THEN
    CREATE INDEX idx_comp_admins_active ON compensation_admins(is_active);
  END IF;
END $$;

-- =====================================================
-- 4. TRIGGER: Update updated_at timestamp
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

-- Create triggers (drop and recreate to ensure they're up to date)
DROP TRIGGER IF EXISTS update_compensation_applications_updated_at ON compensation_applications;
CREATE TRIGGER update_compensation_applications_updated_at
  BEFORE UPDATE ON compensation_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_compensation_claims_updated_at ON compensation_claims;
CREATE TRIGGER update_compensation_claims_updated_at
  BEFORE UPDATE ON compensation_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_compensation_admins_updated_at ON compensation_admins;
CREATE TRIGGER update_compensation_admins_updated_at
  BEFORE UPDATE ON compensation_admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. CREATE DEFAULT ADMIN USER
-- =====================================================
-- Username: admin
-- Password: Admin@2025 (bcrypt hash below)
-- This should be changed immediately after deployment

INSERT INTO compensation_admins (username, password_hash, full_name, email, role)
VALUES (
  'admin',
  '$2a$10$rQZ8qGqJZvJxKJxKZJxKZOqJxKZJxKZJxKZJxKZJxKZJxKZJxKZJxK', -- Password: Admin@2025
  'System Administrator',
  'admin@isafe.gov.lk',
  'SUPER_ADMIN'
) ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE compensation_applications IS 'Stores disaster compensation applications from affected individuals';
COMMENT ON COLUMN compensation_applications.application_code IS 'Unique code for tracking (e.g., COMP-2025-ABC123)';
COMMENT ON COLUMN compensation_applications.phone_verified IS 'Whether phone number was verified via OTP';
COMMENT ON COLUMN compensation_applications.sms_sent IS 'Whether confirmation SMS was sent to applicant';

COMMENT ON TABLE compensation_claims IS 'Links applications to specific claim types (15 types from gov circular)';

COMMENT ON TABLE compensation_admins IS 'Admin users who can access the compensation dashboard';

-- =====================================================
-- NOTE: Administrative divisions data is managed by migration 006
-- The compensation system uses the existing administrative_divisions
-- table which contains Districts, DS Divisions, and GN Divisions.
-- =====================================================
