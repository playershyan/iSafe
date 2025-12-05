# Supabase Setup Checklist

Essential steps to complete in your Supabase dashboard after the migration.

---

## ✅ Pre-Migration Checklist

### 1. Verify Database Schema
Ensure your Supabase database has all the required tables matching the Prisma schema:

- [ ] `persons` table exists
- [ ] `missing_persons` table exists
- [ ] `shelters` table exists
- [ ] `shelter_auth` table exists
- [ ] `matches` table exists
- [ ] `statistics` table exists

### 2. Check Foreign Key Relationships

**`persons` table:**
- [ ] `shelter_id` → `shelters.id`
- [ ] `missing_report_id` → `missing_persons.id`

**`shelter_auth` table:**
- [ ] `shelter_id` → `shelters.id`

**`matches` table:**
- [ ] `person_id` → `persons.id`
- [ ] `missing_person_id` → `missing_persons.id`

### 3. Verify Indexes

Critical indexes for performance:

**`persons` table:**
- [ ] Index on `full_name`
- [ ] Index on `nic`
- [ ] Index on `shelter_id`

**`missing_persons` table:**
- [ ] Index on `full_name`
- [ ] Index on `nic`
- [ ] Index on `poster_code` (unique)
- [ ] Index on `status`

**`shelters` table:**
- [ ] Index on `code` (unique)
- [ ] Index on `district`

**`shelter_auth` table:**
- [ ] Index on `shelter_id` (unique)
- [ ] Index on `access_code`

**`matches` table:**
- [ ] Index on `missing_person_id`
- [ ] Index on `person_id`

### 4. Check Unique Constraints

- [ ] `persons.nic` is unique
- [ ] `missing_persons.poster_code` is unique
- [ ] `shelters.code` is unique
- [ ] `shelter_auth.shelter_id` is unique

---

## 🔒 Row Level Security (RLS) Configuration

### Option 1: Disable RLS (Development/Testing)
If you're not using Supabase Auth and want to disable RLS:

```sql
ALTER TABLE persons DISABLE ROW LEVEL SECURITY;
ALTER TABLE missing_persons DISABLE ROW LEVEL SECURITY;
ALTER TABLE shelters DISABLE ROW LEVEL SECURITY;
ALTER TABLE shelter_auth DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE statistics DISABLE ROW LEVEL SECURITY;
```

### Option 2: Enable RLS with Service Role (Recommended)
Keep RLS enabled but use service role key for operations:

**Public Read Access (for search functionality):**
```sql
-- Allow public read access to persons
CREATE POLICY "Public can read persons"
ON persons FOR SELECT
USING (true);

-- Allow public read access to missing persons
CREATE POLICY "Public can read missing persons"
ON missing_persons FOR SELECT
USING (true);

-- Allow public read access to shelters
CREATE POLICY "Public can read shelters"
ON shelters FOR SELECT
USING (true);
```

**Service Role Full Access:**
The service role key bypasses RLS automatically, so admin operations will work.

### Option 3: Custom RLS Policies
If using Supabase Auth, create custom policies based on your auth requirements.

---

## 🔑 Environment Variables

### Required Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: For type generation
SUPABASE_PROJECT_ID=xxxxx
```

### Where to Find These Values

1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon)
3. Click on **API**
4. Copy the values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ IMPORTANT:** Never commit `.env.local` to version control!

---

## 📊 Database Functions (Optional)

### Create Helper Functions

**1. Update Statistics Function:**
```sql
CREATE OR REPLACE FUNCTION update_statistics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE statistics
  SET
    total_persons = (SELECT COUNT(*) FROM persons),
    total_shelters = (SELECT COUNT(*) FROM shelters),
    active_shelters = (SELECT COUNT(*) FROM shelters WHERE is_active = true),
    total_missing = (SELECT COUNT(*) FROM missing_persons WHERE status = 'MISSING'),
    total_matches = (SELECT COUNT(*) FROM matches WHERE confirmed_at IS NOT NULL),
    updated_at = NOW()
  WHERE id = 'singleton';
