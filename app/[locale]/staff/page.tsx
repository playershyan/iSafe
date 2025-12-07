import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ShelterAuthForm } from '@/components/forms/ShelterAuthForm';
import { Alert } from '@/components/ui';

export default async function StaffPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('auth');
  const tCommon = await getTranslations('common');

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center rounded text-sm text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          ← Back home
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
          {t('govStaffTitle')}
        </h1>
        <p className="text-gray-600">
          {t('govStaffSubtitle')}
        </p>
      </div>

      <Alert variant="warning" title={t('govStaffOnly')}>
        {t('govStaffOnlyText')}
      </Alert>

      <div className="mt-6">
        <ShelterAuthForm 
          locale={locale} 
          shelterCodeLabel={t('centerCode')}
          accessCodeLabel={t('accessCode')}
          submitButtonText={t('logIn')}
          redirectTo={`/${locale}/staff/dashboard`}
        />
      </div>

      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <h3 className="mb-2 text-sm font-bold">{t('needHelp')}</h3>
        <p className="text-sm text-gray-700">
          {t('needHelpText')}
        </p>
      </div>

      <div className="mt-4 text-center">
        <Link
          href={`/${locale}/compensation/admin`}
          className="text-sm text-primary hover:text-primary-dark underline"
        >
          Manage Staff Credentials
        </Link>
      </div>
    </div>
  );
}

