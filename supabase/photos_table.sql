-- Create photos table for storing photo metadata
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  baby_id UUID NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_photos_baby_id ON photos(baby_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);

-- Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow users to only see their own photos
CREATE POLICY "Users can view their own photos" ON photos
  FOR SELECT USING (user_id = auth.uid());

-- Create RLS policy to allow users to insert their own photos
CREATE POLICY "Users can insert their own photos" ON photos
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policy to allow users to update their own photos
CREATE POLICY "Users can update their own photos" ON photos
  FOR UPDATE USING (user_id = auth.uid());

-- Create RLS policy to allow users to delete their own photos
CREATE POLICY "Users can delete their own photos" ON photos
  FOR DELETE USING (user_id = auth.uid());
