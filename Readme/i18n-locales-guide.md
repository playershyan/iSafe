## iSafe Internationalization & Locales Guide

This document explains how localization (`next-intl`) is wired into the iSafe app, what was disabled to get a plain English-only build working, and how to re-enable or extend locales later.

The app is currently effectively **single-locale (English only)** at runtime. All runtime usage of `next-intl` has been removed or stubbed, but the structure is preserved so you can restore it when ready.

---

## 1. Message Files

- **Directory**: `messages/`
- **Existing files**:
  - `messages/en.json`
  - `messages/si.json`
  - `messages/ta.json`

Messages store per-locale translation strings used by `next-intl`.

### Adding or Updating Locales

- To **add a new locale** (e.g. French):
  - Create `messages/fr.json`.
  - Mirror the key structure of `messages/en.json` (e.g. `"home"`, `"common"`, `"search"`, etc.).
- To **update translations**, edit the appropriate `messages/<locale>.json` file.

---

## 2. Request Config (`i18n.ts`)

- **File**: `i18n.ts`
- **Role**: Acts as the `next-intl` request configuration (equivalent to `src/i18n/request.ts` in the docs). It:
  - Declares supported locales via `locales`.
  - Loads the correct `messages/<locale>.json` file based on the current locale.

### Current State (English Only)

```1:13:i18n.ts
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
```

### Re-enabling Multiple Locales

When you are ready to support multiple languages again:

1. Extend `locales`:

```ts
export const locales = ['en', 'si', 'ta'] as const;
```

2. Ensure each locale listed has a corresponding `messages/<locale>.json` file.

---

## 3. Next.js Config (`next.config.js`)

- **File**: `next.config.js`
- **Role**: (When enabled) wires `next-intl` into Next.js via its plugin.

### Current State (No Plugin)

```1:22:next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: {},
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Restoring `next-intl` Plugin Integration

When you want to re-enable `next-intl`:

1. Ensure the dependency exists in `package.json` (it currently does: `"next-intl": "^3.4.0"`).
2. Wrap `nextConfig` with the `next-intl` plugin and point it at `i18n.ts`:

```js
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: {},
  },
  // ...rest of config unchanged
};

module.exports = withNextIntl(nextConfig);
```

This allows `getMessages`, `getTranslations`, and `useTranslations` to use the config from `i18n.ts`.

---

## 4. Locale-Based Routing (`app/[locale]`)

- **Directory**: `app/[locale]/`
- **Key files**:
  - Layout: `app/[locale]/layout.tsx`
  - Pages:
    - `app/[locale]/page.tsx`
    - `app/[locale]/missing/page.tsx`
    - `app/[locale]/search/page.tsx`
    - `app/[locale]/search/results/page.tsx`
    - `app/[locale]/register/page.tsx`
    - `app/[locale]/register/auth/page.tsx`
    - `app/[locale]/missing/poster/[posterCode]/page.tsx`

The `[locale]` segment is still present (URLs like `/en/...`), but translation logic is currently disabled or hardcoded to English.

### 4.1 Layout: `app/[locale]/layout.tsx`

#### Current State (No `next-intl`)

```9:22:app/[locale]/layout.tsx
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import '../globals.css';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

#### Original/Intended Design

Originally, this layout:

- Validated the `locale` against `locales` from `i18n.ts`.
- Fetched messages via `getMessages()` from `next-intl/server`.
- Wrapped the tree in `NextIntlClientProvider`.
- Optionally defined `generateStaticParams` to prebuild pages for each locale.

#### How to Restore Locale-Aware Layout

1. Re-add imports:

```ts
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from '@/i18n';
```

2. Optionally restore static params:

```ts
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
```

3. Use `getMessages` and `locale` dynamically:

```ts
const { locale } = await params;
const messages = await getMessages();

return (
  <html lang={locale}>
    <body className="flex min-h-screen flex-col">
      <NextIntlClientProvider messages={messages}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </NextIntlClientProvider>
    </body>
  </html>
);
```

---

## 5. Middleware and Locale Redirection

- **File**: `middleware.ts`
- **Status**: Deleted to simplify to an English-only app.

### Original Purpose

The middleware used `next-intl/middleware` to:

- Normalize URLs and ensure they contained a locale prefix (`/en`, `/si`, `/ta`).
- Set a `defaultLocale` (e.g. `en`).
- Optionally enforce extra rules for certain paths (e.g. `/register` with cookies).

### Typical Shape (For Re-creation)

When you want to restore it, create `middleware.ts` like this:

