-- =====================================================
-- Add Locale Column to Compensation Applications
-- Created: 2025-12-07
-- Purpose: Store the locale/language used when submitting
--          the compensation application for SMS notifications
-- =====================================================

-- Add locale column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'compensation_applications' 
        AND column_name = 'locale'
    ) THEN
        ALTER TABLE compensation_applications 
        ADD COLUMN locale VARCHAR(10) DEFAULT 'en';
        
        -- Update existing records to default to 'en'
        UPDATE compensation_applications 
        SET locale = 'en' 
        WHERE locale IS NULL;
    END IF;
END $$;

-- Add index for locale if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_comp_app_locale ON compensation_applications(locale);

COMMENT ON COLUMN compensation_applications.locale IS 'Language/locale used when submitting the application (en, si, ta)';

