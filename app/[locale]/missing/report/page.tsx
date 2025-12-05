import Link from 'next/link';
import { MissingPersonForm } from '@/components/forms/MissingPersonForm';

export default async function MissingPersonPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center rounded text-base text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          ← Back to Home
        </Link>
      </div>

      <MissingPersonForm locale={locale} />
    </div>
  );
}

