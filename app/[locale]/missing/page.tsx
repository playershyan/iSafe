import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getMissingPersons } from '@/lib/services/missingPersonsService';
import { MissingPersonCard } from '@/components/features/MissingPersonCard';
import { MissingPersonCardNoPhoto } from '@/components/features/MissingPersonCardNoPhoto';
import { HeroSearchBar } from '@/components/features/HeroSearchBar';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function MissingPersonsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('missing');
  const tCommon = await getTranslations('common');
  const reports = await getMissingPersons();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center rounded text-base text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            ← {tCommon('backToHome')}
          </Link>
          <Link
            href={`/${locale}/missing/report`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {t('title')}
          </Link>
        </div>
      </div>

      {/* Search Bar - Smaller version */}
      <div className="mb-6">
        <HeroSearchBar locale={locale} size="small" />
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-gray-500">{t('noReportsFound')}</p>
          <Link
            href={`/${locale}/missing/report`}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {t('reportAMissingPerson')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => 
            report.photoUrl ? (
              <MissingPersonCard key={report.id} report={report} locale={locale} />
            ) : (
              <MissingPersonCardNoPhoto key={report.id} report={report} locale={locale} />
            )
          )}
        </div>
      )}
    </div>
  );
}

