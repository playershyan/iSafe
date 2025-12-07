# Database Migrations

This folder contains all SQL migration files for the iSafe platform.

## Quick Start (New Database)

For a **new Supabase database**, run these migrations in order:

1. `001_initial_schema.sql` ⭐
2. `002_staff_centers_and_auth.sql` ⭐
3. `003_phone_verifications.sql` ⭐
4. `005_compensation_system.sql` ⭐
5. `006_insert_gn_data.sql` ⭐
6. `007_add_locale_to_compensation_applications.sql` ⭐
7. `008_enable_rls_and_policies.sql` ⚠️ **SECURITY**
8. `009_fix_function_search_path.sql` ⚠️ **SECURITY**

See [SETUP_GUIDE.md](../SETUP_GUIDE.md) for complete instructions.

## Migration Files

### Core Migrations (Required)

| File | Purpose | Status |
|------|---------|--------|
| `001_initial_schema.sql` | Core tables (missing_persons, persons, shelters, etc.) | ✅ Required |
| `002_staff_centers_and_auth.sql` | Staff centers and authentication | ✅ Required |
| `003_phone_verifications.sql` | OTP verification system | ✅ Required |
| `004_anonymous_users.sql` | Placeholder (no changes) | ⚪ Optional |
| `005_compensation_system.sql` | Compensation application system | ✅ Required |
| `006_insert_gn_data.sql` | Grama Niladhari divisions data | ✅ Required |
| `007_add_locale_to_compensation_applications.sql` | Add locale column for SMS | ✅ Required |
| `008_enable_rls_and_policies.sql` | Enable RLS on all tables | ⚠️ Security |
| `009_fix_function_search_path.sql` | Fix function search_path security | ⚠️ Security |
| `007_add_locale_to_compensation_applications.sql` | Add locale column for SMS | ✅ Required |
| `008_enable_rls_and_policies.sql` | Enable RLS on all tables | ⚠️ Security |

### Legacy Migrations (For Existing Databases Only)

These migrations should **NOT** be run on new databases. Their changes are already included in `001_initial_schema.sql`:

| File | Purpose | When to Use |
|------|---------|-------------|
| `20241205_convert_to_snake_case.sql` | Convert camelCase to snake_case | Only if tables have camelCase columns |
| `20241205_update_missing_person_form.sql` | Update form requirements | Only if `last_seen_date` constraints differ |
| `20241206_add_locale_to_missing_persons.sql` | Add locale column | Only if `locale` column missing |
| `20241206_add_nic_to_missing_persons.sql` | Add NIC column | Only if `nic` column missing |

### Rollback Scripts

Rollback scripts are available for legacy migrations:

- `rollback_20241205_convert_to_snake_case.sql`
- `rollback_20241205_update_missing_person_form.sql`
- `rollback_20241206_add_locale_to_missing_persons.sql`
- `rollback_20241206_add_nic_to_missing_persons.sql`

## Documentation

- **[SETUP_GUIDE.md](../SETUP_GUIDE.md)** - Complete setup instructions
- **[MIGRATION_ORDER.md](./MIGRATION_ORDER.md)** - Detailed migration order guide
- **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** - Complete migration summary

## Execution Order

### New Database
```
1 → 2 → 3 → 5 → 6 → 7 → 8
```

**Note:** Migration 008 (RLS) is recommended for security but can be run later if needed.

### Existing Database (camelCase)
```
1 → 20241205_convert → 20241205_update → 20241206_locale → 20241206_nic → 2 → 3 → 5 → 6
```

### Existing Database (snake_case)
```
1 → 2 → 3 → 5 → 6 → 7 → 8
(Skip legacy migrations if already applied)
```

## Tables Created

After running all migrations, you should have **14 tables**:

1. `administrative_divisions`
2. `compensation_admins`
3. `compensation_applications`
4. `compensation_claims`
5. `districts`
6. `matches`
7. `missing_persons`
8. `persons`
9. `phone_verifications`
10. `shelters`
11. `shelter_auth`
12. `staff_auth`
13. `staff_centers`
14. `statistics`

## Running Migrations

### Using Supabase SQL Editor (Recommended)

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy migration file contents
4. Paste and execute
5. Verify success

### Using Command Line

```bash
# With psql
psql $DATABASE_URL -f database/migrations/001_initial_schema.sql

# Or use Supabase CLI
supabase db reset
```

## Verification

After running migrations, verify:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

## Notes

- All migrations use `IF NOT EXISTS` for safety
- Migrations are idempotent (can be run multiple times safely)
- Foreign keys are properly configured
- Indexes created for performance
- Triggers handle automatic `updated_at` timestamps

## Support

For issues or questions:
1. Check [SETUP_GUIDE.md](../SETUP_GUIDE.md)
2. Review error messages carefully
3. Verify migration order
4. Check table dependencies
