-- Migration to ensure scenario_name in scenario_coverage stays in sync with scenarios

-- 1. Create or replace function to update scenario_name in scenario_coverage when a scenario is updated
CREATE OR REPLACE FUNCTION sync_scenario_name_on_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all scenario_coverage records that reference this scenario
  -- Only update if the name actually changed to avoid unnecessary writes
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    UPDATE scenario_coverage 
    SET scenario_name = NEW.name,
        last_updated = NOW()
    WHERE scenario_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create or replace function to set scenario_name when a new record is inserted into scenario_coverage
CREATE OR REPLACE FUNCTION set_scenario_name_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Set the scenario_name from the scenarios table
  IF NEW.scenario_id IS NOT NULL AND NEW.scenario_name IS NULL THEN
    SELECT name INTO NEW.scenario_name
    FROM scenarios
    WHERE id = NEW.scenario_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Drop existing triggers if they exist
DROP TRIGGER IF EXISTS sync_scenario_name_trigger ON scenarios;
DROP TRIGGER IF EXISTS set_scenario_name_trigger ON scenario_coverage;

-- 4. Create the update trigger (for when scenario names change)
CREATE TRIGGER sync_scenario_name_trigger
AFTER UPDATE OF name ON scenarios
FOR EACH ROW
WHEN (OLD.name IS DISTINCT FROM NEW.name)
EXECUTE FUNCTION sync_scenario_name_on_update();

-- 5. Create the insert trigger (for new scenario_coverage records)
CREATE TRIGGER set_scenario_name_trigger
BEFORE INSERT ON scenario_coverage
FOR EACH ROW
WHEN (NEW.scenario_id IS NOT NULL AND NEW.scenario_name IS NULL)
EXECUTE FUNCTION set_scenario_name_on_insert();

-- 6. Add comments for documentation
COMMENT ON FUNCTION sync_scenario_name_on_update() IS 'Updates scenario_name in scenario_coverage when a scenario name is updated';
COMMENT ON FUNCTION set_scenario_name_on_insert() IS 'Sets scenario_name in scenario_coverage when a new record is inserted';

COMMENT ON TRIGGER sync_scenario_name_trigger ON scenarios IS 'Updates scenario_name in scenario_coverage when a scenario name is updated';
COMMENT ON TRIGGER set_scenario_name_trigger ON scenario_coverage IS 'Sets scenario_name from scenarios table when a new scenario_coverage record is inserted';

-- 7. Create an index on scenario_coverage.scenario_id for better performance
CREATE INDEX IF NOT EXISTS idx_scenario_coverage_scenario_id ON scenario_coverage(scenario_id) WHERE scenario_id IS NOT NULL;

-- 8. Update any existing records where scenario_name might be NULL
-- This is a one-time update for existing data
UPDATE scenario_coverage sc
SET scenario_name = s.name,
    last_updated = NOW()
FROM scenarios s
WHERE sc.scenario_id::text = s.id::text
  AND (sc.scenario_name IS NULL OR sc.scenario_name != s.name);
