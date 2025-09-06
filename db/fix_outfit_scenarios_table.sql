-- SQL Migration to fix outfit_scenarios table issues

-- First, check if the table exists and create it if not
CREATE TABLE IF NOT EXISTS outfit_scenarios (
  outfit_id UUID REFERENCES outfits(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (outfit_id, scenario_id)
);

-- Create RLS policies for the outfit_scenarios table
ALTER TABLE outfit_scenarios ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS outfit_scenarios_select_policy ON outfit_scenarios;
DROP POLICY IF EXISTS outfit_scenarios_insert_policy ON outfit_scenarios;
DROP POLICY IF EXISTS outfit_scenarios_delete_policy ON outfit_scenarios;

-- Create policies that allow users to view, create, and delete their own outfit scenarios
CREATE POLICY outfit_scenarios_select_policy ON outfit_scenarios 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY outfit_scenarios_insert_policy ON outfit_scenarios 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY outfit_scenarios_delete_policy ON outfit_scenarios 
  FOR DELETE USING (auth.uid() = user_id);

-- Create utility functions

-- Drop existing function first to avoid parameter name change error
DROP FUNCTION IF EXISTS check_table_exists(text);

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = check_table_exists.table_name
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;

-- Function to directly insert a scenario for an outfit (bypasses RLS)
CREATE OR REPLACE FUNCTION insert_scenario_for_outfit(
  outfit_id_param UUID,
  scenario_id_param UUID,
  user_id_param UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First check if the record already exists to avoid unique constraint violations
  IF NOT EXISTS (SELECT 1 FROM outfit_scenarios 
                WHERE outfit_id = outfit_id_param 
                AND scenario_id = scenario_id_param) THEN
    -- Insert the record
    INSERT INTO outfit_scenarios (outfit_id, scenario_id, user_id)
    VALUES (outfit_id_param, scenario_id_param, user_id_param);
  END IF;
END;
$$;
