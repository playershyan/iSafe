# iSafe Database Setup Guide

This guide provides step-by-step instructions to set up a complete iSafe database in a new Supabase project.

## Prerequisites

- A Supabase project (free tier is sufficient)
- Access to Supabase SQL Editor
- Database connection details

## Migration Order

Migrations must be run in the following order:

1. **001_initial_schema.sql** - Core tables (missing_persons, persons, shelters, etc.)
2. **002_staff_centers_and_auth.sql** - Staff centers and authentication
3. **003_phone_verifications.sql** - Phone OTP verification system
4. **004_anonymous_users.sql** - Placeholder (no changes)
5. **005_compensation_system.sql** - Compensation application system
6. **006_insert_gn_data.sql** - Grama Niladhari divisions data
7. **20241205_convert_to_snake_case.sql** - Convert column names (if needed)
8. **20241205_update_missing_person_form.sql** - Form requirements update (if needed)
9. **20241206_add_locale_to_missing_persons.sql** - Add locale support (if not in 001)
10. **20241206_add_nic_to_missing_persons.sql** - Add NIC field (if not in 001)

## Quick Setup (New Database)

For a **brand new Supabase database**, follow these steps:

### Step 1: Enable Required Extensions

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text similarity searches
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- For accent-insensitive search
```

### Step 2: Run Migrations in Order

Execute each migration file in sequence using the Supabase SQL Editor:

1. Copy contents of `001_initial_schema.sql` → Execute
2. Copy contents of `002_staff_centers_and_auth.sql` → Execute
3. Copy contents of `003_phone_verifications.sql` → Execute
4. Copy contents of `005_compensation_system.sql` → Execute
5. Copy contents of `006_insert_gn_data.sql` → Execute
6. Copy contents of `007_add_locale_to_compensation_applications.sql` → Execute
7. Copy contents of `008_enable_rls_and_policies.sql` → Execute ⚠️ **SECURITY**
8. Copy contents of `009_fix_function_search_path.sql` → Execute ⚠️ **SECURITY**

**Note:** Migrations 004, 20241205_*, and 20241206_* are not needed for new setups as 001 already includes those changes.

### Step 3: Verify Tables Created

Run this query to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Expected tables:
- administrative_divisions
- compensation_admins
- compensation_applications
- compensation_claims
- districts
- matches
- missing_persons
- persons
- phone_verifications
- shelters
- shelter_auth
- staff_auth
- staff_centers
- statistics

### Step 4: Create Default Admin User

Run the seed script to create the default admin user:

```bash
npx tsx scripts/seed-compensation-admin.ts
```

Or manually insert:

```sql
-- Default admin credentials:
-- Username: admin
-- Password: Admin@2025
-- ⚠️ CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN!

INSERT INTO compensation_admins (username, password_hash, full_name, email, role)
VALUES (
  'admin',
  '$2a$10$YourHashedPasswordHere', -- Replace with bcrypt hash
  'System Administrator',
  'admin@isafe.gov.lk',
  'SUPER_ADMIN'
) ON CONFLICT (username) DO NOTHING;
```

**To generate password hash:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword123!', 10).then(hash => console.log(hash));"
```

### Step 5: Set Up Storage (Optional but Recommended)

1. Go to **Storage** in Supabase dashboard
2. Create bucket named `isafe-photos`
3. Set as **Public bucket**
4. Configure file size limit (recommended: 10MB)

### Step 6: Row Level Security (RLS)

RLS is automatically enabled by migration `008_enable_rls_and_policies.sql`. This migration:
- Enables RLS on all tables
- Creates appropriate policies for public/service role access
- Maintains security while allowing the application to function

**Note:** The application uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS, but RLS policies protect against:
- Direct database access via anon key
- Accidental exposure of credentials
- Future authentication integration

Migration `008` handles all RLS setup automatically.

## Migration Details

### 001_initial_schema.sql
**Tables Created:**
- `missing_persons` - Public missing person reports
- `persons` - People registered at shelters
- `shelters` - Displacement camp information
- `shelter_auth` - Shelter login credentials
- `matches` - Match records between missing and registered persons
- `statistics` - Cached statistics
- `districts` - District reference data
- `administrative_divisions` - DS and GN divisions

