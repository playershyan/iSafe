# iSafe Setup Guide

Complete guide to set up iSafe from scratch, including all dependencies, third-party services, and environment configuration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installing Dependencies](#installing-dependencies)
3. [Required Third-Party Services](#required-third-party-services)
4. [Recommended Services](#recommended-services)
5. [Environment Variables Setup](#environment-variables-setup)
6. [Database Setup](#database-setup)
7. [Verification](#verification)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or later ([Download](https://nodejs.org/))
- **npm** or **yarn** or **pnpm** package manager
- **Git** installed ([Download](https://git-scm.com/))
- A code editor (VS Code recommended)
- Accounts for required services (see below)

### Verify Prerequisites

```bash
# Check Node.js version
node --version  # Should be 18.x or higher

# Check npm version
npm --version

# Check Git
git --version
```

---

## Installing Dependencies

### Step 1: Clone or Download the Project

```bash
# If using Git
git clone <repository-url>
cd iSafe

# Or download and extract the project
```

### Step 2: Install All Dependencies

Install all required dependencies using npm:

```bash
npm install
```

**Alternative package managers:**

```bash
# Using yarn
yarn install

# Using pnpm
pnpm install
```

### What Gets Installed

This will install:

**Production Dependencies:**
- Next.js 16.x (React framework)
- React 18.x
- Supabase client libraries
- Cloudinary SDK
- Form validation (React Hook Form, Zod)
- UI components (Headless UI, Lucide React icons)
- PDF generation (jsPDF)
- Internationalization (next-intl)
- And more...

**Development Dependencies:**
- TypeScript
- ESLint
- Prettier
- Testing libraries (Jest, Playwright, React Testing Library)
- Build tools

**Installation Time:** ~2-5 minutes depending on internet speed

---

## Required Third-Party Services

iSafe requires the following services to function:

### 1. Supabase (Database & Backend)

**What it provides:**
- PostgreSQL database
- Authentication (if needed)
- Storage (optional - we use Cloudinary)
- Real-time capabilities

**Getting Started:**
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project
4. Wait for project to initialize (~2 minutes)

**Free Tier Includes:**
- 500 MB database storage
- 2 GB bandwidth/month
- 50,000 monthly active users
- Unlimited API requests

**Setup Instructions:**
See detailed guide: [Supabase Setup](./Supabase_Setup_Guide.md)

### 2. Cloudinary (Image Storage & Optimization)

**What it provides:**
- Image upload and storage
- Automatic image optimization
- Responsive image generation
- CDN delivery

**Getting Started:**
1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email
4. Access your Dashboard

**Free Tier Includes:**
- 25 GB storage
- 25 GB bandwidth/month
- Basic transformations
- CDN delivery

**Setup Instructions:**
See [Cloudinary Setup](#cloudinary-setup) below

### 3. SMS Service (Text.lk or Similar)

**What it provides:**
- SMS notifications to reporters when matches are found
- OTP verification for phone numbers

**Getting Started:**
1. Go to [https://text.lk](https://text.lk) (Sri Lankan service)
2. Sign up for an account
3. Purchase credits
4. Get your API key

**Alternative Services:**
- Twilio (international)
- Vonage (Nexmo)
- Any SMS gateway with HTTP API

**Setup Instructions:**
See [SMS Service Setup](#sms-service-setup) below

---

## Recommended Services

### 1. Vercel (Deployment)

**What it provides:**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Preview deployments

**Getting Started:**
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository
4. Deploy automatically

**Free Tier Includes:**
- Unlimited deployments
- 100 GB bandwidth/month
- Serverless functions
- Automatic SSL

### 2. GitHub (Version Control)

**What it provides:**
- Code repository
- Version control
- Collaboration tools
- CI/CD integration

**Getting Started:**
1. Go to [https://github.com](https://github.com)
2. Create an account
3. Create a new repository
4. Push your code

**Free Tier Includes:**
- Unlimited public repositories
- Unlimited private repositories (with limitations)
- Issues and pull requests
- GitHub Actions (CI/CD)

---

## Environment Variables Setup

Create a `.env.local` file in the project root:

```bash
# Create the file
touch .env.local

# Or on Windows
type nul > .env.local
```

### Complete Environment Variables Template

```env
# =====================================================
# SUPABASE CONFIGURATION (Required)
# =====================================================
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
DATABASE_URL="postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres"
SUPABASE_PROJECT_ID="your-project-id"

# =====================================================
# CLOUDINARY CONFIGURATION (Required)
# =====================================================
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_WATERMARK_ENABLED="false"

# =====================================================
# SMS SERVICE CONFIGURATION (Required)
# =====================================================
TEXTLK_API_KEY="your-textlk-api-key"
TEXTLK_API_URL="https://api.text.lk/api"
TEXTLK_SENDER_ID="VERAVERIFY1"  # Optional: Default sender ID (max 11 characters)

# =====================================================
# APPLICATION CONFIGURATION
# =====================================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="iSafe"
NODE_ENV="development"

# =====================================================
# JWT SECRET (Required for Authentication)
# =====================================================
JWT_SECRET="your-super-secret-jwt-key-change-this"

# =====================================================
# BANNER CONFIGURATION (Optional)
# =====================================================
NEXT_PUBLIC_ANNOUNCEMENT_TEXT=""
NEXT_PUBLIC_ANNOUNCEMENT_HREF=""
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT="info"
NEXT_PUBLIC_ANNOUNCEMENT_DISMISSIBLE="false"
NEXT_PUBLIC_HERO_BANNER_IMAGES="[]"
```

---

## Supabase Setup

### Step 1: Get Your Supabase Credentials

1. **Go to Supabase Dashboard**
   - Navigate to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project (or create a new one)

2. **Get Project URL and API Keys**
   - Click **Settings** (gear icon) → **API**
   - Copy:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep secret!

3. **Get Database Connection String**
   - Click **Settings** → **Database**
   - Scroll to **Connection string** section
   - Click **URI** tab
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your database password
   - This is your `DATABASE_URL`

4. **Get Project ID**
   - Found in project settings or URL: `https://supabase.com/dashboard/project/[PROJECT_ID]`

### Step 2: Set Up Storage (Optional - Using Cloudinary Instead)

If you want to use Supabase Storage instead of Cloudinary:

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name: `isafe-photos`
4. Make it **Public**
5. Set file size limit: 10 MB

### Step 3: Enable Extensions

1. Go to **Database** → **Extensions**
2. Enable:
   - `uuid-ossp` (for UUID generation)
   - `pg_trgm` (for fuzzy text search)
   - `unaccent` (for accent-insensitive search)

### Step 4: Run Database Migrations

See [Database Setup Guide](../database/SETUP_GUIDE.md) for complete instructions.

**Quick version:**
1. Go to **SQL Editor** in Supabase
2. Run migrations in order:
   - `001_initial_schema.sql`
   - `002_staff_centers_and_auth.sql`
   - `003_phone_verifications.sql`
   - `005_compensation_system.sql`
   - `006_insert_gn_data.sql`

### Step 5: Update `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL="https://abcdefghijklmnop.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
DATABASE_URL="postgresql://postgres:yourpassword@db.abcdefghijklmnop.supabase.co:5432/postgres"
SUPABASE_PROJECT_ID="abcdefghijklmnop"
```

**Security Note:** Never commit `.env.local` to Git. It's already in `.gitignore`.

---

## Cloudinary Setup

### Step 1: Create Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Fill in registration form:
   - Email address
   - Password
   - Full name
   - Organization name (optional)
3. Verify your email address
4. Complete profile setup

### Step 2: Get Your Cloudinary Credentials

1. **Access Dashboard**
   - Log in to [https://console.cloudinary.com](https://console.cloudinary.com)
   - Your dashboard will show your account details

2. **Find Credentials**
   - Click on **Settings** (gear icon) in the top menu
   - Or go directly to: Dashboard → **Settings** → **Security**
   - You'll see:
     - **Cloud name** → `CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
     - **API Key** → `CLOUDINARY_API_KEY`
     - **API Secret** → `CLOUDINARY_API_SECRET` ⚠️ Keep secret!

3. **Copy Credentials**
   - Copy each value
   - **Note:** API Secret can be revealed by clicking "Reveal"

### Step 3: Configure Upload Presets (Optional but Recommended)

1. Go to **Settings** → **Upload**
2. Scroll to **Upload presets**
3. Click **Add upload preset**
4. Create a preset for iSafe:
   - **Preset name:** `isafe-missing-persons`
   - **Signing mode:** Unsigned (for client-side uploads) or Signed (more secure)
   - **Folder:** `isafe/missing-persons`
   - **Format:** Auto (jpg, png, webp)
   - **Transformations:** Optional (e.g., max width 1920px)

### Step 4: Update `.env.local`

```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuvwxyz123456"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_WATERMARK_ENABLED="false"
```

**Note:** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is needed for client-side image optimization.

### Step 5: Test Cloudinary Connection

You can test the connection by running:

```bash
npm run dev
```

Then try uploading an image through the missing person form. Check the console for any Cloudinary errors.

---

## SMS Service Setup

### Option 1: Text.lk (Recommended for Sri Lanka)

**Text.lk** is a local SMS gateway service ideal for sending SMS within Sri Lanka.

#### Step 1: Create Account

1. Go to [https://text.lk](https://text.lk)
2. Click **Register** or **Sign Up**
3. Fill in:
   - Company/Individual name
   - Contact number
   - Email address
   - Password
4. Verify your email

#### Step 2: Get API Credentials

1. **Log in** to your Text.lk account
2. Navigate to **API Settings** or **Developer** section
3. Generate or copy your **API Key/Token**
4. Note the **API URL** (usually: `https://api.text.lk/api`)

#### Step 3: Purchase Credits (If Required)

1. Go to **Top Up** or **Buy Credits** section
2. Purchase SMS credits
3. Credits will be added to your account

#### Step 4: Update `.env.local`

```env
TEXTLK_API_KEY="your-api-key-here"
TEXTLK_API_URL="https://api.text.lk/api"
TEXTLK_SENDER_ID="VERAVERIFY1"  # Optional: Your sender ID (max 11 characters)
```

**Note:** Sender ID is the name that appears as the sender of the SMS. Must be maximum 11 characters. Contact Text.lk support to register a custom sender ID.

### Option 2: Twilio (International)

If you need international SMS support or prefer Twilio:

#### Step 1: Create Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free trial account
3. Verify your phone number
4. Get $15.50 free credit to test

#### Step 2: Get Credentials

1. Go to **Console Dashboard**
2. Find **Account SID** and **Auth Token**
3. Get a phone number from **Phone Numbers** → **Manage** → **Buy a number**

#### Step 3: Update Code

You'll need to modify `lib/services/textlkService.ts` to use Twilio's API instead.

#### Step 4: Update `.env.local`

```env
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
```

### Option 3: Vonage (Nexmo)

Similar to Twilio, Vonage provides SMS API:

1. Sign up at [https://www.vonage.com](https://www.vonage.com)
2. Get API Key and API Secret
3. Update code to use Vonage API
4. Add credentials to `.env.local`

---

## Additional Configuration

### JWT Secret Generation

Generate a secure JWT secret for authentication:

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add to `.env.local`:

```env
JWT_SECRET="your-generated-secret-here"
```

### Application URL

Set the application URL based on your environment:

**Development:**
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Production:**
```env
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

**Vercel (Automatic):**
If deployed on Vercel, it's automatically set. You can also use:
```env
NEXT_PUBLIC_APP_URL="https://${VERCEL_URL}"
```

### Banner Configuration (Optional)

Configure announcement banner and hero banners:

```env
# Announcement Banner (Top of page)
NEXT_PUBLIC_ANNOUNCEMENT_TEXT="Important announcement text here"
NEXT_PUBLIC_ANNOUNCEMENT_HREF="https://example.com/link"
NEXT_PUBLIC_ANNOUNCEMENT_VARIANT="info"  # info, warning, success, error
NEXT_PUBLIC_ANNOUNCEMENT_DISMISSIBLE="true"  # true or false

# Hero Banner Images (JSON format)
NEXT_PUBLIC_HERO_BANNER_IMAGES='[{"imageUrlDesktop":"https://res.cloudinary.com/your-cloud/image/upload/desktop.jpg","imageUrlMobile":"https://res.cloudinary.com/your-cloud/image/upload/mobile.jpg","linkUrl":"https://example.com","alt":"Banner Alt Text"}]'
```

---

## Database Setup

After configuring Supabase, set up your database:

### Quick Setup

1. **Run Migrations**
   - Go to Supabase **SQL Editor**
   - Run migrations in order (see [Database Setup Guide](../database/SETUP_GUIDE.md))

2. **Create Default Admin**
   - Use the seed script:
   ```bash
   npx tsx scripts/seed-compensation-admin.ts
   ```
   - Or manually create in Supabase dashboard

### Detailed Setup

See complete guide: [Database Setup Guide](../database/SETUP_GUIDE.md)

---

## Verification

### Step 1: Start Development Server

```bash
npm run dev
```

Server should start on `http://localhost:3000`

### Step 2: Check for Errors

Watch the terminal for:
- ✅ Database connection successful
- ✅ Cloudinary configuration loaded
- ✅ Environment variables loaded
- ❌ Any missing configuration warnings

### Step 3: Test Key Features

1. **Home Page**
   - Visit `http://localhost:3000`
   - Should load without errors

2. **Missing Person Form**
   - Navigate to report missing person
   - Try uploading an image
   - Check if Cloudinary upload works

3. **Database Connection**
   - Try submitting a test form
   - Check Supabase dashboard for new records

4. **SMS (Optional)**
   - Test phone verification
   - Check Text.lk dashboard for sent messages

### Step 4: Generate TypeScript Types

Generate Supabase TypeScript types:

```bash
npm run db:types
```

This creates/updates `types/supabase.ts` with your database schema.

---

## Troubleshooting

### Common Issues

#### "Supabase connection failed"
- ✅ Check `NEXT_PUBLIC_SUPABASE_URL` is correct
- ✅ Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- ✅ Ensure Supabase project is active
- ✅ Check internet connection

#### "Cloudinary not configured"
- ✅ Verify all three Cloudinary variables are set
- ✅ Check credentials in Cloudinary dashboard
- ✅ Ensure `.env.local` is in project root
- ✅ Restart development server

#### "SMS service not working"
- ✅ Check `TEXTLK_API_KEY` is set
- ✅ Verify API key is valid in Text.lk dashboard
- ✅ Ensure you have SMS credits
- ✅ Check API URL is correct

#### "Database migration failed"
- ✅ Check `DATABASE_URL` is correct
- ✅ Verify database password is correct
- ✅ Ensure extensions are enabled
- ✅ Check migration order

#### Environment variables not loading
- ✅ File must be named `.env.local` (not `.env`)
- ✅ Must be in project root directory
- ✅ Restart development server after changes
- ✅ Check for typos in variable names

---

## Next Steps

After setup is complete:

1. **Read the Documentation**
   - [Services and Features Guide](./services-and-features/README.md)
   - [How-To Guides](./how-to/README.md)

2. **Customize the Application**
   - Update banner images
   - Configure announcement text
   - Set up admin accounts

3. **Deploy to Production**
   - Set up Vercel deployment
   - Configure production environment variables
   - Run production database migrations

4. **Test All Features**
   - Missing person reporting
   - Person registration
   - Match notifications
   - Compensation applications

---

## Support

For additional help:

- **Database Issues:** See [Database Setup Guide](../database/SETUP_GUIDE.md)
- **Supabase:** [Supabase Documentation](https://supabase.com/docs)
- **Cloudinary:** [Cloudinary Documentation](https://cloudinary.com/documentation)
- **Next.js:** [Next.js Documentation](https://nextjs.org/docs)

---

**Last Updated:** December 2025

