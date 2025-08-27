-- Migration to remove the scenarios column from outfits table
-- Since we now use the outfit_scenarios join table exclusively

-- Step 1: First check if the scenarios column exists and create a backup if it does
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'outfits' 
    AND column_name = 'scenarios'
  ) THEN
    -- Create a backup of the existing scenarios data
    EXECUTE 'CREATE TABLE IF NOT EXISTS scenarios_backup AS 
             SELECT id, scenarios FROM outfits WHERE scenarios IS NOT NULL';
             
    -- Remove the scenarios column from the outfits table
    ALTER TABLE outfits DROP COLUMN scenarios;
    
    RAISE NOTICE 'Successfully removed scenarios column and created backup';
  ELSE
    RAISE NOTICE 'scenarios column does not exist in outfits table, no action needed';
  END IF;
END $$;

-- Note: This migration removes the 'scenarios' column from the outfits table
-- after we've migrated to using the outfit_scenarios join table exclusively.
-- If the column exists, a backup table scenarios_backup will contain any previously stored scenario data.
