-- Migration: Add NIC column to missing_persons table
-- Date: 2024-12-06
-- Description: Add optional NIC field to missing_persons table for better search and matching

-- Add NIC column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'missing_persons' 
        AND column_name = 'nic'
    ) THEN
        ALTER TABLE missing_persons 
        ADD COLUMN nic VARCHAR(12);
        
        -- Add index for better search performance
        CREATE INDEX IF NOT EXISTS idx_missing_persons_nic ON missing_persons(nic);
    END IF;
END $$;

