import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { StatCard } from '@/components/features/StatCard';
import { getStatistics } from '@/lib/services/statisticsService';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations('home');
  const stats = await getStatistics();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">
          {t('title')}
        </h1>

        {/* Primary CTAs */}
        <div className="mb-6 flex flex-col gap-4">
          <Link href={`/${locale}/search`}>
            <Button size="large" fullWidth>
              🔍 {t('searchButton')}
            </Button>
          </Link>
          <Link href={`/${locale}/missing`}>
            <Button size="large" fullWidth variant="secondary">
              + {t('reportButton')}
            </Button>
          </Link>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-200" />

        {/* Shelter Staff CTA */}
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium text-gray-600">{t('shelterSection')}</p>
          <Link href={`/${locale}/register`}>
            <Button fullWidth variant="secondary">
              {t('registerButton')}
            </Button>
          </Link>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-200" />

        {/* Live Statistics */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            📊 {t('statsTitle')}
          </h2>
          <div className="grid gap-3">
            <StatCard
              value={stats.totalPersons}
              label={t('personsRegistered')}
              icon="👥"
            />
            <StatCard
              value={stats.activeShelters}
              label={t('sheltersActive')}
              icon="🏠"
            />
            <StatCard
              value={stats.totalMatches}
              label={t('matchesMade')}
              icon="✅"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
