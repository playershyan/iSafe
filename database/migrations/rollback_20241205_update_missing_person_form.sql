-- Rollback Migration: Revert MissingPerson model changes
-- Date: 2024-12-05
-- Description: Revert the form update changes

-- Step 1: Make lastSeenDistrict NOT NULL again
ALTER TABLE "missing_persons" 
ALTER COLUMN "lastSeenDistrict" SET NOT NULL;

-- Step 2: Make lastSeenDate nullable again
ALTER TABLE "missing_persons" 
ALTER COLUMN "lastSeenDate" DROP NOT NULL;

-- Note: This rollback will fail if there are any NULL values in lastSeenDistrict
-- You may need to update those records first before running this rollback

