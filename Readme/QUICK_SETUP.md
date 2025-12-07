# Quick Setup Reference

Quick reference for setting up iSafe.

## Installation Commands

```bash
# Install all dependencies
npm install

# Start development server
npm run dev

# Generate TypeScript types
npm run db:types

# Run tests
npm test
```

## Required Services

1. **Supabase** - [supabase.com](https://supabase.com) - Database
2. **Cloudinary** - [cloudinary.com](https://cloudinary.com) - Image storage
3. **Text.lk** - [text.lk](https://text.lk) - SMS service (Sri Lanka)

## Recommended Services

1. **Vercel** - [vercel.com](https://vercel.com) - Deployment
2. **GitHub** - [github.com](https://github.com) - Version control

## Environment Variables Checklist

Copy to `.env.local`:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
DATABASE_URL=""
SUPABASE_PROJECT_ID=""

# Cloudinary (Required)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""

# SMS Service (Required)
TEXTLK_API_KEY=""
TEXTLK_API_URL="https://api.text.lk/api"
TEXTLK_SENDER_ID="VERAVERIFY1"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
JWT_SECRET=""

# Optional Banners
NEXT_PUBLIC_ANNOUNCEMENT_TEXT=""
NEXT_PUBLIC_HERO_BANNER_IMAGES="[]"
```

## Where to Find Credentials

### Supabase
- **Dashboard:** Settings → API
- **Database:** Settings → Database → Connection string

### Cloudinary
- **Dashboard:** Settings → Security
- Need: Cloud Name, API Key, API Secret

### Text.lk
- **Dashboard:** API Settings
- Need: API Key

## Quick Setup Steps

1. ✅ `npm install`
2. ✅ Create `.env.local`
3. ✅ Add Supabase credentials
4. ✅ Add Cloudinary credentials
5. ✅ Add SMS credentials
6. ✅ Run database migrations
7. ✅ `npm run dev`

For detailed instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

