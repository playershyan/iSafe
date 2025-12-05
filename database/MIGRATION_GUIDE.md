# Database Migration Guide

## Overview

This project uses a custom migrations folder (`database/migrations`) to store SQL migration files separately from the Prisma schema.

## Migration Structure

```
database/
├── migrations/
│   ├── README.md
│   ├── 20241205_update_missing_person_form.sql
│   └── rollback_20241205_update_missing_person_form.sql
└── MIGRATION_GUIDE.md
```

## Running Migrations

### Option 1: Using Prisma (Recommended for Development)

```bash
# 1. Update your Prisma schema (already done)
# 2. Generate Prisma client
npm run db:generate

# 3. Push schema changes (development only - creates tables if they don't exist)
npm run db:push

# OR use Prisma migrate (creates migration in prisma/migrations)
npm run db:migrate
```

### Option 2: Manual SQL Migration

```bash
# Run a specific migration file
npm run db:migrate:manual 20241205_update_missing_person_form.sql

# Or manually with psql
psql $DATABASE_URL -f database/migrations/20241205_update_missing_person_form.sql
```

### Option 3: Direct Database Connection

If you have direct database access:

```sql
-- Connect to your database and run:
\i database/migrations/20241205_update_missing_person_form.sql
```

## Current Migration: Update Missing Person Form

**File:** `20241205_update_missing_person_form.sql`

**Changes:**
- ✅ Made `lastSeenDate` required (NOT NULL)
- ✅ Made `lastSeenDistrict` optional (nullable)

**Before Running:**
- Ensure you have a database backup
- Check if there are any existing records with NULL `lastSeenDate` (they will be set to current timestamp)

**To Apply:**
```bash
npm run db:migrate:manual 20241205_update_missing_person_form.sql
```

**To Rollback:**
```bash
psql $DATABASE_URL -f database/migrations/rollback_20241205_update_missing_person_form.sql
```

## Creating New Migrations

1. **Update Prisma Schema** (`prisma/schema.prisma`)
2. **Create SQL Migration File** in `database/migrations/`:
   ```sql
   -- Migration: Description
   -- Date: YYYY-MM-DD
   
   -- Your SQL statements here
   ```
3. **Test the Migration** in development
4. **Document** in `database/migrations/README.md`

## Migration Naming Convention

```
YYYYMMDD_description.sql
```

Examples:
- `20241205_update_missing_person_form.sql`
- `20241210_add_photo_public_id.sql`
- `20241215_create_indexes.sql`

## Best Practices

1. ✅ Always backup before running migrations
2. ✅ Test in development first
3. ✅ Review SQL carefully
4. ✅ Create rollback scripts for critical changes
5. ✅ Document changes in README
6. ✅ Keep migrations small and focused
7. ✅ Never modify existing migration files (create new ones)

## Schema Sync

After running migrations, ensure Prisma schema matches:

```bash
# Generate Prisma client
npm run db:generate

# Verify schema is in sync
npm run db:push --dry-run
```

## Troubleshooting

### Migration Fails

1. Check database connection: `npm run db:studio`
2. Verify SQL syntax
3. Check for constraint violations
4. Review error messages carefully

### Schema Out of Sync

```bash
# Reset and regenerate (⚠️ WARNING: This will drop data in development)
npm run db:push --force-reset

# Or manually sync
npm run db:generate
```

### Need to Rollback

Use the rollback script or manually reverse the changes:

```bash
psql $DATABASE_URL -f database/migrations/rollback_YYYYMMDD_description.sql
```

## Production Deployment

For production:

1. **Backup database** first
2. **Review migration** SQL carefully
3. **Test** in staging environment
4. **Run migration** during maintenance window
5. **Verify** schema changes applied correctly
6. **Update** Prisma client: `npm run db:generate`

## Related Commands

```bash
# Database commands
npm run db:push          # Push schema changes (dev only)
npm run db:studio        # Open Prisma Studio
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Create/apply Prisma migrations
npm run db:seed          # Run seed script
npm run db:migrate:manual <file>  # Run custom migration
```

