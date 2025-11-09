-- Supabase Row Level Security (RLS) Policies
-- Execute this AFTER running supabase-schema.sql

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

-- TEMPORARY: Permissive policies for development (using TEST_USER_ID)
-- These allow all operations without authentication checks
-- TODO: Replace with proper user-based policies when implementing authentication

-- Users table policies (allow all for now)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Tasks table policies (allow all for now)
CREATE POLICY "Allow all operations on tasks" ON tasks
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Accounts table policies (allow all for now)
CREATE POLICY "Allow all operations on accounts" ON accounts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Sessions table policies (allow all for now)
CREATE POLICY "Allow all operations on sessions" ON sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verification tokens table policies (allow all for now)
CREATE POLICY "Allow all operations on verification_tokens" ON verification_tokens
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- NOTE: When implementing authentication, replace the above policies with user-specific ones like:
--
-- CREATE POLICY "Users can read their own tasks" ON tasks
--   FOR SELECT
--   USING (auth.uid()::TEXT = "userId");
--
-- CREATE POLICY "Users can insert their own tasks" ON tasks
--   FOR INSERT
--   WITH CHECK (auth.uid()::TEXT = "userId");
--
-- CREATE POLICY "Users can update their own tasks" ON tasks
--   FOR UPDATE
--   USING (auth.uid()::TEXT = "userId")
--   WITH CHECK (auth.uid()::TEXT = "userId");
--
-- CREATE POLICY "Users can delete their own tasks" ON tasks
--   FOR DELETE
--   USING (auth.uid()::TEXT = "userId");
