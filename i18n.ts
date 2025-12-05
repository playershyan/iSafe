import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// For now, only support English until the app is fully working.
export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming locale parameter is valid
  let locale = await requestLocale;
  
  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'en'; // fallback to default
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
