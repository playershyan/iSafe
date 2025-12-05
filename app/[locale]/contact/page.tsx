import Link from 'next/link';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">Contact Us</h1>

      <div className="space-y-6">
        <p className="text-base leading-relaxed text-gray-700">
          For urgent assistance during a disaster, please use the emergency numbers listed below.
          For general inquiries about iSafe, you can reach us through the following channels.
        </p>

        {/* Emergency Contacts */}
        <section className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Emergency Contacts</h2>
          <div className="space-y-2 text-base text-gray-700">
            <div>
              <a
                href="tel:119"
                className="font-medium text-primary hover:underline"
              >
                119
              </a>
              {' - Disaster Management Centre'}
            </div>
            <div>
              <a
                href="tel:110"
                className="font-medium text-primary hover:underline"
              >
                110
              </a>
              {' - Police Emergency'}
            </div>
            <div>
              <a
                href="tel:1990"
                className="font-medium text-primary hover:underline"
              >
                1990
              </a>
              {' - Ambulance'}
            </div>
          </div>
        </section>

        {/* General Inquiries */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">General Inquiries</h2>
          <p className="text-base text-gray-700">
            For questions about using iSafe or to provide feedback, please visit our{' '}
            <Link href={`/${locale}/about`} className="font-medium text-primary hover:underline">
              About page
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
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

