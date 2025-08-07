-- Create day_plans table for storing calendar data
CREATE TABLE IF NOT EXISTS day_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  outfit_ids TEXT[] NOT NULL DEFAULT '{}',
  item_ids TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Add a unique constraint to ensure one plan per user per date
  UNIQUE(user_id, date)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE day_plans ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select only their own day plans
CREATE POLICY "Users can view their own day plans" 
  ON day_plans 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own day plans
CREATE POLICY "Users can insert their own day plans" 
  ON day_plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own day plans
CREATE POLICY "Users can update their own day plans" 
  ON day_plans 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy to allow users to delete their own day plans
CREATE POLICY "Users can delete their own day plans" 
  ON day_plans 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS day_plans_user_id_idx ON day_plans(user_id);
CREATE INDEX IF NOT EXISTS day_plans_date_idx ON day_plans(date);
CREATE INDEX IF NOT EXISTS day_plans_user_id_date_idx ON day_plans(user_id, date);
