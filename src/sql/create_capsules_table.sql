-- Create a new table for capsules if it doesn't exist
CREATE TABLE IF NOT EXISTS public.capsules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  scenario TEXT,
  seasons TEXT[] NOT NULL,
  style TEXT,
  main_item_id TEXT,
  selected_items TEXT[] NOT NULL,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Enable row level security
ALTER TABLE public.capsules ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
  -- Check if the select policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'capsules' 
    AND policyname = 'Users can view their own capsules'
  ) THEN
    -- Policy for users to view only their own capsules
    CREATE POLICY "Users can view their own capsules" ON public.capsules
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Check if the insert policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'capsules' 
    AND policyname = 'Users can insert their own capsules'
  ) THEN
    -- Policy for users to insert their own capsules
    CREATE POLICY "Users can insert their own capsules" ON public.capsules
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Check if the update policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'capsules' 
    AND policyname = 'Users can update their own capsules'
  ) THEN
    -- Policy for users to update their own capsules
    CREATE POLICY "Users can update their own capsules" ON public.capsules
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Check and create delete policy if it doesn't exist
DO $$
BEGIN
  -- Check if the delete policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'capsules' 
    AND policyname = 'Users can delete their own capsules'
  ) THEN
    -- Policy for users to delete their own capsules
    CREATE POLICY "Users can delete their own capsules" ON public.capsules
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS capsules_user_id_idx ON public.capsules (user_id);
CREATE INDEX IF NOT EXISTS capsules_date_created_idx ON public.capsules (date_created);
