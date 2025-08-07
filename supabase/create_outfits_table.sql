-- Create outfits table in Supabase
CREATE TABLE IF NOT EXISTS public.outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  items TEXT[] DEFAULT '{}',
  scenarios TEXT[] DEFAULT '{}',
  season TEXT[] DEFAULT '{}',
  favorite BOOLEAN DEFAULT false,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_worn TIMESTAMP WITH TIME ZONE,
  user_uuid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own outfits
CREATE POLICY "Users can view their own outfits" 
  ON public.outfits 
  FOR SELECT 
  USING (auth.uid() = user_uuid);

-- Create policy to allow users to insert their own outfits
CREATE POLICY "Users can insert their own outfits" 
  ON public.outfits 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_uuid);

-- Create policy to allow users to update their own outfits
CREATE POLICY "Users can update their own outfits" 
  ON public.outfits 
  FOR UPDATE 
  USING (auth.uid() = user_uuid);

-- Create policy to allow users to delete their own outfits
CREATE POLICY "Users can delete their own outfits" 
  ON public.outfits 
  FOR DELETE 
  USING (auth.uid() = user_uuid);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS outfits_user_uuid_idx ON public.outfits (user_uuid);

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outfits TO authenticated;
