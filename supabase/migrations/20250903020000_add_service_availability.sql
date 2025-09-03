-- Add availability column to services table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'availability'
    ) THEN
        ALTER TABLE services 
        ADD COLUMN availability jsonb DEFAULT '[]'::jsonb;
        
        -- Add a comment to explain the structure
        COMMENT ON COLUMN services.availability IS 
        'Array of availability objects with structure: [{"day": "Monday", "slots": [{"start": "09:00", "end": "17:00"}]}]';
    END IF;
END $$;
