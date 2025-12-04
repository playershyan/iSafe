import Link from 'next/link';
import { MissingPersonForm } from '@/components/forms/MissingPersonForm';

export default async function MissingPersonPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center text-sm text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
        >
          ← Back
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">Report a missing person</h1>
      <p className="mb-6 text-gray-600">Provide details so we can help shelters and families find them.</p>

      <MissingPersonForm locale={locale} />
    </div>
  );
}
