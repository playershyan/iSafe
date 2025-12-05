-- Migration: Update MissingPerson model for new form requirements
-- Date: 2024-12-05
-- Description: 
--   - Make lastSeenDate required (was optional)
--   - Make lastSeenDistrict optional (removed from form but kept for backward compatibility)

-- Step 1: Update existing NULL lastSeenDate values to a default date (if any exist)
-- Using current timestamp as default for existing records
UPDATE missing_persons 
SET "lastSeenDate" = CURRENT_TIMESTAMP 
WHERE "lastSeenDate" IS NULL;

-- Step 2: Make lastSeenDate NOT NULL
ALTER TABLE "missing_persons" 
ALTER COLUMN "lastSeenDate" SET NOT NULL;

-- Step 3: Make lastSeenDistrict nullable (optional)
ALTER TABLE "missing_persons" 
ALTER COLUMN "lastSeenDistrict" DROP NOT NULL;

-- Note: The 'clothing' field already exists and is optional, which is used for the 'description' field

