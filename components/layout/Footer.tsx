'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export function Footer() {
  const locale = useLocale();
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      {/* Mobile Footer: Re-arranged, Stacked */}
      <div className="block md:hidden">
        <div className="px-4 py-6">
          {/* Company Name */}
          <div className="mb-4 text-center">
            <p className="text-base font-semibold text-gray-900">Capitalist One (Pvt) Ltd</p>
          </div>
          
          {/* Navigation Links */}
          <nav className="mb-4 flex flex-wrap items-center justify-center gap-x-2 text-sm text-gray-600">
            <Link
              href={`/${locale}/about`}
              className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {t('about')}
            </Link>
            <span className="text-gray-400" aria-hidden="true">|</span>
            <Link
              href={`/${locale}/contact`}
              className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {t('contact')}
            </Link>
            <span className="text-gray-400" aria-hidden="true">|</span>
            <Link
              href={`/${locale}/privacy`}
              className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {t('privacy')}
            </Link>
            <span className="text-gray-400" aria-hidden="true">|</span>
            <Link
              href={`/${locale}/terms`}
              className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {t('terms')}
            </Link>
          </nav>
          
          {/* Copyright */}
          <div className="mb-3 text-center">
            <p className="text-sm text-gray-600">{tCommon('copyright')}</p>
          </div>
          
          {/* Designer Credit */}
          <div className="text-center">
            <p className="text-sm font-bold text-gray-500">
              {tCommon('designedBy')}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Footer: Horizontal, Spread Out */}
      <div className="hidden md:block">
        <div className="mx-auto max-w-7xl px-8 py-4">
          <div className="flex flex-col gap-3">
            {/* Top row: Copyright and Navigation */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{tCommon('copyright')}</p>
              <nav className="flex items-center gap-x-4 text-sm text-gray-600">
                <Link
                  href={`/${locale}/about`}
                  className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {t('about')}
                </Link>
                <span className="text-gray-400" aria-hidden="true">|</span>
                <Link
                  href={`/${locale}/contact`}
                  className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {t('contact')}
                </Link>
                <span className="text-gray-400" aria-hidden="true">|</span>
                <Link
                  href={`/${locale}/privacy`}
                  className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {t('privacy')}
                </Link>
                <span className="text-gray-400" aria-hidden="true">|</span>
                <Link
                  href={`/${locale}/terms`}
                  className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {t('terms')}
                </Link>
              </nav>
            </div>
            {/* Bottom row: Designer Credit */}
            <div className="text-center">
              <p className="text-sm font-bold text-gray-500">
                {tCommon('designedBy')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
