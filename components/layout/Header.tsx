import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LanguageToggle } from './LanguageToggle';

export function Header() {
  const t = useTranslations('common');

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-2xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          >
            {t('appName')}
          </Link>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
