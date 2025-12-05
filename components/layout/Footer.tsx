import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      {/* Mobile Footer: Centered, Stacked */}
      <div className="block md:hidden">
        <div className="px-4 py-6 text-center">
          <nav className="mb-2 flex flex-wrap items-center justify-center gap-x-2 text-sm text-gray-600">
            <Link
              href="/about"
              className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              About
            </Link>
            <span className="text-gray-400" aria-hidden="true">|</span>
            <Link
              href="/contact"
              className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Contact
            </Link>
            <span className="text-gray-400" aria-hidden="true">|</span>
            <Link
              href="/privacy"
              className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Privacy
            </Link>
          </nav>
          <p className="mt-2 text-sm text-gray-600">
            © {new Date().getFullYear()} iSafe
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Built for disaster response
          </p>
        </div>
      </div>

      {/* Desktop Footer: Left-Right Split */}
      <div className="hidden md:block">
        <div className="mx-auto max-w-7xl px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} iSafe
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Built for disaster response
              </p>
            </div>
            <nav className="flex items-center gap-6 text-sm text-gray-600">
              <Link
                href="/about"
                className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Contact
              </Link>
              <Link
                href="/privacy"
                className="rounded hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
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
