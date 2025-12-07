# Migration Execution Order

This document specifies the correct order for running database migrations.

## For New Databases

Run migrations in this exact order:

```
1. 001_initial_schema.sql           ⭐ REQUIRED - Core tables
2. 002_staff_centers_and_auth.sql   ⭐ REQUIRED - Staff centers
3. 003_phone_verifications.sql      ⭐ REQUIRED - OTP system
4. 004_anonymous_users.sql          ⚪ PLACEHOLDER (no changes)
5. 005_compensation_system.sql      ⭐ REQUIRED - Compensation
6. 006_insert_gn_data.sql           ⭐ REQUIRED - GN divisions data
```

**Total time:** ~5-10 minutes (006 is large)

## For Existing Databases

If you have an existing database with some tables already created:

### If tables use camelCase columns:
```
1. 001_initial_schema.sql (or existing schema)
2. 20241205_convert_to_snake_case.sql  ⚠️ REQUIRED
3. 20241205_update_missing_person_form.sql
4. 20241206_add_locale_to_missing_persons.sql
5. 20241206_add_nic_to_missing_persons.sql
6. 002_staff_centers_and_auth.sql
7. 003_phone_verifications.sql
8. 005_compensation_system.sql
9. 006_insert_gn_data.sql
```

### If tables already use snake_case:
```
1. Check which tables exist
2. Run missing migrations in order:
   - 001_initial_schema.sql (only missing tables)
   - 002_staff_centers_and_auth.sql
   - 003_phone_verifications.sql
   - 005_compensation_system.sql
   - 006_insert_gn_data.sql
3. Skip: 20241205_* and 20241206_* (already applied or not needed)
```

## Migration Dependencies

### 001_initial_schema.sql depends on:
- PostgreSQL extensions: uuid-ossp, pg_trgm, unaccent (optional)

### 002_staff_centers_and_auth.sql depends on:
- ✅ 001 (uses same trigger function)

### 003_phone_verifications.sql depends on:
- ✅ 001 (uses same trigger function)

### 005_compensation_system.sql depends on:
- ✅ administrative_divisions table (from 001 or 006)

### 006_insert_gn_data.sql depends on:
- ✅ administrative_divisions table (from 001)

## Quick Reference

**New Setup:**
```bash
1 → 2 → 3 → 5 → 6
```

**Existing Setup (camelCase):**
```bash
1 → 20241205_convert → 20241205_update → 20241206_locale → 20241206_nic → 2 → 3 → 5 → 6
```

**Existing Setup (snake_case):**
```bash
1 → 2 → 3 → 5 → 6
(Skip 20241205_* and 20241206_* if already applied)
```

## Verification After Each Migration

After running a migration, verify it succeeded:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if specific table has expected columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'missing_persons'
ORDER BY ordinal_position;
```

## Rollback

If a migration fails, check the error message and:
1. Fix any issues
2. Manually revert changes if needed
3. Re-run the migration

Some migrations have rollback scripts:
- `rollback_20241205_convert_to_snake_case.sql`
- `rollback_20241205_update_missing_person_form.sql`
- `rollback_20241206_add_locale_to_missing_persons.sql`
- `rollback_20241206_add_nic_to_missing_persons.sql`

