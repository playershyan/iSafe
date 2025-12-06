import { NextIntlClientProvider } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { AnonymousUserInitializer } from '@/components/features/AnonymousUserInitializer';
import { HtmlLangSetter } from '@/components/layout/HtmlLangSetter';
import { LowBandwidthProvider } from '@/lib/contexts/LowBandwidthContext';
import { locales } from '@/i18n';
import { notFound } from 'next/navigation';

// Force dynamic rendering to avoid next-intl config issues during static generation
export const dynamic = 'force-dynamic';

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Directly import messages - this works during static generation
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <LowBandwidthProvider>
        <HtmlLangSetter />
        <AnonymousUserInitializer />
        <Header locale={locale} />
        {/* Language Toggle - Fixed position at top right of page body */}
        <div className="fixed top-20 right-4 z-40 md:top-4">
          <div className="rounded-lg bg-white shadow-md border border-gray-200 px-3 py-2">
            <LanguageToggle />
          </div>
        </div>
        <main className="flex-1">{children}</main>
        <Footer />
      </LowBandwidthProvider>
    </NextIntlClientProvider>
  );
}
