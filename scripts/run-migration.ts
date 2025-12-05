#!/usr/bin/env tsx
/**
 * Script to run database migrations from database/migrations folder
 * Usage: tsx scripts/run-migration.ts <migration-file-name>
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runMigration(migrationFileName: string) {
  try {
    const migrationPath = join(process.cwd(), 'database', 'migrations', migrationFileName);
    
    console.log(`Reading migration file: ${migrationPath}`);
    const sql = readFileSync(migrationPath, 'utf-8');
    
    console.log('Executing migration...');
    
    // Split SQL by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await prisma.$executeRawUnsafe(statement);
      }
    }
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: tsx scripts/run-migration.ts <migration-file-name>');
  console.error('Example: tsx scripts/run-migration.ts 20241205_update_missing_person_form.sql');
  process.exit(1);
}

runMigration(migrationFile);

