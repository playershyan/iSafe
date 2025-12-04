# Supabase Project Details Needed for iSafe

## Quick Reference: What You Need from Supabase

When setting up iSafe, you'll need these **4 essential values** from your Supabase project:

### 1. Project URL
- **Variable**: `NEXT_PUBLIC_SUPABASE_URL`
- **Format**: `https://xxxxx.supabase.co`
- **Where to find**: Settings → API → Project URL
- **Example**: `https://abcdefghijklmnop.supabase.co`

### 2. Anon/Public Key
- **Variable**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Format**: Long string starting with `eyJ...`
- **Where to find**: Settings → API → anon public key
- **Security**: Safe to expose in client-side code (browser)
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Service Role Key
- **Variable**: `SUPABASE_SERVICE_ROLE_KEY`
- **Format**: Long string starting with `eyJ...`
- **Where to find**: Settings → API → service_role key
- **Security**: ⚠️ **KEEP SECRET** - Never expose in client code! Server-side only.
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4. Database Connection String
- **Variable**: `DATABASE_URL`
- **Format**: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
- **Where to find**: Settings → Database → Connection string → URI tab
- **Note**: Replace `[PASSWORD]` with your database password
- **Example**: `postgresql://postgres:mypassword123@db.abcdefghijklmnop.supabase.co:5432/postgres`

---

## Step-by-Step: Getting These Values

### Step 1: Create/Open Your Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in or create an account
3. Create a new project (or select existing):
   - Name: `iSafe`
   - Database Password: Create a strong password (save it!)
   - Region: Choose closest to your users
   - Plan: Free (for MVP)

### Step 2: Get API Keys

1. In your project dashboard, click **Settings** (gear icon) in the left sidebar
2. Click **API** in the settings menu
3. You'll see a page with:
   - **Project URL** → Copy this (your `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key → Copy this (your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** key → Copy this (your `SUPABASE_SERVICE_ROLE_KEY`)

### Step 3: Get Database Connection String

1. Still in Settings, click **Database** in the settings menu
2. Scroll down to **Connection string** section
3. Click the **URI** tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with the password you set when creating the project
6. This is your `DATABASE_URL`

---

## Complete Environment Variables Template

Once you have all 4 values, add them to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Database Connection
DATABASE_URL="postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="iSafe"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-change-this"
```

---

## Additional Setup Required

After getting these credentials, you also need to:

1. **Create Storage Bucket**:
   - Go to Storage → New bucket
   - Name: `isafe-photos`
   - Make it public
   - Set file size limit: 5MB

2. **Enable PostgreSQL Extensions**:
   - Go to Database → Extensions
   - Enable: `pg_trgm` (for fuzzy search)
   - Enable: `unaccent` (for accent-insensitive search)

3. **Set Up Storage Policies**:
   - Go to Storage → `isafe-photos` → Policies
   - Create policy for public read access

---

## Security Notes

⚠️ **Important Security Reminders**:

- ✅ **DO** use `NEXT_PUBLIC_SUPABASE_ANON_KEY` in client-side code
- ❌ **DON'T** expose `SUPABASE_SERVICE_ROLE_KEY` in client code
- ❌ **DON'T** commit `.env.local` to git (already in `.gitignore`)
- ✅ **DO** use strong database passwords
- ✅ **DO** rotate keys if accidentally exposed

---

## Visual Guide

```
Supabase Dashboard
├── Settings (⚙️)
│   ├── API
│   │   ├── Project URL → NEXT_PUBLIC_SUPABASE_URL
│   │   ├── anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY
│   │   └── service_role → SUPABASE_SERVICE_ROLE_KEY
│   └── Database
│       └── Connection string (URI) → DATABASE_URL
├── Storage
│   └── Create bucket: isafe-photos
└── Database
    └── Extensions → Enable pg_trgm, unaccent
```

---

## Troubleshooting

**"Invalid API key" error?**
- Double-check you copied the entire key (they're very long)
- Make sure there are no extra spaces
- Verify you're using the correct key (anon vs service_role)

**"Connection refused" error?**
- Check your `DATABASE_URL` format
- Verify the password is correct
- Make sure you replaced `[YOUR-PASSWORD]` with actual password

**"Bucket not found" error?**
- Make sure you created the `isafe-photos` bucket
- Check the bucket name matches exactly

---

For detailed setup instructions, see: [Supabase_Setup_Guide.md](./Supabase_Setup_Guide.md)

