import Link from 'next/link';
import { Button } from '@/components/ui';
import { StatCard } from '@/components/features/StatCard';
import { getStatistics } from '@/lib/services/statisticsService';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const stats = await getStatistics();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">Find and protect your loved ones</h1>

        {/* Primary CTAs */}
        <div className="mb-6 flex flex-col gap-4">
          <Link href={`/${locale}/search`}>
            <Button size="large" fullWidth>
              🔍 Search for a missing person
            </Button>
          </Link>
          <Link href={`/${locale}/missing`}>
            <Button size="large" fullWidth variant="secondary">
              + Report a missing person
            </Button>
          </Link>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-200" />

        {/* Shelter Staff CTA */}
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium text-gray-600">Shelter staff tools</p>
          <Link href={`/${locale}/register`}>
            <Button fullWidth variant="secondary">
              Register a person in your shelter
            </Button>
          </Link>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-200" />

        {/* Live Statistics */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            📊 Live statistics
          </h2>
          <div className="grid gap-3">
            <StatCard
              value={stats.totalPersons}
              label="Missing persons registered"
              icon="👥"
            />
            <StatCard
              value={stats.activeShelters}
              label="Active shelters"
              icon="🏠"
            />
            <StatCard
              value={stats.totalMatches}
              label="Matches made"
              icon="✅"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
