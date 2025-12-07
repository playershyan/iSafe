'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeroSearchBarProps {
  locale: string;
  initialValue?: string;
  size?: 'small' | 'default';
}

function detectSearchType(value: string): 'name' | 'nic' {
  const trimmed = value.trim();
  if (!trimmed) return 'name';

  // Normalize NIC: remove spaces/dashes and uppercase
  const normalized = trimmed.replace(/[-\s]/g, '').toUpperCase();

  const isNewNic = /^[0-9]{12}$/.test(normalized);
  const isOldNic = /^[0-9]{9}[VX]$/.test(normalized);

  return isNewNic || isOldNic ? 'nic' : 'name';
}

export function HeroSearchBar({ locale, initialValue = '', size = 'default' }: HeroSearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Sync value when initialValue prop changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);

    try {
      const type = detectSearchType(trimmed);
      const params = new URLSearchParams();
      params.set('type', type);

      if (type === 'nic') {
        params.set('nic', trimmed);
      } else {
        params.set('query', trimmed);
      }

      // Navigate to search results page
      router.push(`/${locale}/search/results?${params.toString()}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isSmall = size === 'small';

  return (
    <form
      onSubmit={handleSubmit}
      className={`mx-auto w-full ${isSmall ? 'max-w-lg' : 'max-w-2xl'}`}
      aria-label="Search for a person by name or NIC"
    >
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search by name or NIC number"
          className={`w-full rounded-full border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-25 ${
            isSmall
              ? 'py-2 pl-4 pr-10 text-sm md:py-2.5 md:pl-4 md:pr-11 md:text-base'
              : 'py-4 pl-6 pr-14 text-base md:py-5 md:pl-6 md:pr-16 md:text-lg'
          }`}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-primary text-white transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            isSmall
              ? 'right-1.5 p-2 md:right-2 md:p-2'
              : 'right-2 p-3 md:right-3 md:p-3.5'
          }`}
          aria-label="Search"
        >
          <Search className={isSmall ? 'h-4 w-4 md:h-4 md:w-4' : 'h-5 w-5 md:h-6 md:w-6'} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

