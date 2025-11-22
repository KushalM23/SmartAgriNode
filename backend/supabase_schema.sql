-- SmartAgriNode Supabase Database Schema - Supabase Auth Version
-- This version drops existing tables and recreates them for Supabase Auth integration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (CASCADE will drop dependent tables/policies)
DROP TABLE IF EXISTS weed_detections;
DROP TABLE IF EXISTS crop_recommendations;
DROP TABLE IF EXISTS users;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    username TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);

-- Crop recommendations history
CREATE TABLE IF NOT EXISTS crop_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    input_data JSONB NOT NULL,
    recommended_crop TEXT NOT NULL,
    confidence FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create index on user_id and created_at for faster history queries
CREATE INDEX IF NOT EXISTS idx_crop_recs_user_time ON crop_recommendations(user_id, created_at DESC);

-- Weed detections history
CREATE TABLE IF NOT EXISTS weed_detections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    image_filename TEXT NOT NULL,
    weed_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create index on user_id and created_at for faster history queries
CREATE INDEX IF NOT EXISTS idx_weed_dets_user_time ON weed_detections(user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weed_detections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for crop_recommendations table
CREATE POLICY "Users can view their own recommendations"
    ON crop_recommendations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recommendations"
    ON crop_recommendations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for weed_detections table
CREATE POLICY "Users can view their own detections"
    ON weed_detections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own detections"
    ON weed_detections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup (Trigger)
-- This automatically creates a profile in public.users when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, email, username, avatar_url)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'username', 
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET 
    email = NEW.email,
    username = NEW.raw_user_meta_data->>'username',
    avatar_url = NEW.raw_user_meta_data->>'avatar_url',
    updated_at = NOW()
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table updates
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Storage Bucket Policies (Optional, if you use storage for avatars)
-- Make sure to create a bucket named 'avatars' in Supabase Storage
-- insert into storage.buckets (id, name) values ('avatars', 'avatars');
-- create policy "Avatar images are publicly accessible." on storage.objects for select using ( bucket_id = 'avatars' );
-- create policy "Anyone can upload an avatar." on storage.objects for insert with check ( bucket_id = 'avatars' );
