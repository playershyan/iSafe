import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// For now, only support English until the app is fully working.
export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
