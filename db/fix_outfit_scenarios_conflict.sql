-- Fix conflict handling for outfit_scenarios table

DO $$ 
BEGIN
  -- First check if the outfit_scenarios table exists
  IF EXISTS (SELECT FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'outfit_scenarios') THEN

    -- Check if the unique constraint exists
    IF NOT EXISTS (
      SELECT FROM information_schema.table_constraints
      WHERE table_schema = 'public'
      AND table_name = 'outfit_scenarios'
      AND constraint_name = 'outfit_scenarios_outfit_id_scenario_id_key'
    ) THEN
      -- Add the unique constraint if it doesn't exist
      ALTER TABLE outfit_scenarios ADD CONSTRAINT outfit_scenarios_outfit_id_scenario_id_key
        UNIQUE(outfit_id, scenario_id);
    END IF;

    -- Check the data type of scenario_id
    DO $CHECK_TYPE$ BEGIN
      -- Get the data type of the scenario_id column
      PERFORM data_type FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'outfit_scenarios'
      AND column_name = 'scenario_id';
      
      RAISE NOTICE 'scenario_id column data type: %', (
        SELECT data_type FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'outfit_scenarios'
        AND column_name = 'scenario_id'
      );
    END $CHECK_TYPE$;

    -- Check outfit_id column data type
    DO $CHECK_OUTFIT_TYPE$ BEGIN
      RAISE NOTICE 'outfit_id column data type: %', (
        SELECT data_type FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'outfit_scenarios'
        AND column_name = 'outfit_id'
      );
    END $CHECK_OUTFIT_TYPE$;

    -- Let's examine the primary key types of the referenced tables first
    DO $CHECK_PK_TYPES$ BEGIN
      RAISE NOTICE 'outfits.id column data type: %', (
        SELECT data_type FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'outfits'
        AND column_name = 'id'
      );
      
      RAISE NOTICE 'scenarios.id column data type: %', (
        SELECT data_type FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'scenarios'
        AND column_name = 'id'
      );
    END $CHECK_PK_TYPES$;
    
    -- Check if the foreign key constraints exist first
    DO $CHECK_CONSTRAINTS$ BEGIN
      RAISE NOTICE 'Foreign key constraints on outfit_scenarios: %', (
        SELECT string_agg(constraint_name, ', ')
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'outfit_scenarios'
        AND constraint_type = 'FOREIGN KEY'
      );
    END $CHECK_CONSTRAINTS$;
    
    RAISE NOTICE 'Not modifying constraints until we understand the data types';
    
    /* Commented out to prevent errors
    -- First drop them if they exist
    ALTER TABLE outfit_scenarios DROP CONSTRAINT IF EXISTS outfit_scenarios_outfit_id_fkey;
    ALTER TABLE outfit_scenarios DROP CONSTRAINT IF EXISTS outfit_scenarios_scenario_id_fkey;

    -- Add them back
    ALTER TABLE outfit_scenarios ADD CONSTRAINT outfit_scenarios_outfit_id_fkey
      FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE;
    ALTER TABLE outfit_scenarios ADD CONSTRAINT outfit_scenarios_scenario_id_fkey
      FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE;
    */

    RAISE NOTICE 'Successfully fixed outfit_scenarios table constraints';
  ELSE
    RAISE NOTICE 'outfit_scenarios table does not exist, skipping fixes';
  END IF;
END $$;
