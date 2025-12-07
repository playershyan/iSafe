'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function CompensationSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('compensation.success');
  const tNav = useTranslations('nav');

  const [locale, setLocale] = useState('en');
  const applicationCode = searchParams.get('code');

  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  useEffect(() => {
    // Redirect if no application code
    if (!applicationCode) {
      router.push(`/${locale}/compensation/apply`);
    }
  }, [applicationCode, router, locale]);

  if (!applicationCode) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('message')}</p>
        </div>

        {/* Application Code Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">{t('applicationCode')}</p>
            <div className="bg-gray-100 rounded-lg p-4 mb-2">
              <p className="text-2xl font-mono font-bold text-primary">{applicationCode}</p>
            </div>
            <p className="text-sm text-gray-500">{t('saveCode')}</p>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('nextSteps')}</h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium mr-3">
                1
              </div>
              <p className="text-gray-700">{t('step1')}</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium mr-3">
                2
              </div>
              <p className="text-gray-700">{t('step2')}</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium mr-3">
                3
              </div>
              <p className="text-gray-700">{t('step3')}</p>
            </div>
          </div>
        </div>

        {/* SMS Confirmation */}
        <div className="bg-blue-50 border-l-4 border-primary p-4 mb-6">
          <p className="text-sm text-gray-700">{t('smsConfirmation')}</p>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">{t('contactInfo')}</h2>
          <div className="space-y-2 text-sm">
            <p className="flex items-center text-gray-700">
              <svg
                className="w-4 h-4 mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              {t('contactMinistry')}
            </p>
            <p className="flex items-center text-gray-700">
              <svg
                className="w-4 h-4 mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              {t('contactDMC')}
            </p>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="text-center">
          <Link href={`/${locale}`}>
            <Button variant="primary">{t('backToHome')}</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
