-- Create outfit_items join table
CREATE TABLE IF NOT EXISTS outfit_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(outfit_id, item_id) -- Prevent duplicate item entries in an outfit
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS outfit_items_outfit_id_idx ON outfit_items(outfit_id);
CREATE INDEX IF NOT EXISTS outfit_items_item_id_idx ON outfit_items(item_id);
CREATE INDEX IF NOT EXISTS outfit_items_user_id_idx ON outfit_items(user_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;

-- Policy for selecting records (users can only see their own outfit_items)
CREATE POLICY outfit_items_select_policy ON outfit_items 
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for inserting records (users can only insert their own outfit_items)
CREATE POLICY outfit_items_insert_policy ON outfit_items 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating records (users can only update their own outfit_items)
CREATE POLICY outfit_items_update_policy ON outfit_items 
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for deleting records (users can only delete their own outfit_items)
CREATE POLICY outfit_items_delete_policy ON outfit_items 
  FOR DELETE USING (auth.uid() = user_id);

-- Create a function to migrate existing data
CREATE OR REPLACE FUNCTION migrate_outfit_items() RETURNS void AS $$
DECLARE
  outfit_record RECORD;
  current_item_id UUID;
BEGIN
  -- Loop through each outfit
  FOR outfit_record IN SELECT id, items, user_uuid FROM outfits LOOP
    -- Loop through each item ID in the outfit's items array
    FOREACH current_item_id IN ARRAY outfit_record.items LOOP
      -- Insert a record into the outfit_items table
      -- Skip if the item doesn't exist anymore (prevents foreign key errors)
      BEGIN
        -- First check if the item exists and belongs to the user
        PERFORM 1 FROM wardrobe_items 
        WHERE id = current_item_id AND user_id = outfit_record.user_uuid;
        
        -- If the item exists, insert it into the outfit_items table
        IF FOUND THEN
          INSERT INTO outfit_items (outfit_id, item_id, user_id)
          VALUES (outfit_record.id, current_item_id, outfit_record.user_uuid)
          ON CONFLICT (outfit_id, item_id) DO NOTHING;
        END IF;
      EXCEPTION WHEN foreign_key_violation THEN
        -- Item doesn't exist anymore, skip it
        CONTINUE;
      END;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_outfit_items();

-- Drop the migration function after use
DROP FUNCTION migrate_outfit_items();
