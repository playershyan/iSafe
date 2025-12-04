import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PosterPreview } from '@/components/features/PosterPreview';
import { Alert } from '@/components/ui';

interface PosterPageProps {
  params: Promise<{
    locale: string;
    posterCode: string;
  }>;
}

export default async function PosterPage({ params }: PosterPageProps) {
  const { locale, posterCode } = await params;

  // Validate poster code format (MP + 5 digits)
  const posterCodeRegex = /^MP\d{5}$/;
  if (!posterCodeRegex.test(posterCode)) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center text-sm text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
        >
          ← Back home
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">Poster created</h1>
      <p className="mb-6 text-gray-600">Share this poster widely to help find the missing person.</p>

      <Alert variant="success" title="Report created">
        A missing person report has been created successfully.
      </Alert>

      <div className="mt-6">
        <PosterPreview posterCode={posterCode} locale={locale} />
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold mb-2">Important</h3>
        <p className="text-sm text-gray-700">
          Please keep this poster handy and share only with trusted channels when needed.
      </div>

      <div className="mt-6 text-center">
        <Link
          href={`/${locale}/missing`}
          className="text-primary hover:text-primary-dark text-sm"
        >
          {t('createAnother')}
        </Link>
      </div>
    </div>
  );
}
