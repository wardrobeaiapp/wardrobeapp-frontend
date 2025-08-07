-- SQL script to create the outfits table

-- Drop the table if it exists
DROP TABLE IF EXISTS outfits;

-- Create the outfits table
CREATE TABLE outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  items TEXT[] NOT NULL, -- Array of wardrobe item IDs
  occasion TEXT,
  season TEXT[],
  favorite BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  times_worn INTEGER NOT NULL DEFAULT 0,
  last_worn TIMESTAMP WITH TIME ZONE,
  tags TEXT[]
);

-- Add RLS (Row Level Security) policies
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;

-- Create policy for selecting outfits (users can only see their own outfits)
CREATE POLICY select_own_outfits ON outfits
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for inserting outfits (users can only insert their own outfits)
CREATE POLICY insert_own_outfits ON outfits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for updating outfits (users can only update their own outfits)
CREATE POLICY update_own_outfits ON outfits
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for deleting outfits (users can only delete their own outfits)
CREATE POLICY delete_own_outfits ON outfits
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_outfit_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_outfit_timestamp_trigger
BEFORE UPDATE ON outfits
FOR EACH ROW
EXECUTE FUNCTION update_outfit_timestamp();

-- Grant permissions to authenticated users
GRANT ALL ON outfits TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE outfits_id_seq TO authenticated;
