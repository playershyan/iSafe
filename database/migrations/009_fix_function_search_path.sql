-- =====================================================
-- Fix Function Search Path Security Issue
-- Created: 2025-12-07
-- Purpose: Fix security warning by setting search_path
--          on update_updated_at_column function
-- =====================================================

-- =====================================================
-- Fix update_updated_at_column function
-- =====================================================
-- Setting search_path prevents search path manipulation attacks
-- This is a security best practice for PostgreSQL functions

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

-- =====================================================
-- NOTES
-- =====================================================
-- 
-- Security Fix:
-- - Added SET search_path = public, pg_temp
-- - Added SECURITY DEFINER (function runs with definer's privileges)
-- - Prevents search path manipulation attacks
--
-- This migration replaces the function definition from all
-- previous migrations and fixes the security warning.

