-- =====================================================
-- Phone Verification System Migration
-- Created: 2025-12-07
-- Purpose: Create table for OTP-based phone verification
--          Supports both authenticated users and anonymous users
-- =====================================================

-- =====================================================
-- 1. PHONE VERIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS phone_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- User Information
  user_id VARCHAR(255), -- NULL for anonymous users, user ID for authenticated users
  phone_number VARCHAR(15) NOT NULL,
  
  -- OTP Information
  otp_code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Verification Status
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  -- Attempts Tracking
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3
);

-- Indexes for phone_verifications
CREATE INDEX IF NOT EXISTS idx_phone_verifications_user_id ON phone_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone_number ON phone_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_otp_code ON phone_verifications(otp_code);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_expires_at ON phone_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_verified ON phone_verifications(verified);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_created_at ON phone_verifications(created_at DESC);

-- Composite index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone_created ON phone_verifications(phone_number, created_at DESC);

-- =====================================================
-- 2. CLEANUP FUNCTION (Optional - for expired OTPs)
-- =====================================================
-- Function to clean up expired OTPs (can be called via cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM phone_verifications
  WHERE expires_at < NOW() - INTERVAL '24 hours'
    AND verified = FALSE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. UPDATE TRIGGER
-- =====================================================
-- Function should already exist from migration 001
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

DROP TRIGGER IF EXISTS update_phone_verifications_updated_at ON phone_verifications;
CREATE TRIGGER update_phone_verifications_updated_at
  BEFORE UPDATE ON phone_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE phone_verifications IS 'Stores OTP codes for phone number verification';
COMMENT ON COLUMN phone_verifications.user_id IS 'NULL for anonymous users, user ID for authenticated users';
COMMENT ON COLUMN phone_verifications.otp_code IS 'One-time password code (6-8 digits)';
COMMENT ON COLUMN phone_verifications.expires_at IS 'OTP expiration timestamp (typically 10 minutes from creation)';
COMMENT ON COLUMN phone_verifications.attempts IS 'Number of verification attempts';
COMMENT ON COLUMN phone_verifications.max_attempts IS 'Maximum allowed verification attempts (default: 3)';

