'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import clsx from 'clsx';

const languages = [
  { code: 'si', label: 'සිං', name: 'Sinhala' },
  { code: 'ta', label: 'த', name: 'Tamil' },
  { code: 'en', label: 'EN', name: 'English' },
] as const;

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    const currentPath = pathname.split('/').slice(2).join('/');
    router.push(`/${newLocale}/${currentPath}`);
  };

  return (
    <div className="flex items-center gap-1 rounded border border-gray-300 p-1" role="group" aria-label="Language selection">
      {languages.map((lang, index) => (
        <div key={lang.code} className="flex items-center">
          <button
            onClick={() => handleLanguageChange(lang.code)}
            className={clsx(
              'min-w-touch rounded px-2 py-1 text-sm font-medium transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
              {
                'bg-primary text-white': locale === lang.code,
                'text-gray-700 hover:bg-gray-100': locale !== lang.code,
              }
            )}
            aria-label={`Switch to ${lang.name}`}
            aria-pressed={locale === lang.code}
          >
            {lang.label}
          </button>
          {index < languages.length - 1 && (
            <span className="mx-1 text-gray-300" aria-hidden="true">
              |
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
