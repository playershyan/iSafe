-- Rollback Migration: Remove locale column from missing_persons table
-- Date: 2024-12-06

-- Remove locale column
ALTER TABLE missing_persons 
DROP COLUMN IF EXISTS locale;

