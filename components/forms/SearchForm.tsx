'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';

type SearchType = 'name' | 'nic';

interface SearchFormProps {
  locale: string;
}

export function SearchForm({ locale }: SearchFormProps) {
  const t = useTranslations('search');
  const router = useRouter();
  const [searchType, setSearchType] = useState<SearchType>('name');
  const [query, setQuery] = useState('');
  const [nic, setNic] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      params.set('type', searchType);

      if (searchType === 'name') {
        params.set('query', query);
      } else {
        params.set('nic', nic);
      }

      router.push(`/${locale}/search/results?${params.toString()}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Type Selection */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            {t('methodTitle')}
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 rounded border border-gray-300 p-3 cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="searchType"
                value="name"
                checked={searchType === 'name'}
                onChange={(e) => setSearchType(e.target.value as SearchType)}
                className="h-5 w-5 text-primary focus:ring-primary"
              />
              <span className="text-base">{t('byName')}</span>
            </label>

            <label className="flex items-center gap-3 rounded border border-gray-300 p-3 cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="searchType"
                value="nic"
                checked={searchType === 'nic'}
                onChange={(e) => setSearchType(e.target.value as SearchType)}
                className="h-5 w-5 text-primary focus:ring-primary"
              />
              <span className="text-base">{t('byNIC')}</span>
            </label>
          </div>
        </div>

        {/* Search Input */}
        {searchType === 'name' ? (
          <div>
            <Input
              label={t('firstName')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('firstName')}
              required
              minLength={2}
            />
            <p className="mt-2 text-sm text-gray-600">
              💡 Try different spellings if not found
            </p>
          </div>
        ) : (
          <div>
            <Input
              label={t('nic')}
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              placeholder={t('nicPlaceholder')}
              required
            />
          </div>
        )}

        <Button type="submit" fullWidth size="large" disabled={isLoading}>
          {isLoading ? '⏳ Searching...' : `🔍 ${t('searchButton')}`}
        </Button>
      </form>
    </Card>
  );
}
