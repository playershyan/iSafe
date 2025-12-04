import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <nav className="flex flex-col gap-4 text-center sm:flex-row sm:justify-center sm:gap-8">
          <Link
            href="/about"
            className="text-sm text-gray-600 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          >
            About
          </Link>
        </nav>
        <p className="mt-4 text-center text-xs text-gray-500">
          {new Date().getFullYear()} iSafe. Built for disaster response.
        </p>
      </div>
    </footer>
  );
}
