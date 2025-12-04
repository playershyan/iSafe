import Link from 'next/link';
import { ShelterAuthForm } from '@/components/forms/ShelterAuthForm';
import { Alert } from '@/components/ui';

export default async function ShelterAuthPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center text-sm text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
        >
          ← Back home
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
          Shelter staff login
        </h1>
        <p className="text-gray-600">
          Enter your shelter credentials to access the registration tools.
        </p>
      </div>

      <Alert variant="warning" title="Shelter staff only">
        This section is intended only for verified shelter staff.
      </Alert>

      <div className="mt-6">
        <ShelterAuthForm locale={locale} />
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-bold mb-2">{t('needHelp')}</h3>
        <p className="text-sm text-gray-700">
          {t('needHelpText')}
        </p>
      </div>
    </div>
  );
}
