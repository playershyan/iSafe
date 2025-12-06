-- =====================================================
-- Compensation Application System Migration
-- Created: 2025-12-06
-- Purpose: Enable disaster-affected individuals to apply
--          for government compensation
-- =====================================================

-- =====================================================
-- 1. ADMINISTRATIVE DIVISIONS REFERENCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS administrative_divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district VARCHAR(100) NOT NULL,
  divisional_secretariat VARCHAR(100) NOT NULL,
  grama_niladhari_division VARCHAR(100) NOT NULL,
  gn_code VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(district, divisional_secretariat, grama_niladhari_division)
);

CREATE INDEX idx_admin_div_district ON administrative_divisions(district);
CREATE INDEX idx_admin_div_div_sec ON administrative_divisions(divisional_secretariat);
CREATE INDEX idx_admin_div_gn ON administrative_divisions(grama_niladhari_division);

-- =====================================================
-- 2. COMPENSATION APPLICATIONS TABLE
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

-- Indexes for performance
CREATE INDEX idx_comp_app_status ON compensation_applications(status);
CREATE INDEX idx_comp_app_district ON compensation_applications(district);
CREATE INDEX idx_comp_app_div_sec ON compensation_applications(divisional_secretariat);
CREATE INDEX idx_comp_app_gn ON compensation_applications(grama_niladhari_division);
CREATE INDEX idx_comp_app_created ON compensation_applications(created_at DESC);
CREATE INDEX idx_comp_app_code ON compensation_applications(application_code);
CREATE INDEX idx_comp_app_nic ON compensation_applications(applicant_nic);
CREATE INDEX idx_comp_app_phone ON compensation_applications(applicant_phone);

-- =====================================================
-- 3. COMPENSATION CLAIMS TABLE
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

CREATE INDEX idx_comp_claims_application ON compensation_claims(application_id);
CREATE INDEX idx_comp_claims_type ON compensation_claims(claim_type);
CREATE INDEX idx_comp_claims_status ON compensation_claims(claim_status);

-- =====================================================
-- 4. COMPENSATION ADMINS TABLE (for dashboard access)
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

CREATE INDEX idx_comp_admins_username ON compensation_admins(username);
CREATE INDEX idx_comp_admins_active ON compensation_admins(is_active);

-- =====================================================
-- 5. TRIGGER: Update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_compensation_applications_updated_at
  BEFORE UPDATE ON compensation_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compensation_claims_updated_at
  BEFORE UPDATE ON compensation_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compensation_admins_updated_at
  BEFORE UPDATE ON compensation_admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. INSERT BASIC ADMINISTRATIVE DIVISIONS DATA
-- =====================================================
-- This is a basic starter set. User will provide comprehensive JSON later.

INSERT INTO administrative_divisions (district, divisional_secretariat, grama_niladhari_division, gn_code) VALUES
-- Colombo District
('Colombo', 'Colombo', 'Colombo Fort', 'COL-001'),
('Colombo', 'Colombo', 'Slave Island', 'COL-002'),
('Colombo', 'Dehiwala-Mount Lavinia', 'Dehiwala', 'COL-003'),
('Colombo', 'Dehiwala-Mount Lavinia', 'Mount Lavinia', 'COL-004'),
('Colombo', 'Kolonnawa', 'Kolonnawa East', 'COL-005'),
('Colombo', 'Kolonnawa', 'Kolonnawa West', 'COL-006'),

-- Gampaha District
('Gampaha', 'Gampaha', 'Gampaha Town', 'GAM-001'),
('Gampaha', 'Gampaha', 'Yakkala', 'GAM-002'),
('Gampaha', 'Negombo', 'Negombo North', 'GAM-003'),
('Gampaha', 'Negombo', 'Negombo South', 'GAM-004'),
('Gampaha', 'Kelaniya', 'Kelaniya North', 'GAM-005'),
('Gampaha', 'Kelaniya', 'Kelaniya South', 'GAM-006'),

-- Kalutara District
('Kalutara', 'Kalutara', 'Kalutara North', 'KAL-001'),
('Kalutara', 'Kalutara', 'Kalutara South', 'KAL-002'),
('Kalutara', 'Panadura', 'Panadura North', 'KAL-003'),
('Kalutara', 'Panadura', 'Panadura South', 'KAL-004'),

