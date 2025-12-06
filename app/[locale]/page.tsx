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
      <div className="mt-12">
        <div className="mx-auto rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50 p-8 shadow-lg ring-1 ring-blue-100 md:max-w-3xl md:p-12">
          <h2 className="mb-8 flex items-center justify-center gap-2 text-center text-2xl font-bold text-gray-900 md:text-3xl">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600"></span>
            </span>
            Live Stats
          </h2>
          <div className="grid grid-cols-3 gap-6 text-center md:gap-8">
            <div className="rounded-xl bg-white p-6 shadow-md transition-transform hover:scale-105 md:p-8">
              <div className="text-3xl font-bold text-blue-600 md:text-4xl lg:text-5xl">
                {stats.totalMissing.toLocaleString()}
              </div>
              <div className="mt-3 text-sm font-medium text-gray-700 md:text-base">
                Missing
              </div>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-md transition-transform hover:scale-105 md:p-8">
              <div className="text-3xl font-bold text-green-600 md:text-4xl lg:text-5xl">
                {stats.totalMatches.toLocaleString()}
              </div>
              <div className="mt-3 text-sm font-medium text-gray-700 md:text-base">
                Found
              </div>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-md transition-transform hover:scale-105 md:p-8">
              <div className="text-3xl font-bold text-purple-600 md:text-4xl lg:text-5xl">
                {stats.totalPersons.toLocaleString()}
              </div>
              <div className="mt-3 text-sm font-medium text-gray-700 md:text-base">
                Sheltered
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
