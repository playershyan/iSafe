import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LanguageToggle } from './LanguageToggle';
import { UserIconButton } from '@/components/features/UserIconButton';

interface HeaderProps {
  locale: string;
}

export async function Header({ locale }: HeaderProps) {
  const t = await getTranslations('nav');
  const tCommon = await getTranslations('common');

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex h-[60px] items-center justify-between">
          <Link
            href={`/${locale}`}
            className="flex items-center rounded text-base font-bold text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:text-xl"
            aria-label={`${tCommon('appName')} ${t('home')}`}
          >
            {tCommon('appName')}
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}`}
              className="rounded text-base text-gray-700 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:text-base"
            >
              {t('home')}
            </Link>
            <Link
              href={`/${locale}/missing`}
              className="rounded text-base text-gray-700 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:text-base"
            >
              {t('reportMissing')}
            </Link>
            <Link
              href={`/${locale}/compensation/apply`}
              className="rounded text-base text-gray-700 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:text-base"
            >
              {t('compensation')}
            </Link>
            <UserIconButton locale={locale} />
          <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
