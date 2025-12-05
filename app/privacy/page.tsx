import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">Privacy Policy</h1>

      <div className="space-y-6 text-base leading-relaxed text-gray-700">
        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900">Data Collection</h2>
          <p>
            iSafe collects personal information solely for the purpose of disaster response and family
            reunification. This includes names, ages, photos, location information, and contact details
            of missing persons and individuals in shelters.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900">Data Usage</h2>
          <p>
            The information you provide is used exclusively to help families locate their loved ones
            during and after disasters. We share this information with authorized shelter staff,
            emergency responders, and the public as necessary for reunification efforts.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900">Data Security</h2>
          <p>
            We implement appropriate security measures to protect personal information from unauthorized
            access, alteration, or disclosure. However, no internet transmission is completely secure,
            and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900">Data Retention</h2>
          <p>
            Personal information is retained for as long as necessary to facilitate family reunification
            efforts. Once a person is found or the emergency situation ends, data may be archived or
            deleted according to applicable regulations.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900">Your Rights</h2>
          <p>
            You have the right to access, correct, or request deletion of your personal information.
            During an active disaster response, some requests may be delayed to prioritize life-saving
            operations.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900">Consent</h2>
          <p>
            By using iSafe and submitting information, you consent to the collection and use of your
            data as described in this privacy policy. For missing person reports, explicit consent is
            required before information is made publicly available.
          </p>
        </section>
      </div>

      {/* Back to Home */}
      <div className="pt-6">
        <Link
          href="/"
          className="inline-flex items-center rounded text-base text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

