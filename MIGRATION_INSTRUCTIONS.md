# 🚨 Database Migration Required to Fix API Errors

## Problem

You're seeing this error: **"Could not find the 'full_name' column of 'missing_persons'"**

### Root Cause
- **Current database**: Columns use camelCase (e.g., `"fullName"`, `"lastSeenDate"`)
- **API expects**: Columns in snake_case (e.g., `full_name`, `last_seen_date`)
- **Result**: Database operations fail, API returns empty error `{}`

## 🔍 Step 1: Verify Current State

Run this query in **Supabase SQL Editor** to check your current column names:

```sql
-- Copy from: database/diagnostics/check_columns.sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'missing_persons'
ORDER BY ordinal_position;
```

**If you see columns like**: `"fullName"`, `"createdAt"`, `"lastSeenDate"` ➜ Your database needs migration

## ✅ Solution Options

### Option 1: Run Migration (⭐ **RECOMMENDED**)

This permanently fixes the database to use proper PostgreSQL conventions.

**Steps:**
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Create a **New Query**
4. Copy **ALL contents** from: `database/migrations/20241205_convert_to_snake_case.sql`
5. Paste and click **Run**

**What this does:**
- Renames all columns from camelCase to snake_case
- Applies to all tables: missing_persons, persons, shelters, etc.
- ✅ Aligns with PostgreSQL best practices
- ✅ Makes API work correctly
- ✅ Future-proof solution

**After migration:**
- Columns will be: `full_name`, `last_seen_date`, etc.
- ✅ API will work immediately
- ✅ Prisma schema already configured with correct `@map` attributes

### Option 2: Temporary API Workaround (Not Recommended)

If you cannot run the migration right now, I can modify the API to use camelCase columns temporarily.

**Trade-offs:**
- ❌ Goes against PostgreSQL conventions
- ❌ Will need to be reverted later
- ❌ May cause issues with future updates
- ✅ Works immediately without database changes

**To use this option**, let me know and I'll update the API route.

## 📋 After Migration Checklist

Once you run the migration:

1. ✅ Verify columns renamed:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'missing_persons';
   ```

2. ✅ Test creating a missing person poster
   - Should work without errors
   - Should successfully insert data

3. ✅ Check for any remaining errors
   - Statistics error should also be fixed

## 🔄 Rollback (If Needed)

If something goes wrong, you can rollback:

```sql
-- Copy from: database/migrations/rollback_20241205_convert_to_snake_case.sql
-- This will revert columns back to camelCase
```

## 📞 Need Help?

If you encounter issues:
1. Check the error in Supabase SQL Editor
2. Verify environment variables in `.env.local`
3. Ensure Supabase service role key has proper permissions

## 🎯 Recommended Action

**Run the migration now** (Option 1) to permanently fix this issue. It takes less than a minute and prevents future problems.

```bash
# Quick steps:
# 1. Open Supabase Dashboard
# 2. Go to SQL Editor
# 3. Paste contents of: database/migrations/20241205_convert_to_snake_case.sql
# 4. Click Run
# 5. Test poster creation
```
