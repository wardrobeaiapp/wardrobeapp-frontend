-- Add scenarios column to capsules table
ALTER TABLE public.capsules 
ADD COLUMN IF NOT EXISTS scenarios TEXT[];

-- Comment on the column
COMMENT ON COLUMN public.capsules.scenarios IS 'Array of scenario names or IDs for the capsule';
