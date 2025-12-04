# Supabase Setup Guide for iSafe

This guide will help you set up Supabase for the iSafe project.

## What is Supabase?

Supabase is an open-source Firebase alternative that provides:
- **PostgreSQL Database** - For storing persons, shelters, and missing person reports
- **Storage** - For storing photos (1GB free tier)
- **Real-time capabilities** - For future features
- **Built-in authentication** - If needed later

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

## Step 2: Create a New Project

1. Click "New Project" in the dashboard
2. Fill in the project details:
   - **Name**: `iSafe` (or your preferred name)
   - **Database Password**: Create a strong password (save this securely!)
   - **Region**: Choose the closest region to your users (for Sri Lanka, consider Singapore or Mumbai)
   - **Pricing Plan**: Select "Free" for MVP
3. Click "Create new project"
4. Wait 2-3 minutes for the project to be provisioned

## Step 3: Get Your Project Credentials

Once your project is ready, you need to collect these values:

### 3.1 Project URL and API Keys

1. In your Supabase dashboard, go to **Settings** (gear icon) → **API**
2. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co` → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → This is your `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 3.2 Database Connection String

1. Go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Select **URI** tab
4. Copy the connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
5. Replace `[YOUR-PASSWORD]` with the password you set when creating the project
6. This is your `DATABASE_URL`

## Step 4: Set Up Storage Bucket

iSafe needs to store photos, so we'll create a storage bucket:

1. Go to **Storage** in the left sidebar
2. Click **New bucket**
3. Configure the bucket:
   - **Name**: `isafe-photos`
   - **Public bucket**: ✅ **Enable** (photos need to be publicly accessible)
   - **File size limit**: 5 MB (or adjust as needed)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
4. Click **Create bucket**

### 4.1 Set Up Storage Policies (Row Level Security)

1. Click on the `isafe-photos` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Select **For full customization**
5. Name: `Allow public read access`
6. Policy definition:
   ```sql
   (bucket_id = 'isafe-photos'::text)
   ```
7. Allowed operation: `SELECT`
8. Target roles: `public`
9. Click **Review** then **Save policy**

## Step 5: Enable PostgreSQL Extensions

iSafe uses PostgreSQL extensions for full-text search:

1. Go to **Database** → **Extensions** in the left sidebar
2. Enable these extensions:
   - **pg_trgm** (for fuzzy text matching)
   - **unaccent** (for accent-insensitive search)

## Step 6: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Supabase credentials:

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
   
   # JWT Secret (generate a random string)
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   ```

3. **Important**: Never commit `.env.local` to git! It's already in `.gitignore`

## Step 7: Test the Connection

Once you've set up Prisma and run migrations, you can test the connection:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Open Prisma Studio to view your database
npx prisma studio
```

## Supabase Project Details Summary

Here's what you need from Supabase:

| Variable | Where to Find | Description |
|----------|---------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL | Your project's public URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → anon public key | Public API key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → service_role key | Admin key (keep secret!) |
| `DATABASE_URL` | Settings → Database → Connection string (URI) | PostgreSQL connection string |

## Free Tier Limits

Supabase free tier includes:
- ✅ 500 MB database storage
- ✅ 2 GB bandwidth/month
- ✅ 1 GB file storage
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests

**Note**: For production with high traffic, you may need to upgrade to a paid plan.

## Security Best Practices

1. **Never commit secrets**: Always use `.env.local` (already in `.gitignore`)
2. **Use service role key only on server**: Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code
3. **Use anon key for client**: The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to use in browser
4. **Enable Row Level Security (RLS)**: Configure RLS policies for your tables (Prisma schema will guide this)
5. **Rotate keys if exposed**: If you accidentally commit a key, rotate it immediately in Supabase dashboard

## Troubleshooting

### Connection Issues

- **"Connection refused"**: Check your `DATABASE_URL` format and password
- **"Invalid API key"**: Verify you copied the correct key from Settings → API
- **"Bucket not found"**: Make sure you created the `isafe-photos` bucket

### Storage Issues

- **"Upload failed"**: Check bucket policies allow public uploads (for your use case)
- **"File too large"**: Adjust bucket file size limit in Storage settings

### Database Issues

- **"Extension not found"**: Enable `pg_trgm` and `unaccent` in Database → Extensions
- **"Table does not exist"**: Run Prisma migrations: `npx prisma db push`

## Next Steps

After setting up Supabase:

1. ✅ Run Prisma migrations to create database tables
2. ✅ Seed initial data (districts, etc.)
3. ✅ Test image upload functionality
4. ✅ Configure Row Level Security policies
5. ✅ Set up for production deployment

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)

## Support

If you encounter issues:
1. Check Supabase status: [status.supabase.com](https://status.supabase.com)
2. Review Supabase logs in the dashboard
3. Check the [Supabase Discord](https://discord.supabase.com) for community help

---

**Last Updated**: December 2025  
**Version**: 1.0

