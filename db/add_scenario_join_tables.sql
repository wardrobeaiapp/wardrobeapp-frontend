-- Migration: Add scenario join tables for outfits and capsules

-- Create outfit_scenarios table
CREATE TABLE IF NOT EXISTS outfit_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(outfit_id, scenario_id)
);

-- Create capsule_scenarios table
CREATE TABLE IF NOT EXISTS capsule_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(capsule_id, scenario_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS outfit_scenarios_outfit_id_idx ON outfit_scenarios(outfit_id);
CREATE INDEX IF NOT EXISTS outfit_scenarios_scenario_id_idx ON outfit_scenarios(scenario_id);
CREATE INDEX IF NOT EXISTS outfit_scenarios_user_id_idx ON outfit_scenarios(user_id);

CREATE INDEX IF NOT EXISTS capsule_scenarios_capsule_id_idx ON capsule_scenarios(capsule_id);
CREATE INDEX IF NOT EXISTS capsule_scenarios_scenario_id_idx ON capsule_scenarios(scenario_id);
CREATE INDEX IF NOT EXISTS capsule_scenarios_user_id_idx ON capsule_scenarios(user_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE outfit_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsule_scenarios ENABLE ROW LEVEL SECURITY;

-- Create policies for outfit_scenarios
-- Only create policies if they don't exist already (manually check)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE policyname = 'Users can view their own outfit_scenarios'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own outfit_scenarios" 
      ON outfit_scenarios FOR SELECT 
      USING (auth.uid() = user_id OR user_id = ''00000000-0000-0000-0000-000000000000'')';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE policyname = 'Users can insert their own outfit_scenarios'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert their own outfit_scenarios" 
      ON outfit_scenarios FOR INSERT 
      WITH CHECK (auth.uid() = user_id OR user_id = ''00000000-0000-0000-0000-000000000000'')';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE policyname = 'Users can update their own outfit_scenarios'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update their own outfit_scenarios" 
      ON outfit_scenarios FOR UPDATE 
      USING (auth.uid() = user_id OR user_id = ''00000000-0000-0000-0000-000000000000'')';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE policyname = 'Users can delete their own outfit_scenarios'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete their own outfit_scenarios" 
      ON outfit_scenarios FOR DELETE 
      USING (auth.uid() = user_id OR user_id = ''00000000-0000-0000-0000-000000000000'')';
  END IF;
END $$;

-- Create policies for capsule_scenarios
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE policyname = 'Users can view their own capsule_scenarios'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own capsule_scenarios" 
      ON capsule_scenarios FOR SELECT 
      USING (auth.uid() = user_id OR user_id = ''00000000-0000-0000-0000-000000000000'')';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE policyname = 'Users can insert their own capsule_scenarios'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert their own capsule_scenarios" 
      ON capsule_scenarios FOR INSERT 
      WITH CHECK (auth.uid() = user_id OR user_id = ''00000000-0000-0000-0000-000000000000'')';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE policyname = 'Users can update their own capsule_scenarios'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update their own capsule_scenarios" 
      ON capsule_scenarios FOR UPDATE 
      USING (auth.uid() = user_id OR user_id = ''00000000-0000-0000-0000-000000000000'')';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE policyname = 'Users can delete their own capsule_scenarios'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete their own capsule_scenarios" 
      ON capsule_scenarios FOR DELETE 
      USING (auth.uid() = user_id OR user_id = ''00000000-0000-0000-0000-000000000000'')';
  END IF;
END $$;

-- Create migration to handle existing data
-- This will run once to populate the join tables with existing data
DO $$ 
BEGIN
  -- Migrate outfit scenarios - handle both ID and name formats
  -- First try with ID match
  INSERT INTO outfit_scenarios (outfit_id, scenario_id, user_id)
  SELECT o.id, s.id, o.user_id
  FROM outfits o
  CROSS JOIN LATERAL unnest(o.scenarios) AS scenario_value
  JOIN scenarios s ON s.id = scenario_value
  WHERE o.scenarios IS NOT NULL AND array_length(o.scenarios, 1) > 0
  ON CONFLICT (outfit_id, scenario_id) DO NOTHING;
  
  -- Then try with name match
  INSERT INTO outfit_scenarios (outfit_id, scenario_id, user_id)
  SELECT o.id, s.id, o.user_id
  FROM outfits o
  CROSS JOIN LATERAL unnest(o.scenarios) AS scenario_value
  JOIN scenarios s ON s.name = scenario_value
  WHERE o.scenarios IS NOT NULL AND array_length(o.scenarios, 1) > 0
  ON CONFLICT (outfit_id, scenario_id) DO NOTHING;
  
  -- Migrate capsule scenarios - handle both ID and name formats
  -- First try with ID match
  INSERT INTO capsule_scenarios (capsule_id, scenario_id, user_id)
  SELECT c.id, s.id, c.user_id
  FROM capsules c
  CROSS JOIN LATERAL unnest(c.scenarios) AS scenario_value
  JOIN scenarios s ON s.id = scenario_value
  WHERE c.scenarios IS NOT NULL AND array_length(c.scenarios, 1) > 0
  ON CONFLICT (capsule_id, scenario_id) DO NOTHING;
  
  -- Then try with name match
  INSERT INTO capsule_scenarios (capsule_id, scenario_id, user_id)
  SELECT c.id, s.id, c.user_id
  FROM capsules c
  CROSS JOIN LATERAL unnest(c.scenarios) AS scenario_value
  JOIN scenarios s ON s.name = scenario_value
  WHERE c.scenarios IS NOT NULL AND array_length(c.scenarios, 1) > 0
  ON CONFLICT (capsule_id, scenario_id) DO NOTHING;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error during data migration: %', SQLERRM;
END $$;
