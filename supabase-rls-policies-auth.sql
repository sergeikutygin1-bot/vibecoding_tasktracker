-- Updated Supabase Row Level Security (RLS) Policies with Authentication
-- Execute this AFTER implementing authentication
-- This replaces the permissive policies with user-specific ones

-- First, drop the old permissive policies
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow all operations on accounts" ON accounts;
DROP POLICY IF EXISTS "Allow all operations on sessions" ON sessions;
DROP POLICY IF EXISTS "Allow all operations on verification_tokens" ON verification_tokens;

-- Drop existing auth-based policies (makes this script idempotent)
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can read own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can read own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can read own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON sessions;
DROP POLICY IF EXISTS "Anyone can read verification tokens" ON verification_tokens;
DROP POLICY IF EXISTS "Anyone can insert verification tokens" ON verification_tokens;
DROP POLICY IF EXISTS "Anyone can delete verification tokens" ON verification_tokens;

-- Users table policies - users can only manage their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT
  USING (auth.uid()::TEXT = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid()::TEXT = id)
  WITH CHECK (auth.uid()::TEXT = id);

-- Tasks table policies - users can only access their own tasks
CREATE POLICY "Users can read own tasks" ON tasks
  FOR SELECT
  USING (auth.uid()::TEXT = "userId");

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT
  WITH CHECK (auth.uid()::TEXT = "userId");

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE
  USING (auth.uid()::TEXT = "userId")
  WITH CHECK (auth.uid()::TEXT = "userId");

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE
  USING (auth.uid()::TEXT = "userId");

-- Accounts table policies (for OAuth, manage own accounts)
CREATE POLICY "Users can read own accounts" ON accounts
  FOR SELECT
  USING (auth.uid()::TEXT = "userId");

CREATE POLICY "Users can insert own accounts" ON accounts
  FOR INSERT
  WITH CHECK (auth.uid()::TEXT = "userId");

CREATE POLICY "Users can delete own accounts" ON accounts
  FOR DELETE
  USING (auth.uid()::TEXT = "userId");

-- Sessions table policies (manage own sessions)
CREATE POLICY "Users can read own sessions" ON sessions
  FOR SELECT
  USING (auth.uid()::TEXT = "userId");

CREATE POLICY "Users can delete own sessions" ON sessions
  FOR DELETE
  USING (auth.uid()::TEXT = "userId");

-- Verification tokens table policies (public read for verification process)
CREATE POLICY "Anyone can read verification tokens" ON verification_tokens
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert verification tokens" ON verification_tokens
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete verification tokens" ON verification_tokens
  FOR DELETE
  USING (true);
