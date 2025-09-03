-- Migration to add missing columns to capsules table
-- Execute this script if these fields are actually needed

DO $$
BEGIN
  -- Check if date_modified column exists and add it if it doesn't
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'capsules' AND column_name = 'date_modified') THEN
    ALTER TABLE capsules ADD COLUMN date_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    -- Add trigger to update date_modified automatically
    CREATE OR REPLACE FUNCTION update_capsule_modified_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.date_modified = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS update_capsule_modified_date ON capsules;
    CREATE TRIGGER update_capsule_modified_date
    BEFORE UPDATE ON capsules
    FOR EACH ROW
    EXECUTE FUNCTION update_capsule_modified_column();
  END IF;
  
  -- Check if image_url column exists and add it if it doesn't
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'capsules' AND column_name = 'image_url') THEN
    ALTER TABLE capsules ADD COLUMN image_url TEXT DEFAULT '';
  END IF;
  
  -- Check if is_favorite column exists and add it if it doesn't
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'capsules' AND column_name = 'is_favorite') THEN
    ALTER TABLE capsules ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Check if item_count column exists and add it if it doesn't
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'capsules' AND column_name = 'item_count') THEN
    ALTER TABLE capsules ADD COLUMN item_count INTEGER DEFAULT 0;
  END IF;

  -- Log completion
  RAISE NOTICE 'Migration completed - added missing columns to capsules table';
END;
$$ LANGUAGE plpgsql;
