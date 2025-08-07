-- Create capsule_items join table
CREATE TABLE IF NOT EXISTS capsule_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(capsule_id, item_id)
);

-- Add RLS (Row Level Security) policies
ALTER TABLE capsule_items ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select their own capsule items
CREATE POLICY select_own_capsule_items ON capsule_items
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert their own capsule items
CREATE POLICY insert_own_capsule_items ON capsule_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own capsule items
CREATE POLICY update_own_capsule_items ON capsule_items
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to delete their own capsule items
CREATE POLICY delete_own_capsule_items ON capsule_items
  FOR DELETE USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX idx_capsule_items_capsule_id ON capsule_items(capsule_id);
CREATE INDEX idx_capsule_items_item_id ON capsule_items(item_id);
CREATE INDEX idx_capsule_items_user_id ON capsule_items(user_id);
