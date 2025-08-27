-- Migration to remove the scenarios column from capsules table
-- Only runs after data has been migrated to the capsule_scenarios join table

DO $$ 
BEGIN
  -- First check if the scenarios column exists in the capsules table
  IF EXISTS (SELECT FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'capsules' 
             AND column_name = 'scenarios') THEN
    
    -- Backup the data before removing the column (just to be safe)
    CREATE TABLE IF NOT EXISTS capsules_scenarios_backup AS
    SELECT id, scenarios 
    FROM capsules 
    WHERE scenarios IS NOT NULL;
    
    -- Add comment to the backup table
    COMMENT ON TABLE capsules_scenarios_backup IS 'Backup of capsules.scenarios column data before column removal';
    
    -- Now that we have a backup and data has been migrated to capsule_scenarios table,
    -- it's safe to drop the column
    ALTER TABLE capsules DROP COLUMN scenarios;
    
    -- Log the migration
    RAISE NOTICE 'Successfully removed scenarios column from capsules table';
  ELSE
    RAISE NOTICE 'scenarios column does not exist in capsules table, skipping removal';
  END IF;
END $$;
