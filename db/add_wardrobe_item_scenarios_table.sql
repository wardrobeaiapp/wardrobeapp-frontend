-- Migration: Add scenario join table for wardrobe items

-- Create wardrobe_item_scenarios table
CREATE TABLE IF NOT EXISTS wardrobe_item_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(item_id, scenario_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS wardrobe_item_scenarios_item_id_idx ON wardrobe_item_scenarios(item_id);
CREATE INDEX IF NOT EXISTS wardrobe_item_scenarios_scenario_id_idx ON wardrobe_item_scenarios(scenario_id);
CREATE INDEX IF NOT EXISTS wardrobe_item_scenarios_user_id_idx ON wardrobe_item_scenarios(user_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE wardrobe_item_scenarios ENABLE ROW LEVEL SECURITY;

-- Create policies for wardrobe_item_scenarios
-- Only create policies if they don't exist already (manually check)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE policyname = 'Users can view their own wardrobe_item_scenarios'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own wardrobe_item_scenarios" 
      ON wardrobe_item_scenarios FOR SELECT 
      USING (auth.uid() = user_id OR user_id = ''00000000-0000-0000-0000-000000000000'')';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE policyname = 'Users can insert their own wardrobe_item_scenarios'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert their own wardrobe_item_scenarios" 
      ON wardrobe_item_scenarios FOR INSERT 
      WITH CHECK (auth.uid() = user_id OR user_id = ''00000000-0000-0000-0000-000000000000'')';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE policyname = 'Users can update their own wardrobe_item_scenarios'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update their own wardrobe_item_scenarios" 
      ON wardrobe_item_scenarios FOR UPDATE 
      USING (auth.uid() = user_id OR user_id = ''00000000-0000-0000-0000-000000000000'')';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE policyname = 'Users can delete their own wardrobe_item_scenarios'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete their own wardrobe_item_scenarios" 
      ON wardrobe_item_scenarios FOR DELETE 
      USING (auth.uid() = user_id OR user_id = ''00000000-0000-0000-0000-000000000000'')';
  END IF;
END $$;

-- Create migration to handle existing data
-- This will run once to populate the join table with existing scenarios data from wardrobe_items
DO $$ 
BEGIN
  -- Migrate item scenarios - handle both ID and name formats
  -- First try with ID match
  INSERT INTO wardrobe_item_scenarios (item_id, scenario_id, user_id)
  SELECT wi.id, s.id, wi.user_id
  FROM wardrobe_items wi
  CROSS JOIN LATERAL unnest(wi.scenarios) AS scenario_value
  JOIN scenarios s ON s.id = scenario_value
  WHERE wi.scenarios IS NOT NULL AND array_length(wi.scenarios, 1) > 0
  ON CONFLICT (item_id, scenario_id) DO NOTHING;
  
  -- Then try with name match
  INSERT INTO wardrobe_item_scenarios (item_id, scenario_id, user_id)
  SELECT wi.id, s.id, wi.user_id
  FROM wardrobe_items wi
  CROSS JOIN LATERAL unnest(wi.scenarios) AS scenario_value
  JOIN scenarios s ON s.name = scenario_value
  WHERE wi.scenarios IS NOT NULL AND array_length(wi.scenarios, 1) > 0
  ON CONFLICT (item_id, scenario_id) DO NOTHING;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error during data migration: %', SQLERRM;
END $$;
