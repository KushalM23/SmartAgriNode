-- SmartAgriNode Supabase Database Schema - Clean Install
-- This version drops existing policies before recreating them

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own recommendations" ON crop_recommendations;
DROP POLICY IF EXISTS "Users can insert their own recommendations" ON crop_recommendations;
DROP POLICY IF EXISTS "Users can view their own detections" ON weed_detections;
DROP POLICY IF EXISTS "Users can insert their own detections" ON weed_detections;

-- Users table (metadata from Clerk)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clerk_user_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on clerk_user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);

-- Crop recommendations history
CREATE TABLE IF NOT EXISTS crop_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clerk_user_id TEXT NOT NULL,
    input_data JSONB NOT NULL,
    recommended_crop TEXT NOT NULL,
    confidence FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (clerk_user_id) REFERENCES users(clerk_user_id) ON DELETE CASCADE
);

-- Create index on clerk_user_id and created_at for faster history queries
CREATE INDEX IF NOT EXISTS idx_crop_recs_user_time ON crop_recommendations(clerk_user_id, created_at DESC);

-- Weed detections history
CREATE TABLE IF NOT EXISTS weed_detections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clerk_user_id TEXT NOT NULL,
    image_filename TEXT NOT NULL,
    weed_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (clerk_user_id) REFERENCES users(clerk_user_id) ON DELETE CASCADE
);

-- Create index on clerk_user_id and created_at for faster history queries
CREATE INDEX IF NOT EXISTS idx_weed_dets_user_time ON weed_detections(clerk_user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weed_detections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own data"
    ON users FOR INSERT
    WITH CHECK (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (clerk_user_id = auth.uid()::text);

-- RLS Policies for crop_recommendations table
CREATE POLICY "Users can view their own recommendations"
    ON crop_recommendations FOR SELECT
    USING (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own recommendations"
    ON crop_recommendations FOR INSERT
    WITH CHECK (clerk_user_id = auth.uid()::text);

-- RLS Policies for weed_detections table
CREATE POLICY "Users can view their own detections"
    ON weed_detections FOR SELECT
    USING (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own detections"
    ON weed_detections FOR INSERT
    WITH CHECK (clerk_user_id = auth.uid()::text);

-- Drop existing function/trigger if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'User metadata synced from Clerk authentication';
COMMENT ON TABLE crop_recommendations IS 'History of crop recommendation requests and results';
COMMENT ON TABLE weed_detections IS 'History of weed detection requests and results';