```ts
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('/icon') ||
    pathname.includes('/favicon')
  ) {
    return NextResponse.next();
  }

  const response = intlMiddleware(request);

  // Custom logic (e.g. redirecting /register when cookies are missing) can go here.

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

This re-enables locale-based routing like `/en/...`, `/si/...`, `/ta/...`.

---

## 6. Client-Side Translations in Components

The following components once relied on `useTranslations` (and sometimes `useLocale`) from `next-intl`. They have been simplified to hardcoded English or stubbed translation functions to keep the app running without i18n:

- `components/layout/Header.tsx`
- `components/layout/Footer.tsx`
- `components/layout/LanguageToggle.tsx` (currently unused, still imports `useLocale`)
- `components/forms/SearchForm.tsx`
- `components/forms/MissingPersonForm.tsx`
- `components/forms/ShelterAuthForm.tsx`
- `components/forms/ShelterRegistrationForm.tsx`
- `components/features/SearchResults.tsx`
- `components/features/PersonCard.tsx`
- `components/features/PosterPreview.tsx`

### Current Simplifications

Common patterns currently in use:

- Imports of `useTranslations` removed.
- Replacement with stub functions:

```ts
const t = (key: string) => key;
const tCommon = (key: string) => key;
const tHealth = (key: string) => key;
```

- Many labels and headings are now hardcoded English strings (e.g. `"Search for a missing person"`, `"Report a missing person"`, `"About"`, etc.).

### Restoring Client-Side Translations

When re-enabling localization:

1. Re-import `useTranslations` (and `useLocale` if needed):

```ts
import { useTranslations } from 'next-intl';
// optionally:
// import { useLocale } from 'next-intl';
```

2. Replace stub functions with real hooks:

```ts
const t = useTranslations('home');     // or 'search', 'missing', 'common', etc.
const tCommon = useTranslations('common');
const tHealth = useTranslations('health');
```

3. Replace hardcoded English strings with translation keys:

```tsx
// Before (simplified)
<h1>Search for a missing person</h1>

// After (with i18n)
<h1>{t('title')}</h1>
```

4. Ensure corresponding keys exist in each `messages/<locale>.json` file.

---

## 7. Server-Side Translations in Pages

These pages previously used `getTranslations` from `next-intl/server` and have been simplified to plain English:

- `app/[locale]/page.tsx`
- `app/[locale]/missing/page.tsx`
- `app/[locale]/search/page.tsx`
- `app/[locale]/search/results/page.tsx`
- `app/[locale]/register/page.tsx`
- `app/[locale]/register/auth/page.tsx`
- `app/[locale]/missing/poster/[posterCode]/page.tsx`

### Restoring Server-Side Translations

1. Re-add import:

```ts
import { getTranslations } from 'next-intl/server';
```

2. Acquire translation functions where needed:

```ts
const t = await getTranslations('home');      // or 'missing', 'search', etc.
const tCommon = await getTranslations('common');
```

3. Replace literals with translation keys:

```tsx
// Before
<h1>Report a missing person</h1>

// After
<h1>{t('title')}</h1>
```

4. Add the corresponding keys to `messages/<locale>.json` for all supported locales.

---

## 8. Re-Enabling Localization: Step-by-Step Summary

When you are ready to bring back multi-locale support:

1. **Messages and locales**
   - Ensure `messages/en.json`, `messages/si.json`, `messages/ta.json` (or others) exist and have matching keys.
   - Update `i18n.ts`:
     - `export const locales = ['en', 'si', 'ta'] as const;`

2. **Next.js config**
   - Update `next.config.js` to use:
     - `const createNextIntlPlugin = require('next-intl/plugin');`
     - `const withNextIntl = createNextIntlPlugin('./i18n.ts');`
     - `module.exports = withNextIntl(nextConfig);`

3. **Middleware**
   - Recreate `middleware.ts` using `createMiddleware` from `next-intl/middleware`, passing `locales` and `defaultLocale: 'en'`.

4. **Layout**
   - In `app/[locale]/layout.tsx`, restore:
     - `NextIntlClientProvider`
     - `getMessages`
     - Dynamic `lang={locale}`
     - (Optionally) `generateStaticParams()` using `locales`.

5. **Pages and components**
   - Re-enable `getTranslations` and `useTranslations` / `useLocale` in:
     - Pages under `app/[locale]/...`
     - Components listed in section 6.
   - Replace hardcoded English labels with `t('...')` keys backed by the JSON message files.

Following these steps will transition the app from the current **English-only, no-runtime-i18n** mode back to a full **multi-locale, translation-driven** experience using `next-intl`.


