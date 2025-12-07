import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { CompensationApplicationForm } from '@/components/forms/CompensationApplicationForm';
import { Loading } from '@/components/ui/Loading';

interface CompensationApplyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CompensationApplyPage({ params }: CompensationApplyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            <ClientTitle />
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            <ClientSubtitle />
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border-l-4 border-primary p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700">
                <ClientDescription />
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Suspense fallback={<Loading />}>
          <CompensationApplicationForm locale={locale} />
        </Suspense>
      </div>
    </main>
  );
}

// Client Components for translations
function ClientTitle() {
  'use client';
  const t = useTranslations('compensation');
  return <>{t('title')}</>;
}

function ClientSubtitle() {
  'use client';
  const t = useTranslations('compensation');
  return <>{t('subtitle')}</>;
}

function ClientDescription() {
  'use client';
  const t = useTranslations('compensation');
  return <>{t('description')}</>;
}
