-- Supabase Database Setup for Monad Voices (Fixed Version)
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access to feedback" ON feedback;
DROP POLICY IF EXISTS "Allow anonymous insert access to feedback" ON feedback;
DROP POLICY IF EXISTS "Allow anonymous read access to contributors" ON contributors;
DROP POLICY IF EXISTS "Allow anonymous insert access to contributors" ON contributors;

-- Add image_url column to feedback table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'feedback' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE feedback ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Add image_url column to contributors table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contributors' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE contributors ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Enable Row Level Security (RLS) if not already enabled
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributors ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (read/write)
CREATE POLICY "Allow anonymous read access to feedback" ON feedback
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access to feedback" ON feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read access to contributors" ON contributors
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access to contributors" ON contributors
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contributors_created_at ON contributors(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_feedback_updated_at ON feedback;
DROP TRIGGER IF EXISTS update_contributors_updated_at ON contributors;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contributors_updated_at BEFORE UPDATE ON contributors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 