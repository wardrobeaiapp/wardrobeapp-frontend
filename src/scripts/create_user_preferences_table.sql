-- Create user_preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Daily activities
  daily_activities TEXT[] DEFAULT '{}',
  office_dress_code TEXT,
  remote_work_priority TEXT,
  creative_mobility TEXT,
  
  -- Style preferences
  preferred_styles TEXT[] DEFAULT '{}',
  comfort_vs_style INTEGER CHECK (comfort_vs_style BETWEEN 0 AND 100),
  classic_vs_trendy INTEGER CHECK (classic_vs_trendy BETWEEN 0 AND 100),
  basics_vs_statements INTEGER CHECK (basics_vs_statements BETWEEN 0 AND 100),
  style_additional_notes TEXT,
  
  -- Climate preference
  local_climate TEXT,
  
  -- Leisure activities
  leisure_activities TEXT[] DEFAULT '{}',
  other_leisure_activity TEXT,
  outdoor_frequency_value INTEGER,
  outdoor_frequency_period TEXT,
  social_frequency_value INTEGER,
  social_frequency_period TEXT,
  formal_events_frequency_value INTEGER,
  formal_events_frequency_period TEXT,
  travel_frequency TEXT,
  
  -- Wardrobe goals
  wardrobe_goals TEXT[] DEFAULT '{}',
  other_wardrobe_goal TEXT,
  
  -- Shopping limits and budget
  shopping_limit_frequency TEXT,
  shopping_limit_amount DECIMAL(10, 2),
  clothing_budget_amount DECIMAL(10, 2),
  clothing_budget_currency TEXT,
  clothing_budget_frequency TEXT,
  
  -- Legacy fields
  seasonal_preferences TEXT[] DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint to ensure one record per user
  CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- Create RLS policies
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update the updated_at timestamp
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