END;
$$;
```

**2. Increment Shelter Count Function:**
```sql
CREATE OR REPLACE FUNCTION increment_shelter_count(shelter_id_param TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE shelters
  SET current_count = current_count + 1
  WHERE id = shelter_id_param;
END;
$$;
```

---

## 🔄 Database Triggers (Optional)

### Auto-update Shelter Count

**Trigger on Person Insert:**
```sql
CREATE OR REPLACE FUNCTION update_shelter_count_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE shelters
  SET current_count = current_count + 1
  WHERE id = NEW.shelter_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER person_insert_trigger
AFTER INSERT ON persons
FOR EACH ROW
EXECUTE FUNCTION update_shelter_count_on_insert();
```

**Trigger on Person Delete:**
```sql
CREATE OR REPLACE FUNCTION update_shelter_count_on_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE shelters
  SET current_count = current_count - 1
  WHERE id = OLD.shelter_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER person_delete_trigger
AFTER DELETE ON persons
FOR EACH ROW
EXECUTE FUNCTION update_shelter_count_on_delete();
```

---

## 🧪 Testing Queries

### Test Basic Queries

Run these in the Supabase SQL Editor to verify everything works:

**1. Test Persons Query:**
```sql
SELECT * FROM persons LIMIT 5;
```

**2. Test Missing Persons Query:**
```sql
SELECT * FROM missing_persons LIMIT 5;
```

**3. Test Join Query:**
```sql
SELECT 
  p.*,
  s.name as shelter_name,
  s.district as shelter_district
FROM persons p
LEFT JOIN shelters s ON p.shelter_id = s.id
LIMIT 5;
```

**4. Test Search Query:**
```sql
SELECT * FROM persons 
WHERE full_name ILIKE '%john%'
LIMIT 10;
```

**5. Test Statistics:**
```sql
SELECT * FROM statistics WHERE id = 'singleton';
```

---

## 🔍 Verify Migration

### Check Data Integrity

**1. Count Records:**
```sql
SELECT 
  (SELECT COUNT(*) FROM persons) as persons_count,
  (SELECT COUNT(*) FROM missing_persons) as missing_count,
  (SELECT COUNT(*) FROM shelters) as shelters_count,
  (SELECT COUNT(*) FROM matches) as matches_count;
```

**2. Check Foreign Key Integrity:**
```sql
-- Check for orphaned persons (shelter doesn't exist)
SELECT p.* FROM persons p
LEFT JOIN shelters s ON p.shelter_id = s.id
WHERE s.id IS NULL;

-- Check for orphaned missing reports
SELECT p.* FROM persons p
LEFT JOIN missing_persons mp ON p.missing_report_id = mp.id
WHERE p.missing_report_id IS NOT NULL AND mp.id IS NULL;
```

**3. Check Unique Constraints:**
```sql
-- Check for duplicate NICs
SELECT nic, COUNT(*) 
FROM persons 
WHERE nic IS NOT NULL
GROUP BY nic 
HAVING COUNT(*) > 1;

-- Check for duplicate poster codes
SELECT poster_code, COUNT(*) 
FROM missing_persons 
GROUP BY poster_code 
HAVING COUNT(*) > 1;
```

---

## 🚀 Post-Migration Steps

### 1. Test Application Endpoints

- [ ] Test missing person report creation: `POST /api/missing`
- [ ] Test missing person retrieval: `GET /api/missing?posterCode=XXX`
- [ ] Test person registration: `POST /api/register`
- [ ] Test search by name: `GET /api/search?type=name&query=John`
- [ ] Test search by NIC: `GET /api/search?type=nic&nic=123456789V`
- [ ] Test poster generation: `GET /api/poster?posterCode=XXX`

### 2. Monitor Performance

In Supabase Dashboard → Database → Query Performance:
- [ ] Check slow queries
- [ ] Verify indexes are being used
- [ ] Monitor connection pool usage

### 3. Set Up Backups

In Supabase Dashboard → Database → Backups:
- [ ] Enable automatic backups
- [ ] Set backup retention period
- [ ] Test backup restoration (in a test project)

### 4. Configure Connection Pooling

In Supabase Dashboard → Settings → Database:
- [ ] Verify connection pooling is enabled
- [ ] Check pool size settings
- [ ] Monitor connection usage

---

## 📝 Maintenance Tasks

### Regular Tasks

**Weekly:**
- [ ] Review slow query logs
- [ ] Check database size and growth
- [ ] Monitor error logs

**Monthly:**
- [ ] Update statistics: `SELECT update_statistics();`
- [ ] Review and optimize indexes
- [ ] Check for unused indexes

**Quarterly:**
- [ ] Review and update RLS policies
- [ ] Audit database permissions
- [ ] Test backup restoration

---

## 🆘 Troubleshooting

### Common Issues

**Issue: "relation does not exist"**
- Solution: Check table name spelling (case-sensitive)
- Solution: Verify table exists in Supabase dashboard

**Issue: "new row violates row-level security policy"**
- Solution: Disable RLS or create appropriate policies
- Solution: Use service role client for admin operations

**Issue: "insert or update on table violates foreign key constraint"**
- Solution: Ensure referenced records exist
- Solution: Check foreign key relationships

**Issue: Slow queries**
- Solution: Add indexes on frequently queried columns
- Solution: Use `.explain()` to analyze query plans

---

## ✅ Final Checklist

Before going to production:

- [ ] All tables exist and have correct schema
- [ ] All foreign keys are properly configured
- [ ] All indexes are created
- [ ] RLS policies are configured (or disabled for testing)
- [ ] Environment variables are set
- [ ] All API endpoints are tested
- [ ] Backups are enabled
- [ ] Connection pooling is configured
- [ ] Error monitoring is set up
- [ ] Performance is acceptable

---

## 📚 Additional Resources

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli/introduction)

---

## Need Help?

If you encounter issues:
1. Check Supabase Dashboard → Logs
2. Review this checklist
3. Consult Supabase documentation
4. Check GitHub issues for similar problems

