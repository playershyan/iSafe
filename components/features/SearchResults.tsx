import Link from 'next/link';
import { PersonCard } from './PersonCard';
import { Button, Alert } from '@/components/ui';
import { PersonSearchResult } from '@/types';

interface SearchResultsProps {
  results: PersonSearchResult[];
  searchPerformed: boolean;
  locale: string;
}

export function SearchResults({ results, searchPerformed, locale }: SearchResultsProps) {
  const t = (key: string) => key;

  if (!searchPerformed) {
    return null;
  }

  if (results.length === 0) {
    return (
      <div className="mt-8">
        <Alert variant="info" title="No results found">
          <p className="mb-4">We couldn&apos;t find any people matching your search.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={`/${locale}/search`}>
              <Button variant="secondary" size="small">
                Try again
              </Button>
            </Link>
            <Link href={`/${locale}/missing`}>
              <Button variant="primary" size="small">
                Create a missing person poster
              </Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl">✅</span>
        <h2 className="text-xl font-bold text-success">Matching people found</h2>
      </div>
      <div className="space-y-4">
        {results.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>
    </div>
  );
}
