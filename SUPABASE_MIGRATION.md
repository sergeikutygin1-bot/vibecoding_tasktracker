# Supabase Migration Guide

This guide outlines the steps to complete the migration from Prisma/SQLite to Supabase.

## Prerequisites

- Supabase project created
- Supabase URL and anonymous key available

## Migration Steps

### 1. Configure Environment Variables

Update your `.env` file with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://rdixydltkysmlmaoiwvo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkaXh5ZGx0a3lzbWxtYW9pd3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MjU0NTYsImV4cCI6MjA3ODIwMTQ1Nn0.Xccrt7ple-z9GHlA022Ps1bWtu-60VtFuo69jJb1GtI
```

You can find these values in your Supabase project dashboard:
- Go to **Project Settings** → **API**
- Copy the **Project URL** for `NEXT_PUBLIC_SUPABASE_URL`
- Copy the **anon public** key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Create Database Tables

Execute the SQL schema in Supabase:

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `supabase-schema.sql`
5. Execute the query

This will create all necessary tables (users, tasks, accounts, sessions, verification_tokens) with proper indexes and constraints.

### 3. Set Up Row Level Security

Execute the RLS policies in Supabase:

1. In the **SQL Editor**, create another new query
2. Copy the contents of `supabase-rls-policies.sql`
3. Execute the query

**Note:** The current RLS policies are permissive (allow all operations) for development purposes. When you implement authentication later, you'll need to update these policies.

### 4. Import Existing Data

Your data has been exported to `data-export.json`. To import it into Supabase:

```bash
npx tsx scripts/import-to-supabase.ts
```

This script will:
- Read the exported data
- Insert users, tasks, accounts, sessions, and verification tokens
- Report any errors during the import process

**Summary of exported data:**
- Users: 1
- Tasks: 4
- Accounts: 0
- Sessions: 0
- Verification Tokens: 0

### 5. Verify the Migration

After running the import script:

1. Check the Supabase dashboard → **Table Editor**
2. Verify that all tables have the correct data
3. Test the API routes to ensure they work with Supabase

## Post-Migration

Once the migration is complete and verified:

1. The API routes have been updated to use Supabase client
2. Prisma dependencies have been removed
3. The `prisma/` folder has been deleted

## Troubleshooting

### Import Script Fails

- Ensure you've executed both SQL files (`supabase-schema.sql` and `supabase-rls-policies.sql`)
- Verify your environment variables are correct
- Check the Supabase dashboard for any error messages

### API Routes Not Working

- Verify the Supabase client is properly configured in `lib/supabase.ts`
- Check that environment variables are loaded correctly
- Ensure the tables were created successfully

## Future: Implementing Authentication

When you're ready to implement authentication:

1. Replace `TEST_USER_ID` with actual Supabase Auth
2. Update RLS policies to use `auth.uid()`
3. Implement sign-up/sign-in flows
4. Update API routes to get user ID from auth session

Refer to the Supabase Auth documentation: https://supabase.com/docs/guides/auth