-- Galle District
('Galle', 'Galle', 'Galle Fort', 'GAL-001'),
('Galle', 'Galle', 'Galle Town', 'GAL-002'),
('Galle', 'Hikkaduwa', 'Hikkaduwa North', 'GAL-003'),
('Galle', 'Hikkaduwa', 'Hikkaduwa South', 'GAL-004'),

-- Matara District
('Matara', 'Matara', 'Matara Town', 'MAT-001'),
('Matara', 'Matara', 'Matara East', 'MAT-002'),
('Matara', 'Weligama', 'Weligama North', 'MAT-003'),
('Matara', 'Weligama', 'Weligama South', 'MAT-004'),

-- Hambantota District
('Hambantota', 'Hambantota', 'Hambantota Town', 'HAM-001'),
('Hambantota', 'Hambantota', 'Hambantota East', 'HAM-002'),
('Hambantota', 'Tangalle', 'Tangalle North', 'HAM-003'),
('Hambantota', 'Tangalle', 'Tangalle South', 'HAM-004'),

-- Jaffna District
('Jaffna', 'Jaffna', 'Jaffna Town', 'JAF-001'),
('Jaffna', 'Jaffna', 'Nallur', 'JAF-002'),
('Jaffna', 'Point Pedro', 'Point Pedro North', 'JAF-003'),
('Jaffna', 'Point Pedro', 'Point Pedro South', 'JAF-004'),

-- Kandy District
('Kandy', 'Kandy', 'Kandy City', 'KAN-001'),
('Kandy', 'Kandy', 'Mahaiyawa', 'KAN-002'),
('Kandy', 'Gampola', 'Gampola Town', 'KAN-003'),
('Kandy', 'Gampola', 'Gampola East', 'KAN-004'),

-- Nuwara Eliya District
('Nuwara Eliya', 'Nuwara Eliya', 'Nuwara Eliya Town', 'NUW-001'),
('Nuwara Eliya', 'Nuwara Eliya', 'Nuwara Eliya East', 'NUW-002'),
('Nuwara Eliya', 'Hatton', 'Hatton Town', 'NUW-003'),
('Nuwara Eliya', 'Hatton', 'Hatton East', 'NUW-004'),

-- Badulla District
('Badulla', 'Badulla', 'Badulla Town', 'BAD-001'),
('Badulla', 'Badulla', 'Badulla East', 'BAD-002'),
('Badulla', 'Bandarawela', 'Bandarawela Town', 'BAD-003'),
('Badulla', 'Bandarawela', 'Bandarawela East', 'BAD-004'),

-- Trincomalee District
('Trincomalee', 'Trincomalee', 'Trincomalee Town', 'TRI-001'),
('Trincomalee', 'Trincomalee', 'Trincomalee East', 'TRI-002'),
('Trincomalee', 'Kinniya', 'Kinniya North', 'TRI-003'),
('Trincomalee', 'Kinniya', 'Kinniya South', 'TRI-004'),

-- Batticaloa District
('Batticaloa', 'Batticaloa', 'Batticaloa Town', 'BAT-001'),
('Batticaloa', 'Batticaloa', 'Batticaloa East', 'BAT-002'),
('Batticaloa', 'Kattankudy', 'Kattankudy North', 'BAT-003'),
('Batticaloa', 'Kattankudy', 'Kattankudy South', 'BAT-004'),

-- Ampara District
('Ampara', 'Ampara', 'Ampara Town', 'AMP-001'),
('Ampara', 'Ampara', 'Ampara East', 'AMP-002'),
('Ampara', 'Kalmunai', 'Kalmunai North', 'AMP-003'),
('Ampara', 'Kalmunai', 'Kalmunai South', 'AMP-004'),

-- Anuradhapura District
('Anuradhapura', 'Anuradhapura', 'Anuradhapura Town', 'ANU-001'),
('Anuradhapura', 'Anuradhapura', 'Anuradhapura East', 'ANU-002'),
('Anuradhapura', 'Medawachchiya', 'Medawachchiya North', 'ANU-003'),
('Anuradhapura', 'Medawachchiya', 'Medawachchiya South', 'ANU-004'),

-- Polonnaruwa District
('Polonnaruwa', 'Polonnaruwa', 'Polonnaruwa Town', 'POL-001'),
('Polonnaruwa', 'Polonnaruwa', 'Polonnaruwa East', 'POL-002'),
('Polonnaruwa', 'Medirigiriya', 'Medirigiriya North', 'POL-003'),
('Polonnaruwa', 'Medirigiriya', 'Medirigiriya South', 'POL-004'),

