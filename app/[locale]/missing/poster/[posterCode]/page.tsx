import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PosterPreview } from '@/components/features/PosterPreview';
import { Alert } from '@/components/ui';

interface PosterPageProps {
  params: {
    locale: string;
    posterCode: string;
  };
}

export default function PosterPage({ params: { locale, posterCode } }: PosterPageProps) {
  const t = useTranslations('poster');
  const tCommon = useTranslations('common');

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
          ← {tCommon('backHome')}
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
        {t('title')}
      </h1>
      <p className="mb-6 text-gray-600">
        {t('subtitle')}
      </p>

      <Alert variant="success" title={t('reportCreated')}>
        {t('reportCreatedText')}
      </Alert>

      <div className="mt-6">
        <PosterPreview posterCode={posterCode} locale={locale} />
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold mb-2">{t('importantNote')}</h3>
        <p className="text-sm text-gray-700">
          {t('importantNoteText')}
        </p>
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
