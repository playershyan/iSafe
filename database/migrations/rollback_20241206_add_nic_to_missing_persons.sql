-- Rollback Migration: Remove NIC column from missing_persons table
-- Date: 2024-12-06
-- Description: Rollback the addition of NIC field to missing_persons table

-- Drop index first
DROP INDEX IF EXISTS idx_missing_persons_nic;

-- Remove NIC column
ALTER TABLE missing_persons 
DROP COLUMN IF EXISTS nic;

