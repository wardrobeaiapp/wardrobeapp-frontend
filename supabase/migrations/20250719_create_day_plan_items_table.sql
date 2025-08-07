-- Create day_plan_items join table
CREATE TABLE IF NOT EXISTS day_plan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_plan_id UUID NOT NULL REFERENCES day_plans(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(day_plan_id, item_id)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE day_plan_items ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select their own day plan items
CREATE POLICY select_own_day_plan_items ON day_plan_items
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert their own day plan items
CREATE POLICY insert_own_day_plan_items ON day_plan_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own day plan items
CREATE POLICY update_own_day_plan_items ON day_plan_items
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to delete their own day plan items
CREATE POLICY delete_own_day_plan_items ON day_plan_items
  FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_day_plan_items_day_plan_id ON day_plan_items(day_plan_id);
CREATE INDEX idx_day_plan_items_item_id ON day_plan_items(item_id);
CREATE INDEX idx_day_plan_items_user_id ON day_plan_items(user_id);