-- Kurunegala District
('Kurunegala', 'Kurunegala', 'Kurunegala Town', 'KUR-001'),
('Kurunegala', 'Kurunegala', 'Kurunegala East', 'KUR-002'),
('Kurunegala', 'Mawathagama', 'Mawathagama North', 'KUR-003'),
('Kurunegala', 'Mawathagama', 'Mawathagama South', 'KUR-004'),

-- Puttalam District
('Puttalam', 'Puttalam', 'Puttalam Town', 'PUT-001'),
('Puttalam', 'Puttalam', 'Puttalam East', 'PUT-002'),
('Puttalam', 'Chilaw', 'Chilaw North', 'PUT-003'),
('Puttalam', 'Chilaw', 'Chilaw South', 'PUT-004'),

-- Ratnapura District
('Ratnapura', 'Ratnapura', 'Ratnapura Town', 'RAT-001'),
('Ratnapura', 'Ratnapura', 'Ratnapura East', 'RAT-002'),
('Ratnapura', 'Balangoda', 'Balangoda North', 'RAT-003'),
('Ratnapura', 'Balangoda', 'Balangoda South', 'RAT-004'),

-- Kegalle District
('Kegalle', 'Kegalle', 'Kegalle Town', 'KEG-001'),
('Kegalle', 'Kegalle', 'Kegalle East', 'KEG-002'),
('Kegalle', 'Mawanella', 'Mawanella North', 'KEG-003'),
('Kegalle', 'Mawanella', 'Mawanella South', 'KEG-004'),

-- Vavuniya District
('Vavuniya', 'Vavuniya', 'Vavuniya Town', 'VAV-001'),
('Vavuniya', 'Vavuniya', 'Vavuniya East', 'VAV-002'),
('Vavuniya', 'Vavuniya North', 'Vavuniya North Town', 'VAV-003'),
('Vavuniya', 'Vavuniya North', 'Vavuniya North East', 'VAV-004'),

-- Mannar District
('Mannar', 'Mannar', 'Mannar Town', 'MAN-001'),
('Mannar', 'Mannar', 'Mannar East', 'MAN-002'),
('Mannar', 'Manthai West', 'Manthai West North', 'MAN-003'),
('Mannar', 'Manthai West', 'Manthai West South', 'MAN-004'),

-- Mullaitivu District
('Mullaitivu', 'Mullaitivu', 'Mullaitivu Town', 'MUL-001'),
('Mullaitivu', 'Mullaitivu', 'Mullaitivu East', 'MUL-002'),
('Mullaitivu', 'Maritime Pattu', 'Maritime Pattu North', 'MUL-003'),
('Mullaitivu', 'Maritime Pattu', 'Maritime Pattu South', 'MUL-004'),

-- Kilinochchi District
('Kilinochchi', 'Kilinochchi', 'Kilinochchi Town', 'KIL-001'),
('Kilinochchi', 'Kilinochchi', 'Kilinochchi East', 'KIL-002'),
('Kilinochchi', 'Kandavalai', 'Kandavalai North', 'KIL-003'),
('Kilinochchi', 'Kandavalai', 'Kandavalai South', 'KIL-004'),

-- Monaragala District
('Monaragala', 'Monaragala', 'Monaragala Town', 'MON-001'),
('Monaragala', 'Monaragala', 'Monaragala East', 'MON-002'),
('Monaragala', 'Wellawaya', 'Wellawaya North', 'MON-003'),
('Monaragala', 'Wellawaya', 'Wellawaya South', 'MON-004')

ON CONFLICT (district, divisional_secretariat, grama_niladhari_division) DO NOTHING;

-- =====================================================
-- 7. CREATE DEFAULT ADMIN USER
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
-- 8. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE compensation_applications IS 'Stores disaster compensation applications from affected individuals';
COMMENT ON TABLE compensation_claims IS 'Links applications to specific claim types (15 types from gov circular)';
COMMENT ON TABLE administrative_divisions IS 'Reference data for Sri Lankan administrative divisions';
COMMENT ON TABLE compensation_admins IS 'Admin users who can access the compensation dashboard';

COMMENT ON COLUMN compensation_applications.application_code IS 'Unique code for tracking (e.g., COMP-2025-ABC123)';
COMMENT ON COLUMN compensation_applications.phone_verified IS 'Whether phone number was verified via OTP';
COMMENT ON COLUMN compensation_applications.sms_sent IS 'Whether confirmation SMS was sent to applicant';
