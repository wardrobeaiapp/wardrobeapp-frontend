-- SQL script to create the wardrobe_items table

-- Drop the table if it exists
DROP TABLE IF EXISTS wardrobe_items;

-- Create the wardrobe_items table
CREATE TABLE wardrobe_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  color TEXT NOT NULL,
  size TEXT,
  material TEXT,
  brand TEXT,
  price NUMERIC,
  season TEXT[] NOT NULL,
  image_url TEXT,
  date_added TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_worn TIMESTAMP WITH TIME ZONE,
  times_worn INTEGER NOT NULL DEFAULT 0,
  tags TEXT[],
  wishlist BOOLEAN DEFAULT FALSE,
  wishlist_status TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add constraints
  CONSTRAINT valid_category CHECK (category IN ('top', 'bottom', 'outerwear', 'one_piece', 'accessory', 'footwear', 'other')),
  CONSTRAINT valid_wishlist_status CHECK (wishlist_status IS NULL OR wishlist_status IN ('approved', 'potential_issue', 'not_reviewed'))
);

-- Create index for faster queries
CREATE INDEX idx_wardrobe_items_user_id ON wardrobe_items(user_id);

-- Add RLS (Row Level Security) policy to restrict access to own items
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY wardrobe_items_policy ON wardrobe_items
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wardrobe_items_updated_at
BEFORE UPDATE ON wardrobe_items
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Comment on table and columns for documentation
COMMENT ON TABLE wardrobe_items IS 'Stores all wardrobe items for users';
COMMENT ON COLUMN wardrobe_items.id IS 'Primary key';
COMMENT ON COLUMN wardrobe_items.user_id IS 'Foreign key to auth.users table';
COMMENT ON COLUMN wardrobe_items.category IS 'Item category (top, bottom, etc.)';
COMMENT ON COLUMN wardrobe_items.season IS 'Array of seasons the item is appropriate for';
COMMENT ON COLUMN wardrobe_items.tags IS 'Array of user-defined tags for the item';
COMMENT ON COLUMN wardrobe_items.wishlist IS 'Whether the item is on the wishlist';
COMMENT ON COLUMN wardrobe_items.wishlist_status IS 'Status of the wishlist item (approved, potential_issue, not_reviewed)';
