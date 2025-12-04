import Link from 'next/link';
import { Button } from '@/components/ui';
import { StatCard } from '@/components/features/StatCard';
import { getStatistics } from '@/lib/services/statisticsService';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const stats = await getStatistics();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Live Statistics at top */}
      <div className="mb-10">
        <h2 className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
          <span className="live-dot" aria-hidden="true" />
          <span>Live Stats</span>
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalPersons.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Missing</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalMatches.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Found (matches made)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.activeShelters.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Sheltered</p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center">
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
      </div>
    </div>
  );
}
