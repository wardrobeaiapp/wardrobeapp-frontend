-- Create day_plan_outfits join table
CREATE TABLE IF NOT EXISTS day_plan_outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_plan_id UUID NOT NULL REFERENCES day_plans(id) ON DELETE CASCADE,
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(day_plan_id, outfit_id)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE day_plan_outfits ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select their own day plan outfits
CREATE POLICY select_own_day_plan_outfits ON day_plan_outfits
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert their own day plan outfits
CREATE POLICY insert_own_day_plan_outfits ON day_plan_outfits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own day plan outfits
CREATE POLICY update_own_day_plan_outfits ON day_plan_outfits
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to delete their own day plan outfits
CREATE POLICY delete_own_day_plan_outfits ON day_plan_outfits
  FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_day_plan_outfits_day_plan_id ON day_plan_outfits(day_plan_id);
CREATE INDEX idx_day_plan_outfits_outfit_id ON day_plan_outfits(outfit_id);
CREATE INDEX idx_day_plan_outfits_user_id ON day_plan_outfits(user_id);
