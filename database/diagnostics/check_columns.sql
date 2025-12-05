-- Diagnostic Query: Check current column names in database
-- Run this in Supabase SQL Editor to see what column names currently exist

-- Check missing_persons table columns
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'missing_persons'
ORDER BY ordinal_position;

-- This will show you whether columns are:
-- - camelCase with quotes: "fullName", "lastSeenDate", etc.
-- - snake_case: full_name, last_seen_date, etc.
