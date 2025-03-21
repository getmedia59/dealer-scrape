-- Users Table
-- Note: If using Supabase Auth, you might want to use the auth.users table instead
-- and create a public.profiles table that references it

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY users_read_own ON users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Admins can read all users
CREATE POLICY admin_read_all ON users
  FOR SELECT USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

-- Policy: Admins can update all users
CREATE POLICY admin_update_all ON users
  FOR UPDATE USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin'); 