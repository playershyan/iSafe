# Database Migration Summary

## Overview

This document provides a complete summary of all database migrations required for the iSafe platform.

## Complete Table List

All tables required for a functional iSafe installation:

1. **missing_persons** - Public missing person reports
2. **persons** - People registered at displacement camps
3. **shelters** - Displacement camp information (legacy)
4. **shelter_auth** - Shelter authentication (legacy)
5. **matches** - Match records between missing and registered persons
6. **statistics** - Cached dashboard statistics
7. **districts** - District reference data
8. **administrative_divisions** - DS and GN divisions
9. **staff_centers** - Staff centers (new system)
10. **staff_auth** - Staff center authentication
11. **phone_verifications** - OTP verification system
12. **compensation_applications** - Disaster relief applications
13. **compensation_claims** - Individual claims
14. **compensation_admins** - Admin users

## Core Migrations (Required for New Setup)

### 001_initial_schema.sql
**Purpose:** Creates all core tables for the missing person and shelter system.

**Tables Created:**
- `missing_persons` - With all required fields including `locale`, `nic`, `anonymous_user_id`
- `persons` - People at shelters
- `shelters` - Legacy shelter system
- `shelter_auth` - Legacy shelter authentication
- `matches` - Match audit trail
- `statistics` - Cached stats
- `districts` - District reference
- `administrative_divisions` - Administrative divisions structure

**Key Features:**
- All columns use snake_case naming
- Foreign key constraints
- Indexes for performance
- Automatic `updated_at` triggers
- All fields from later migrations included (locale, nic, anonymous_user_id)

### 002_staff_centers_and_auth.sql
**Purpose:** Creates tables for staff center management via compensation dashboard.

**Tables Created:**
- `staff_centers` - Staff centers (displacement camps)
- `staff_auth` - Staff center login credentials

**Notes:**
- Uses UUID for primary keys
- Separate from legacy `shelters` table
- Managed through compensation dashboard

### 003_phone_verifications.sql
**Purpose:** Creates OTP verification system for phone numbers.

**Tables Created:**
- `phone_verifications` - OTP codes and verification status

**Features:**
- Supports anonymous and authenticated users
- Rate limiting support
- Expiration tracking
- Attempt tracking

### 004_anonymous_users.sql
**Purpose:** Placeholder migration (no changes).

**Notes:**
- Anonymous users tracked via `anonymous_user_id` in `missing_persons`
- No dedicated table needed

### 005_compensation_system.sql
**Purpose:** Creates complete compensation application system.

**Tables Created:**
- `compensation_applications` - Relief applications
- `compensation_claims` - Individual claim types
- `compensation_admins` - Admin users for dashboard

**Features:**
- 15 claim types supported
- Status tracking
- Admin dashboard access
- Default admin user creation

### 006_insert_gn_data.sql
**Purpose:** Populates administrative divisions with Grama Niladhari data.

**Data:**
- ~12,000+ records
- All districts, DS divisions, and GN divisions
- GN codes included

### 007_add_locale_to_compensation_applications.sql
**Purpose:** Adds locale column to compensation applications for SMS notifications.

**Changes:**
- Adds `locale` column (VARCHAR(10), defaults to 'en')
- Creates index on locale
- Updates existing records to 'en'

### 008_enable_rls_and_policies.sql
**Purpose:** Enable Row Level Security (RLS) on all tables for security compliance.

**Changes:**
- Enables RLS on all 14 tables
- Creates policies for public read access where appropriate
- Creates service role policies for admin operations
- Restricts sensitive tables to service role only

**Security Notes:**
- Service role key bypasses RLS (application operations unaffected)
- Public policies allow read access to reference data and active records
- Sensitive tables (auth, admin, phone_verifications) restricted to service role

### 009_fix_function_search_path.sql
**Purpose:** Fix security warning for function search_path.

