import Link from 'next/link';
import { searchByName, searchByNIC } from '@/lib/services/searchService';
import { SearchResults } from '@/components/features/SearchResults';
import { Loading } from '@/components/ui';
import { Suspense } from 'react';

interface SearchResultsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; query?: string; nic?: string }>;
}

async function ResultsContent({ searchParams, locale }: { searchParams: { type?: string; query?: string; nic?: string }; locale: string }) {
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

export default async function SearchResultsPage({ params, searchParams }: SearchResultsPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/${locale}/search`}
          className="inline-flex items-center text-sm text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
        >
          ← Back
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">
        Search results
      </h1>

      <Suspense fallback={<Loading text="Searching..." />}>
        <ResultsContent searchParams={resolvedSearchParams} locale={locale} />
      </Suspense>
    </div>
  );
}
