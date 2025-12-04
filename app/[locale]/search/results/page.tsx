import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { searchByName, searchByNIC } from '@/lib/services/searchService';
import { SearchResults } from '@/components/features/SearchResults';
import { Loading } from '@/components/ui';
import { Suspense } from 'react';

interface SearchResultsPageProps {
  params: { locale: string };
  searchParams: { type?: string; query?: string; nic?: string };
}

async function ResultsContent({ searchParams, locale }: { searchParams: any; locale: string }) {
  const { type, query, nic } = searchParams;

  if (!type) {
    return <SearchResults results={[]} searchPerformed={false} locale={locale} />;
  }

  let results: any[] = [];
  if (type === 'name' && query) {
    results = await searchByName(query);
  } else if (type === 'nic' && nic) {
    results = await searchByNIC(nic);
  }

  return <SearchResults results={results} searchPerformed={true} locale={locale} />;
}

export default function SearchResultsPage({ params: { locale }, searchParams }: SearchResultsPageProps) {
  const t = useTranslations('search');
  const tCommon = useTranslations('common');

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/${locale}/search`}
          className="inline-flex items-center text-sm text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
        >
          ← {tCommon('back')}
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">
        {t('title')}
      </h1>

      <Suspense fallback={<Loading text="Searching..." />}>
        <ResultsContent searchParams={searchParams} locale={locale} />
      </Suspense>
    </div>
  );
}