**Changes:**
- Updates `update_updated_at_column` function
- Sets `search_path = public, pg_temp` to prevent search path attacks
- Adds `SECURITY DEFINER` for proper privilege handling
- Replaces function definition from all previous migrations

**Security Notes:**
- Prevents search path manipulation attacks
- Function now uses explicit search_path
- Required for production security compliance

## Legacy Migrations (For Existing Databases Only)

These migrations should NOT be run on new databases as their changes are already included in `001_initial_schema.sql`:

### 20241205_convert_to_snake_case.sql
**Purpose:** Converts camelCase columns to snake_case.

**When to use:** Only if tables were created with camelCase column names.

**Status:** ✅ Included in 001 for new databases

### 20241205_update_missing_person_form.sql
**Purpose:** Makes `last_seen_date` required and `last_seen_district` optional.

**When to use:** Only if existing database has different constraints.

**Status:** ✅ Included in 001 for new databases

### 20241206_add_locale_to_missing_persons.sql
**Purpose:** Adds `locale` column to `missing_persons`.

**When to use:** Only if `locale` column is missing.

**Status:** ✅ Included in 001 for new databases

### 20241206_add_nic_to_missing_persons.sql
**Purpose:** Adds `nic` column to `missing_persons`.

**When to use:** Only if `nic` column is missing.

**Status:** ✅ Included in 001 for new databases

## Migration Dependencies

```
001_initial_schema.sql
  ├─> 002_staff_centers_and_auth.sql
  ├─> 003_phone_verifications.sql
  └─> 005_compensation_system.sql
      └─> 006_insert_gn_data.sql (requires administrative_divisions from 001)
```

## Required Extensions

Before running migrations, ensure these PostgreSQL extensions are enabled:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- Optional: for text search
CREATE EXTENSION IF NOT EXISTS "unaccent";   -- Optional: for accent-insensitive search
```

## Verification Queries

After running migrations, verify:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Should return 14 tables

-- Check missing_persons has all required columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'missing_persons'
ORDER BY ordinal_position;

-- Should include: locale, nic, anonymous_user_id

-- Check indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## Quick Setup Checklist

For a new Supabase database:

- [ ] Enable extensions (uuid-ossp, pg_trgm, unaccent)
- [ ] Run 001_initial_schema.sql
- [ ] Run 002_staff_centers_and_auth.sql
- [ ] Run 003_phone_verifications.sql
- [ ] Run 005_compensation_system.sql
- [ ] Run 006_insert_gn_data.sql (large file, may take time)
- [ ] Verify all 14 tables exist
- [ ] Create default admin user
- [ ] Test database connection
- [ ] Generate TypeScript types

## Files Reference

**Core Migrations:**
- `001_initial_schema.sql` - Core tables
- `002_staff_centers_and_auth.sql` - Staff centers
- `003_phone_verifications.sql` - OTP system
- `004_anonymous_users.sql` - Placeholder
- `005_compensation_system.sql` - Compensation system
- `006_insert_gn_data.sql` - GN divisions data

**Legacy Migrations (for existing DBs):**
- `20241205_convert_to_snake_case.sql`
- `20241205_update_missing_person_form.sql`
- `20241206_add_locale_to_missing_persons.sql`
- `20241206_add_nic_to_missing_persons.sql`

**Documentation:**
- `MIGRATION_ORDER.md` - Execution order guide
- `SETUP_GUIDE.md` - Complete setup instructions
- `README.md` - General migration info
- `MIGRATION_SUMMARY.md` - This file

## Notes

- All new migrations use `CREATE TABLE IF NOT EXISTS` for safety
- All migrations use `CREATE INDEX IF NOT EXISTS` for safety
- Triggers are dropped and recreated to ensure they're up to date
- Foreign keys use appropriate ON DELETE actions
- Timestamps use TIMESTAMPTZ for timezone support

## Support

For issues:
1. Check migration order
2. Verify all dependencies met
3. Check for existing tables/columns
4. Review error messages
5. Check Supabase logs

