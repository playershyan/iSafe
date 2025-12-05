'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

export function Footer() {
  const locale = useLocale();
  
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      {/* Mobile Footer: Centered, Stacked */}
      <div className="block md:hidden">
        <div className="px-4 py-6 text-center">
          <nav className="mb-2 flex flex-wrap items-center justify-center gap-x-2 text-sm text-gray-600">
            <Link
              href={`/${locale}/about`}
              className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              About
            </Link>
            <span className="text-gray-400" aria-hidden="true">|</span>
            <Link
              href={`/${locale}/contact`}
              className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Contact
            </Link>
            <span className="text-gray-400" aria-hidden="true">|</span>
            <Link
              href={`/${locale}/privacy`}
              className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Privacy
            </Link>
            <span className="text-gray-400" aria-hidden="true">|</span>
            <Link
              href={`/${locale}/terms`}
              className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Terms
            </Link>
          </nav>
          <p className="text-sm text-gray-600">© 2025 iSafe. All rights reserved.</p>
        </div>
      </div>

      {/* Desktop Footer: Horizontal, Spread Out */}
      <div className="hidden md:block">
        <div className="mx-auto max-w-7xl px-8 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">© 2025 iSafe. All rights reserved.</p>
            <nav className="flex items-center gap-x-4 text-sm text-gray-600">
              <Link
                href={`/${locale}/about`}
                className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                About
              </Link>
              <span className="text-gray-400" aria-hidden="true">|</span>
              <Link
                href={`/${locale}/contact`}
                className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Contact
              </Link>
              <span className="text-gray-400" aria-hidden="true">|</span>
              <Link
                href={`/${locale}/privacy`}
                className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Privacy
              </Link>
              <span className="text-gray-400" aria-hidden="true">|</span>
              <Link
                href={`/${locale}/terms`}
                className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Terms
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
