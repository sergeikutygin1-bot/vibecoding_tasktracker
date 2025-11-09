/**
 * Import data to Supabase from exported JSON
 * Run with: npx tsx scripts/import-to-supabase.ts
 *
 * Prerequisites:
 * 1. Execute supabase-schema.sql in Supabase SQL Editor
 * 2. Execute supabase-rls-policies.sql in Supabase SQL Editor
 * 3. Update .env with your Supabase credentials
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables in .env file');
  console.log('\nPlease add the following to your .env file:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your-project-url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function importData() {
  console.log('📦 Importing data to Supabase...\n');

  try {
    // Read exported data
    const dataPath = join(process.cwd(), 'data-export.json');
    const rawData = readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(rawData);

    console.log(`📊 Data to import:`);
    console.log(`   - Users: ${data.users.length}`);
    console.log(`   - Tasks: ${data.tasks.length}`);
    console.log(`   - Accounts: ${data.accounts.length}`);
    console.log(`   - Sessions: ${data.sessions.length}`);
    console.log(`   - Verification Tokens: ${data.verificationTokens.length}\n`);

    // Import users
    if (data.users.length > 0) {
      console.log('👤 Importing users...');
      const { data: insertedUsers, error: usersError } = await supabase
        .from('users')
        .insert(data.users)
        .select();

      if (usersError) {
        console.error('❌ Error importing users:', usersError.message);
        throw usersError;
      }
      console.log(`✅ Imported ${insertedUsers?.length || 0} users\n`);
    }

    // Import tasks
    if (data.tasks.length > 0) {
      console.log('📝 Importing tasks...');
      const { data: insertedTasks, error: tasksError } = await supabase
        .from('tasks')
        .insert(data.tasks)
        .select();

      if (tasksError) {
        console.error('❌ Error importing tasks:', tasksError.message);
        throw tasksError;
      }
      console.log(`✅ Imported ${insertedTasks?.length || 0} tasks\n`);
    }

    // Import accounts
    if (data.accounts.length > 0) {
      console.log('🔑 Importing accounts...');
      const { data: insertedAccounts, error: accountsError } = await supabase
        .from('accounts')
        .insert(data.accounts)
        .select();

      if (accountsError) {
        console.error('❌ Error importing accounts:', accountsError.message);
        throw accountsError;
      }
      console.log(`✅ Imported ${insertedAccounts?.length || 0} accounts\n`);
    }

    // Import sessions
    if (data.sessions.length > 0) {
      console.log('🔐 Importing sessions...');
      const { data: insertedSessions, error: sessionsError } = await supabase
        .from('sessions')
        .insert(data.sessions)
        .select();

      if (sessionsError) {
        console.error('❌ Error importing sessions:', sessionsError.message);
        throw sessionsError;
      }
      console.log(`✅ Imported ${insertedSessions?.length || 0} sessions\n`);
    }

    // Import verification tokens
    if (data.verificationTokens.length > 0) {
      console.log('🎫 Importing verification tokens...');
      const { data: insertedTokens, error: tokensError } = await supabase
        .from('verification_tokens')
        .insert(data.verificationTokens)
        .select();

      if (tokensError) {
        console.error('❌ Error importing verification tokens:', tokensError.message);
        throw tokensError;
      }
      console.log(`✅ Imported ${insertedTokens?.length || 0} verification tokens\n`);
    }

    console.log('🎉 Data import completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify data in Supabase dashboard');
    console.log('2. Update API routes to use Supabase client');
    console.log('3. Test the application');

  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  }
}

importData();
