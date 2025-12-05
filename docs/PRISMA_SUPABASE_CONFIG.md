# Prisma and Supabase Configuration

This document outlines how Prisma and Supabase are configured and implemented in the iSafe project.

---

## Overview

The iSafe project uses:
- **Prisma ORM** - For database access and type-safe queries
- **Supabase PostgreSQL** - As the database backend (via direct connection)
- **Cloudinary** - For image storage (Supabase Storage is not currently used)

---

## Prisma Configuration

### 1. Prisma Client Setup

**File:** `lib/db/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma Client without adapter (works better with Supabase)
// Note: DATABASE_URL validation is now done at runtime in API routes
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || '',
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Key Features:**
- ✅ Singleton pattern for development (prevents multiple instances)
- ✅ Direct connection to Supabase PostgreSQL (no adapter needed)
- ✅ Logging enabled in development mode
- ✅ Connection pooling handled by Prisma automatically

### 2. Prisma Schema

**File:** `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
```

**Database Models:**
- `Person` - Persons in shelters
- `MissingPerson` - Missing person reports
- `Shelter` - Shelter information
- `ShelterAuth` - Shelter authentication
- `Match` - Match audit trail
- `Statistics` - Cached statistics

### 3. Prisma Configuration Files

**File:** `prisma/prisma.config.ts`

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

**File:** `prisma.config.ts` (root level)

```typescript
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

---

## Supabase Configuration

### 1. Environment Variables

**Required Variables:**

```env
# Database Connection (from Supabase)
DATABASE_URL="postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres"

# Supabase API (currently not actively used, but available)
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

### 2. Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Example:**
```
postgresql://postgres:mypassword123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

### 3. Next.js Configuration

**File:** `next.config.js`

```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.supabase.co',  // For Supabase Storage (if used)
    },
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',  // Currently using Cloudinary
    },
  ],
}
```

---

## Database Access Pattern

### 1. Using Prisma in API Routes

**Example:** `app/api/missing/route.ts`

```typescript
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    // Use Prisma client
    const missingPerson = await prisma.missingPerson.create({
      data: {
        fullName: validated.fullName,
        age: validated.age,
        // ... other fields
      },
    });
    
    return NextResponse.json({ success: true, data: missingPerson });
  } catch (error) {
    // Error handling
  }
}
```

### 2. Using Prisma in Services

**Example:** `lib/services/searchService.ts`

```typescript
import { prisma } from '@/lib/db/prisma';

export async function unifiedSearchByName(query: string) {
  // Query both Person and MissingPerson tables
  const [persons, missingPersons] = await Promise.all([
    prisma.person.findMany({ /* ... */ }),
    prisma.missingPerson.findMany({ /* ... */ }),
  ]);
  
  // Process and return results
}
```

---

## Database Commands

### Prisma CLI Commands

```bash
# Generate Prisma Client (after schema changes)
npm run db:generate
# or
npx prisma generate

# Push schema to database (development)
npm run db:push
# or
npx prisma db push

# Open Prisma Studio (database GUI)
npm run db:studio
# or
npx prisma studio

# Run migrations
npm run db:migrate
# or
npx prisma migrate dev

# Seed database
npm run db:seed
# or
tsx prisma/seed.ts
```

### Manual Migrations

```bash
# Run custom migration from database/migrations folder
npm run db:migrate:manual <migration-file.sql>
# or
tsx scripts/run-migration.ts <migration-file.sql>
```

---

## Supabase Client (Not Currently Used)

### Package Installed

The `@supabase/supabase-js` package is installed but **not actively used** in the codebase:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

### Why Not Used?

The project uses:
- **Prisma** for database access (direct PostgreSQL connection)
- **Cloudinary** for image storage (instead of Supabase Storage)

### If You Want to Use Supabase Client

**Example Setup:**

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// lib/supabase/server.ts (for server-side)
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

---

## Current Architecture

```
┌─────────────────┐
│   Next.js App   │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌────────────────┐  ┌──────────────┐
│  Prisma Client  │  │  Cloudinary  │
└────────┬────────┘  └──────────────┘
         │
         │ (Direct PostgreSQL Connection)
         │
         ▼
┌─────────────────┐
│ Supabase        │
│ PostgreSQL DB   │
└─────────────────┘
```

**Key Points:**
- ✅ Prisma connects directly to Supabase PostgreSQL
- ✅ No Supabase JavaScript client needed for database access
- ✅ Cloudinary handles image storage
- ✅ Type-safe database queries with Prisma

---

## Database Schema Summary

### Tables

1. **persons** - People currently in shelters
2. **missing_persons** - Missing person reports
3. **shelters** - Shelter information
4. **shelter_auth** - Shelter authentication codes
5. **matches** - Match audit trail
6. **statistics** - Cached statistics

### Key Relationships

- `Person` → `Shelter` (many-to-one)
- `Person` → `MissingPerson` (many-to-one, optional)
- `Shelter` → `ShelterAuth` (one-to-one)
- `MissingPerson` → `Person[]` (one-to-many, found persons)

---

## Troubleshooting

### Connection Issues

**Error:** "Tenant or user not found"
- ✅ **Fixed:** Removed PrismaPg adapter, using PrismaClient directly
- ✅ **Solution:** Use direct connection string (not pooler)

**Error:** "DATABASE_URL not set"
- Check `.env.local` file
- Ensure `DATABASE_URL` is properly formatted
- Restart dev server after changing env variables

### Schema Sync Issues

```bash
# If schema is out of sync:
npx prisma db push

# If you need to reset (⚠️ deletes data):
npx prisma db push --force-reset
```

### Migration Issues

```bash
# Check migration status
npx prisma migrate status

# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy
```

---

## Best Practices

1. **Always use Prisma Client** - Don't write raw SQL unless necessary
2. **Use transactions** - For multi-step operations
3. **Handle errors gracefully** - Database errors should be caught and logged
4. **Validate data** - Use Zod schemas before database operations
5. **Use indexes** - Already defined in schema for performance
6. **Connection pooling** - Handled automatically by Prisma

---

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-supabase)

---

## Summary

- ✅ **Prisma** is the primary database access layer
- ✅ **Supabase PostgreSQL** is the database backend
- ✅ **Direct connection** (no Supabase client needed for DB)
- ✅ **Cloudinary** handles image storage
- ✅ **Type-safe** queries with Prisma
- ✅ **Singleton pattern** for Prisma client in development

