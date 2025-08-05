-- Supabase Database Setup for Monad Voices
-- Run this in your Supabase SQL Editor

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  tag TEXT NOT NULL CHECK (tag IN ('Recognition', 'Concerns', 'Ideas', 'Community Fun')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contributors table
CREATE TABLE IF NOT EXISTS contributors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  x_handle TEXT NOT NULL,
  contribution TEXT NOT NULL,
  project_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
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

-- Create indexes for better performance
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

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contributors_updated_at BEFORE UPDATE ON contributors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 