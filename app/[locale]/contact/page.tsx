import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('pages.contact');
  const tCommon = await getTranslations('common');
  
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">{t('title')}</h1>

      <div className="space-y-6">
        <p className="text-base leading-relaxed text-gray-700">
          {t('urgentAssistance')}
        </p>

        {/* Emergency Contacts */}
        <section className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900">{t('emergencyContacts')}</h2>
          <div className="space-y-2 text-base text-gray-700">
            <div>
              <a
                href="tel:119"
                className="font-medium text-primary hover:underline"
              >
                119
              </a>
              {' - '}{t('disasterManagement')}
            </div>
            <div>
              <a
                href="tel:110"
                className="font-medium text-primary hover:underline"
              >
                110
              </a>
              {' - '}{t('policeEmergency')}
            </div>
            <div>
              <a
                href="tel:1990"
                className="font-medium text-primary hover:underline"
              >
                1990
              </a>
              {' - '}{t('ambulance')}
            </div>
          </div>
        </section>

        {/* General Inquiries */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">{t('generalInquiries')}</h2>
          <p className="text-base text-gray-700">
            {t('generalInquiriesText', {
              aboutLink: t('aboutPage')
            })}{' '}
            <Link href={`/${locale}/about`} className="font-medium text-primary hover:underline">
              {t('aboutPage')}
            </Link>
            {' '}for more information.
          </p>
        </section>
      </div>

      {/* Back to Home */}
      <div className="pt-6">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center rounded text-base text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          ← {tCommon('backToHome')}
        </Link>
      </div>
    </div>
  );
}

