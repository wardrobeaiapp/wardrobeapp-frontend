-- Add season column to scenario_coverage table
ALTER TABLE scenario_coverage 
ADD COLUMN season TEXT DEFAULT 'all';

-- Update the unique constraint to include season
ALTER TABLE scenario_coverage 
DROP CONSTRAINT IF EXISTS scenario_coverage_user_id_scenario_id_key;

ALTER TABLE scenario_coverage
ADD CONSTRAINT scenario_coverage_user_id_scenario_id_season_key 
UNIQUE (user_id, scenario_id, season);

-- Update indexes to include season for better query performance
DROP INDEX IF EXISTS idx_scenario_coverage_user_id;
DROP INDEX IF EXISTS idx_scenario_coverage_scenario_id;

CREATE INDEX idx_scenario_coverage_user_id_season 
ON public.scenario_coverage(user_id, season);

CREATE INDEX idx_scenario_coverage_scenario_id_season 
ON public.scenario_coverage(scenario_id, season);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own scenario coverage" ON public.scenario_coverage;
DROP POLICY IF EXISTS "Users can insert their own scenario coverage" ON public.scenario_coverage;
DROP POLICY IF EXISTS "Users can update their own scenario coverage" ON public.scenario_coverage;
DROP POLICY IF EXISTS "Users can delete their own scenario coverage" ON public.scenario_coverage;

-- Create new policies
CREATE POLICY "Users can view their own scenario coverage" 
ON public.scenario_coverage
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scenario coverage"
ON public.scenario_coverage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenario coverage"
ON public.scenario_coverage
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenario coverage"
ON public.scenario_coverage
FOR DELETE
USING (auth.uid() = user_id);
