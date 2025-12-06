-- Migration: Add locale column to missing_persons table
-- Date: 2024-12-06
-- Description: Add locale field to store the language selected when the report was created

-- Add locale column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'missing_persons' 
        AND column_name = 'locale'
    ) THEN
        ALTER TABLE missing_persons 
        ADD COLUMN locale VARCHAR(10) DEFAULT 'en';
        
        -- Update existing records to default to 'en'
        UPDATE missing_persons 
        SET locale = 'en' 
        WHERE locale IS NULL;
    END IF;
END $$;