**Key Features:**
- All tables use snake_case naming
- Proper foreign key constraints
- Indexes for performance
- Automatic `updated_at` triggers

### 002_staff_centers_and_auth.sql
**Tables Created:**
- `staff_centers` - Staff centers managed through compensation dashboard
- `staff_auth` - Staff center access credentials

**Purpose:**
- Allows compensation admins to create and manage staff centers
- Each center can have login credentials for staff access

### 003_phone_verifications.sql
**Tables Created:**
- `phone_verifications` - OTP codes for phone verification

**Purpose:**
- Stores OTP codes for phone verification
- Supports both anonymous and authenticated users
- Includes rate limiting support

### 005_compensation_system.sql
**Tables Created:**
- `compensation_applications` - Disaster relief applications
- `compensation_claims` - Individual claims within applications
- `compensation_admins` - Admin users for compensation dashboard

**Purpose:**
- Complete compensation application system
- Multiple claim types support
- Admin dashboard access control

### 006_insert_gn_data.sql
**Purpose:**
- Inserts all Grama Niladhari division data
- Required for compensation application forms
- Contains ~12,000+ records

## Legacy Migrations

The following migrations are for **existing databases only** and should NOT be run on a new database:

- `20241205_convert_to_snake_case.sql` - Only needed if tables have camelCase columns
- `20241205_update_missing_person_form.sql` - Only needed if `last_seen_date` wasn't required
- `20241206_add_locale_to_missing_persons.sql` - Only needed if `locale` column missing
- `20241206_add_nic_to_missing_persons.sql` - Only needed if `nic` column missing

**New databases:** These changes are already included in `001_initial_schema.sql`.

## Verification Checklist

After running all migrations, verify:

- [ ] All 14 tables exist
- [ ] All indexes created successfully
- [ ] All triggers function properly
- [ ] Foreign key constraints in place
- [ ] Default admin user created
- [ ] Administrative divisions data loaded (~12,000 records)
- [ ] Storage bucket created (if using)
- [ ] Can connect via Supabase client

## Troubleshooting

### Migration Fails: Table Already Exists

If you see "relation already exists" errors:
- The table may have been created manually
- Use `CREATE TABLE IF NOT EXISTS` (already in migrations)
- Or drop existing tables if this is a test setup

### Migration Fails: Column Already Exists

If adding columns fails:
- Column may already exist from manual creation
- Migrations use `IF NOT EXISTS` where possible
- Check table structure before running migrations

### Foreign Key Constraint Errors

If foreign key errors occur:
- Ensure parent tables are created first
- Check migration order is correct
- Verify referenced columns exist

### Index Creation Fails

If index creation fails:
- Index may already exist (migrations use `IF NOT EXISTS`)
- Check for duplicate index names
- This is usually non-critical

## Post-Migration Setup

### 1. Update Environment Variables

Ensure `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"
```

### 2. Generate TypeScript Types

```bash
npx supabase gen types typescript --project-id <project-id> > types/supabase.ts
```

Or update `types/supabase.ts` manually based on schema.

### 3. Test Database Connection

```bash
npm run db:studio
# Or test via API endpoints
```

### 4. Create Initial Data (Optional)

- Create test shelters
- Create test shelter credentials
- Test missing person report creation
- Test person registration

## Complete Migration Sequence (Copy-Paste Ready)

For a new database, run these in order:

```sql
-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. Run: 001_initial_schema.sql
-- 3. Run: 002_staff_centers_and_auth.sql
-- 4. Run: 003_phone_verifications.sql
-- 5. Run: 005_compensation_system.sql
-- 6. Run: 006_insert_gn_data.sql (this is large, may take a few minutes)
```

## Security Notes

⚠️ **Important:**
- Change default admin password immediately
- Use strong passwords for all accounts
- Keep service role key secure (never expose in client code)
- Enable RLS on sensitive tables
- Regular database backups recommended

## Support

For issues:
- Check migration order
- Verify SQL syntax
- Check Supabase logs
- Review error messages carefully
- Test in development first

## Next Steps

After database setup:
1. Configure environment variables
2. Test API endpoints
3. Create test data
4. Verify all features work
5. Set up production backups

