# Database Migration Guide: Fix Authentication Bug

This guide will fix the issue where new users can't create tasks and don't appear in the Supabase users table.

## Root Cause

Users were being created in Supabase Auth (`auth.users`) but not in the custom `public.users` table. The `tasks` table has a foreign key constraint to `public.users`, preventing new users from creating tasks.

## Solution Overview

We'll set up automatic synchronization between Supabase Auth and the custom users table using database triggers.

---

## Migration Steps

### Prerequisites

1. Access to Supabase Dashboard SQL Editor
2. Backup your database (recommended)
3. Note: These changes are **safe to run multiple times** (idempotent)

### Step 1: Apply Database Schema

**File:** `supabase-schema.sql`

If you haven't already applied this, run it first to create the tables structure.

```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. New Query
# 3. Copy contents of supabase-schema.sql
# 4. Execute
```

### Step 2: Set Up Auto-Sync Trigger (Critical!)

**File:** `supabase-auto-sync-users.sql`

This creates a trigger that automatically creates a `public.users` record whenever a new user signs up via Supabase Auth.

```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. New Query
# 3. Copy contents of supabase-auto-sync-users.sql
# 4. Execute
```

**What this does:**
- Creates a PostgreSQL function `public.handle_new_user()`
- Sets up a trigger on `auth.users` INSERT operations
- Automatically populates `public.users` with id, email, name, avatar from auth metadata
- Uses `ON CONFLICT DO NOTHING` to safely handle duplicates

### Step 3: Sync Existing Users (Backfill)

**File:** `scripts/sync-existing-users.sql`

This one-time script syncs any users who signed up before the trigger was created.

```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. New Query
# 3. Copy contents of scripts/sync-existing-users.sql
# 4. Execute
```

**What this does:**
- Finds all users in `auth.users` that don't exist in `public.users`
- Inserts them into `public.users`
- Reports how many users were synced

**Expected output:**
```
NOTICE:  Sync completed:
NOTICE:    - Auth users (auth.users): X
NOTICE:    - Public users (public.users): X
NOTICE:    - Users should match: YES ✓
```

### Step 4: Apply Row Level Security Policies

**File:** `supabase-rls-policies-auth.sql`

Apply the correct RLS policies that use `auth.uid()` for authentication.

```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. New Query
# 3. Copy contents of supabase-rls-policies-auth.sql
# 4. Execute
```

**Important:** Do NOT use `supabase-rls-policies.sql` - that file has permissive policies that allow all operations without authentication checks.

**What this does:**
- Drops any existing policies
- Creates user-specific RLS policies for `users`, `tasks`, `accounts`, `sessions`, and `verification_tokens` tables
- Ensures users can only read/modify their own data
- Uses `auth.uid()::TEXT` to match authenticated user ID

---

## Verification

### 1. Check Trigger Exists

Run this query in SQL Editor:

```sql
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Expected result:** One row showing the trigger on `auth.users`

### 2. Check User Sync

Run this query to verify users are synced:

```sql
SELECT
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM public.users) as public_users,
  CASE
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.users)
    THEN 'Synced ✓'
    ELSE 'Not synced - investigate!'
  END as status;
```

**Expected result:** `auth_users` and `public_users` counts should match

### 3. Test New User Signup

1. Sign out of your application
2. Create a brand new test user account
3. After signup, run this query:

```sql
SELECT id, email FROM public.users ORDER BY "createdAt" DESC LIMIT 1;
```

**Expected result:** The new user should appear immediately

### 4. Test Task Creation

1. While logged in as the new test user
2. Try to create a new task
3. Check if the task appears in the UI and database

```sql
SELECT id, title, "userId" FROM tasks ORDER BY "createdAt" DESC LIMIT 5;
```

**Expected result:** Tasks created successfully with correct `userId`

---

## Troubleshooting

### Issue: "Foreign key constraint violation" when creating tasks

**Cause:** User exists in `auth.users` but not in `public.users`

**Fix:** Re-run Step 3 (sync-existing-users.sql)

### Issue: "Row level security policy violation"

**Cause:** Wrong RLS policies applied or policies referencing wrong table

**Fix:** Re-run Step 4 (supabase-rls-policies-auth.sql)

### Issue: New users still don't appear in public.users

**Cause:** Trigger not set up correctly

**Fix:**
1. Check if trigger exists (see Verification #1)
2. Re-run Step 2 (supabase-auto-sync-users.sql)
3. Test with a brand new user account

### Issue: "relation 'public.users' does not exist"

**Cause:** Schema not applied

**Fix:** Run Step 1 (supabase-schema.sql) first

---

## Summary of Files

| File | Purpose | Run Order | Run Once or Always? |
|------|---------|-----------|---------------------|
| `supabase-schema.sql` | Create tables | 1 | Once (initial setup) |
| `supabase-auto-sync-users.sql` | Create trigger for auto-sync | 2 | Once (but safe to re-run) |
| `scripts/sync-existing-users.sql` | Backfill existing users | 3 | Once after trigger setup |
| `supabase-rls-policies-auth.sql` | Apply RLS policies | 4 | Once (but safe to re-run) |

---

## Important Notes

- **Order matters:** Always run Step 2 before Step 3
- **Safe to re-run:** All scripts use `DROP IF EXISTS` or `ON CONFLICT` to be idempotent
- **Production safety:** These scripts don't delete data, only add/update
- **Do NOT use:** `supabase-rls-policies.sql` (that's for testing only, no security)

---

## After Migration

Once completed, the system will:
- ✅ Automatically create `public.users` records when users sign up
- ✅ Allow new users to create tasks immediately
- ✅ Enforce RLS policies so users can only access their own data
- ✅ Maintain referential integrity between users and tasks
