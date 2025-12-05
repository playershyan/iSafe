-- Check the missing_persons table structure including defaults
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'missing_persons'
ORDER BY ordinal_position;

-- Also check constraints
SELECT
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'missing_persons'::regclass;
