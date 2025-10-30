-- Migration: Fix scenario triggers - Simple cleanup approach
-- Date: 2025-10-30
-- Description: Remove problematic triggers that reference non-existent tables

-- Log start of migration
SELECT 'Starting scenario triggers cleanup migration...' as status;

-- 1. Drop any existing triggers that might cause issues
DROP TRIGGER IF EXISTS sync_scenario_name_trigger ON scenarios;

-- 2. Drop the old functions that reference non-existent tables
DROP FUNCTION IF EXISTS sync_scenario_name_on_update();
DROP FUNCTION IF EXISTS set_scenario_name_on_insert();

-- 3. Check if scenario_coverage_by_category table exists before creating triggers
DO $$
DECLARE
    table_exists BOOLEAN := FALSE;
BEGIN
    -- Check if the table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'scenario_coverage_by_category'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'Table scenario_coverage_by_category exists - creating triggers';
        
        -- Create function for updating scenario names
        CREATE OR REPLACE FUNCTION sync_scenario_name_on_update_by_category()
        RETURNS TRIGGER AS $func$
        BEGIN
            IF OLD.name IS DISTINCT FROM NEW.name THEN
                UPDATE scenario_coverage_by_category 
                SET scenario_name = NEW.name,
                    last_updated = NOW()
                WHERE scenario_id = NEW.id;
                
                RAISE NOTICE 'Updated scenario_name from "%" to "%" in scenario_coverage_by_category', OLD.name, NEW.name;
            END IF;
            
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;

        -- Create the trigger
        CREATE TRIGGER sync_scenario_name_trigger_by_category
        AFTER UPDATE OF name ON scenarios
        FOR EACH ROW
        WHEN (OLD.name IS DISTINCT FROM NEW.name)
        EXECUTE FUNCTION sync_scenario_name_on_update_by_category();
        
        RAISE NOTICE 'SUCCESS: Created scenario name sync trigger';
        
    ELSE
        RAISE NOTICE 'Table scenario_coverage_by_category does not exist - skipping trigger creation';
        RAISE NOTICE 'Note: Scenario name changes will work, but coverage data may need manual sync later';
    END IF;
END $$;

SELECT 'Migration completed: fix_scenario_triggers' as status;
