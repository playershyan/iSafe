import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { MissingPersonForm } from '@/components/forms/MissingPersonForm';

export default function MissingPersonPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('missing');
  const tCommon = useTranslations('common');

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center text-sm text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
        >
          ← {tCommon('back')}
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
        {t('title')}
      </h1>
      <p className="mb-6 text-gray-600">
        {t('subtitle')}
      </p>

      <MissingPersonForm locale={locale} />
    </div>
  );
}
