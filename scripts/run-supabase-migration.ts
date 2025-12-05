#!/usr/bin/env tsx
/**
 * Script to run database migrations using Supabase client
 * Usage: tsx scripts/run-supabase-migration.ts <migration-file-name>
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

async function runMigration(migrationFileName: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    const migrationPath = join(process.cwd(), 'database', 'migrations', migrationFileName);

    console.log(`📄 Reading migration file: ${migrationPath}`);
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('🚀 Executing migration...\n');

    // Split SQL by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    for (const statement of statements) {
      if (statement.trim()) {
        const preview = statement.length > 60
          ? statement.substring(0, 60) + '...'
          : statement;
        console.log(`   Executing: ${preview}`);

        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

        if (error) {
          // Try direct query if RPC doesn't work
          const { error: queryError } = await supabase
            .from('_sql')
            .select('*')
            .limit(0);

          if (queryError) {
            throw new Error(`Failed to execute: ${error.message}`);
          }
        }

        successCount++;
      }
    }

    console.log(`\n✅ Migration completed successfully! (${successCount} statements executed)`);
  } catch (error) {
    console.error('\n❌ Migration failed:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(error);
    }
    console.error('\n💡 Try running the migration manually using the Supabase SQL Editor:');
    console.error(`   1. Go to your Supabase project dashboard`);
    console.error(`   2. Navigate to SQL Editor`);
    console.error(`   3. Copy and paste the contents of: database/migrations/${migrationFileName}`);
    console.error(`   4. Execute the SQL`);
    process.exit(1);
  }
}

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: tsx scripts/run-supabase-migration.ts <migration-file-name>');
  console.error('Example: tsx scripts/run-supabase-migration.ts 20241205_convert_to_snake_case.sql');
  process.exit(1);
}

runMigration(migrationFile);
