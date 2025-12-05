import Link from 'next/link';
import { StatusPersonCard } from '@/components/features/StatusPersonCard';
import { HeroSearchBar } from '@/components/features/HeroSearchBar';
import { unifiedSearchByName, unifiedSearchByNIC } from '@/lib/services/searchService';

export const revalidate = 0; // Always fetch fresh results

interface SearchResultsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; query?: string; nic?: string }>;
}

export default async function SearchResultsPage({ params, searchParams }: SearchResultsPageProps) {
  const { locale } = await params;
  const { type, query, nic } = await searchParams;

  let results: any[] = [];

  try {
    if (type === 'nic' && nic) {
      results = await unifiedSearchByNIC(nic);
    } else if (type === 'name' && query) {
      results = await unifiedSearchByName(query);
    }
  } catch (error) {
    console.error('Search error:', error);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center rounded text-base text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Hero Search Bar */}
      <div className="mb-8 md:mb-12">
        <HeroSearchBar locale={locale} initialValue={query || nic || ''} />
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-gray-500 mb-4">No results found.</p>
          <p className="text-sm text-gray-400 mb-4">
            We couldn't find anyone matching your search.
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Try a Different Search
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
          {results.map((result) => (
            <StatusPersonCard key={result.id} result={result} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

