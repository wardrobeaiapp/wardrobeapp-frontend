-- Create the scenario_coverage table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.scenario_coverage (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scenario_id TEXT NOT NULL,
    scenario_name TEXT,
    total_items INTEGER DEFAULT 0,
    matched_items INTEGER DEFAULT 0,
    coverage_percent NUMERIC(5,2) DEFAULT 0,
    category_breakdown JSONB DEFAULT '[]'::jsonb,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT scenario_coverage_user_id_scenario_id_key UNIQUE (user_id, scenario_id)
);

-- Enable RLS
ALTER TABLE public.scenario_coverage ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
    -- View policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'scenario_coverage' 
        AND policyname = 'Users can view their own scenario coverage'
    ) THEN
        CREATE POLICY "Users can view their own scenario coverage" 
        ON public.scenario_coverage
        FOR SELECT
        USING (auth.uid() = user_id);
    END IF;

    -- Update policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'scenario_coverage' 
        AND policyname = 'Users can update their own scenario coverage'
    ) THEN
        CREATE POLICY "Users can update their own scenario coverage"
        ON public.scenario_coverage
        FOR UPDATE
        USING (auth.uid() = user_id);
    END IF;

    -- Insert policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'scenario_coverage' 
        AND policyname = 'Users can insert their own scenario coverage'
    ) THEN
        CREATE POLICY "Users can insert their own scenario coverage"
        ON public.scenario_coverage
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Delete policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'scenario_coverage' 
        AND policyname = 'Users can delete their own scenario coverage'
    ) THEN
        CREATE POLICY "Users can delete their own scenario coverage"
        ON public.scenario_coverage
        FOR DELETE
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_scenario_coverage_user_id 
ON public.scenario_coverage(user_id);

CREATE INDEX IF NOT EXISTS idx_scenario_coverage_scenario_id 
ON public.scenario_coverage(scenario_id);
