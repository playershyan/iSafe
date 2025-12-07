# How to Change Default Admin Login Credentials

This guide explains how to change the default admin username and password for the compensation dashboard.

## Default Credentials

The default admin login credentials are:
- **Username:** `admin`
- **Password:** `Admin@2025`

**⚠️ IMPORTANT:** Change these immediately after first setup for security!

## Method 1: Using the Seed Script (Recommended)

This is the easiest way to change the admin password.

### Step 1: Edit the Seed Script

1. Open the file: `scripts/seed-compensation-admin.ts`
2. Find these lines (around line 25-26):
   ```typescript
   const username = 'admin';
   const password = 'Admin@2025';
   ```
3. Change them to your desired username and password:
   ```typescript
   const username = 'your-new-username';
   const password = 'YourNewSecurePassword123!';
   ```

### Step 2: Run the Script

1. Open your terminal/command prompt
2. Navigate to your project folder
3. Run the command:
   ```bash
   npx tsx scripts/seed-compensation-admin.ts
   ```

### Step 3: Verify the Change

1. Go to the admin login page (usually at `/compensation/admin`)
2. Try logging in with your new credentials
3. If it works, you're done!

**Note:** If the admin user already exists, the script will update the password. If it doesn't exist, it will create a new admin user.

## Method 2: Direct Database Update

If you prefer to update the database directly:

### Step 1: Hash Your New Password

You'll need to hash your password first. Use Node.js to do this:

1. Open Node.js in your terminal:
   ```bash
   node
   ```
2. Run these commands:
   ```javascript
   const bcrypt = require('bcryptjs');
   bcrypt.hash('YourNewPassword123!', 10).then(hash => console.log(hash));
   ```
3. Copy the hashed password (a long string starting with `$2a$`)

### Step 2: Update the Database

Using Supabase Dashboard or a database tool:

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Run this SQL command (replace with your values):

```sql
UPDATE compensation_admins
SET 
  username = 'your-new-username',
  password_hash = 'your-hashed-password-here',
  updated_at = NOW()
WHERE username = 'admin';
```

**Example:**
```sql
UPDATE compensation_admins
SET 
  username = 'admin',
  password_hash = '$2a$10$YourHashedPasswordHere...',
  updated_at = NOW()
WHERE username = 'admin';
```

## Method 3: Create a New Admin User

If you want to keep the old admin and create a new one:

### Option A: Using the Seed Script

1. Edit `scripts/seed-compensation-admin.ts`
2. Change the username to something new:
   ```typescript
   const username = 'newadmin';
   const password = 'NewAdminPassword123!';
   ```
3. Run: `npx tsx scripts/seed-compensation-admin.ts`

### Option B: Using SQL

1. Hash your password (see Method 2, Step 1)
2. Run this SQL in Supabase:

```sql
INSERT INTO compensation_admins (username, password_hash, full_name, role, is_active)
VALUES (
  'newadmin',
  'your-hashed-password-here',
  'New Administrator',
  'SUPER_ADMIN',
  true
);
```

## Password Security Best Practices

When choosing a new password:

- ✅ Use at least 12 characters
- ✅ Mix uppercase and lowercase letters
- ✅ Include numbers
- ✅ Include special characters (!@#$%^&*)
- ✅ Don't use common words or personal information
- ✅ Use a password manager
- ❌ Don't share your password
- ❌ Don't write it down where others can see it

**Example of a good password:**
- `iSafe@2025Secure!Admin`

**Examples of bad passwords:**
- `password123`
- `admin`
- `12345678`
- `Admin@2025` (the default - change it!)

## Troubleshooting

**Problem:** Script says "Error creating admin"
- **Solution:**
  - Check that your `.env.local` file has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set correctly
  - Make sure you have internet connection
  - Verify your Supabase project is active

**Problem:** Can't log in after changing password
- **Solution:**
  - Double-check that you're using the exact username and password you set
  - Make sure the script ran successfully (check for error messages)
  - Try clearing your browser cookies and logging in again
  - If using database method, verify the password was hashed correctly

**Problem:** "User already exists" error
- **Solution:** 
  - The script will update the existing user's password
  - If you want a different username, change it in the script before running

**Problem:** I forgot my new password
- **Solution:**
  - Run the seed script again with a new password
  - Or update it directly in the database (Method 2)

## Quick Reference

**Default Username:** `admin`  
**Default Password:** `Admin@2025`

**To change:** Edit `scripts/seed-compensation-admin.ts` and run:
```bash
npx tsx scripts/seed-compensation-admin.ts
```

**Database Table:** `compensation_admins`  
**Columns:** `username`, `password_hash`

**Security:** Always use a strong, unique password!

