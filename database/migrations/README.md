# Database Migrations

This folder contains SQL migration files for the iSafe database.

## Migration Files

### 20241205_update_missing_person_form.sql
- Made `lastSeenDate` required (NOT NULL)
- Made `lastSeenDistrict` optional (nullable)
- **Note**: This migration used camelCase column names (quoted identifiers)

### 20241205_convert_to_snake_case.sql ⭐ **NEW - REQUIRED**
- **Purpose**: Converts all column names from camelCase to snake_case
- **Why**: Aligns with PostgreSQL/Supabase conventions and fixes API compatibility
- **Impact**: All tables (missing_persons, persons, shelters, shelter_auth, matches, statistics)
- **Status**: ⚠️ **MUST BE RUN TO FIX CURRENT ERRORS**

## Current Issue

The error you're experiencing:
```
Could not find the 'full_name' column of 'missing_persons' in the schema cache
```

This happens because:
1. The database currently has columns like `"fullName"` (camelCase with quotes)
2. The API code is trying to use `full_name` (snake_case)
3. PostgreSQL is case-sensitive with quoted identifiers

**Solution**: Run the `20241205_convert_to_snake_case.sql` migration to rename all columns.

## Running Migrations

### Option 1: Supabase SQL Editor (⭐ Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the entire contents of the migration file
5. Execute the SQL

**For the current fix:**
```sql
-- Copy and paste the contents of:
-- database/migrations/20241205_convert_to_snake_case.sql
```

### Option 2: Command Line (if tsx is installed)

```bash
# Run the snake_case conversion migration
tsx scripts/run-supabase-migration.ts 20241205_convert_to_snake_case.sql
```

### Option 3: Using psql

If you have PostgreSQL command-line tools installed:

```bash
# Get your DATABASE_URL from .env.local
psql "your-database-url-here" -f database/migrations/20241205_convert_to_snake_case.sql
```

## After Running the Migration

Once the snake_case migration is complete:

1. All database columns will use snake_case (e.g., `full_name`, `last_seen_date`)
2. The Prisma schema has been updated with correct `@map` attributes
3. The API routes will work correctly with Supabase client
4. You can create missing person reports without errors

## Rollback

If you need to rollback the snake_case conversion:

```bash
# Using Supabase SQL Editor, run:
# database/migrations/rollback_20241205_convert_to_snake_case.sql
```

## Verification

After running the migration, verify the changes:

```sql
-- Check column names in missing_persons table
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'missing_persons'
ORDER BY ordinal_position;
```

Expected columns should now be:
- `id`
- `created_at` (not `"createdAt"`)
- `full_name` (not `"fullName"`)
- `age`
- `gender`
- `photo_url` (not `"photoUrl"`)
- `last_seen_location` (not `"lastSeenLocation"`)
- etc.

## Future Migrations

When creating new migrations:
1. Use snake_case for all new column names
2. Add corresponding `@map` attributes in Prisma schema
3. Test in development environment first
4. Create rollback scripts for safety

## Notes

- Always backup your database before running migrations in production
- Test migrations in a development environment first
- Review the SQL carefully before executing
