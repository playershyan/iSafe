import Link from 'next/link';

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">Terms of Service</h1>

      <div className="space-y-6 text-base leading-relaxed text-gray-700">
        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900">Purpose</h2>
          <p>
            iSafe is provided as a public service to assist in disaster response and family reunification
            efforts. By using this platform, you agree to these terms of service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900">Acceptable Use</h2>
          <p>
            You agree to use iSafe only for its intended purpose: locating missing persons and facilitating
            family reunification during disasters. Misuse of the platform, including providing false
            information or using data for unauthorized purposes, is strictly prohibited.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900">Accuracy of Information</h2>
          <p>
            While we strive to maintain accurate information, iSafe cannot guarantee the completeness or
            accuracy of all data. Information is provided by third parties including shelter staff and
            family members. Always verify critical information through official channels.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900">No Warranty</h2>
          <p>
            iSafe is provided &quot;as is&quot; without any warranties, express or implied. We do not guarantee
            that the service will be uninterrupted, secure, or error-free. Use of the platform is at your
            own risk.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900">Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, iSafe and its operators shall not be liable for any
            damages arising from the use or inability to use the platform, including but not limited to
            direct, indirect, incidental, or consequential damages.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900">Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of iSafe after changes
            constitutes acceptance of the modified terms.
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

