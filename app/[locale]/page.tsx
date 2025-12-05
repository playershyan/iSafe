import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getStatistics } from '@/lib/services/statisticsService';
import { HeroSearchBar } from '@/components/features/HeroSearchBar';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const stats = await getStatistics();
  const t = await getTranslations('home');

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-12">
      {/* Hero Section */}
      <div className="mb-6 text-center md:mb-12">
        <h1 className="text-2xl font-bold text-gray-900 md:text-[32px]">
          {t('title')}
        </h1>
      </div>

      {/* Hero Search Bar */}
      <div className="mb-8 md:mb-12">
        <HeroSearchBar locale={locale} />
      </div>

      {/* Primary Action Card */}
      <div className="mb-6 flex flex-col gap-4 md:mx-auto md:mb-12 md:max-w-md">
        <Link
          href={`/${locale}/missing/report`}
          className="group flex h-20 w-full items-center justify-center gap-3 rounded-lg border-2 border-primary bg-white text-lg font-bold text-primary transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:h-[120px] md:text-xl"
        >
          <span className="text-2xl md:text-[32px]" aria-hidden="true">+</span>
          <span>{t('reportButton').toUpperCase()}</span>
        </Link>
      </div>

      {/* Divider */}
      <div className="my-8 border-t border-gray-200 md:mx-auto md:my-12 md:max-w-3xl" />

      {/* Gov Staff Login */}
      <div className="mb-6 text-center md:mb-8">
        <Link
          href={`/${locale}/staff`}
          className="inline-flex items-center justify-center rounded-md border-2 border-primary bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:px-8 md:py-3.5 md:text-lg"
        >
          {t('registerButton')}
        </Link>
      </div>

      {/* Statistics Section */}
      <div className="mx-auto rounded-lg bg-gray-50 p-6 md:max-w-3xl md:p-8">
        <h2 className="mb-4 flex items-center gap-2 text-base font-medium md:text-lg">
          <span aria-hidden="true">📊</span>
          <span>{t('statsTitle')}</span>
        </h2>
        <div className="flex flex-col gap-2 text-sm text-gray-700 md:grid md:grid-cols-3 md:gap-4 md:text-base">
          <div className="flex items-start">
            <span className="mr-2">•</span>
            <span>{stats.totalPersons.toLocaleString()} {t('personsRegistered')}</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">•</span>
            <span>{stats.activeShelters.toLocaleString()} {t('sheltersActive')}</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">•</span>
            <span>{stats.totalMatches.toLocaleString()} {t('matchesMade')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
