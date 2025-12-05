import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">About iSafe</h1>

      {/* What is iSafe */}
      <section className="mb-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 md:text-2xl">What is iSafe</h2>
        <div className="space-y-4 text-base leading-relaxed text-gray-700">
          <p>
            iSafe is a disaster response platform designed to help families reunite after natural disasters
            and emergencies. Our mission is to connect displaced persons with their loved ones as quickly
            and efficiently as possible.
          </p>
          <p>
            When disaster strikes, communication networks can fail and families become separated. iSafe
            provides a centralized database where shelter staff can register displaced persons, and families
            can search for their missing loved ones.
          </p>
          <p>
            The platform is designed to work efficiently even in low-bandwidth conditions, ensuring that
            critical information is accessible when it matters most.
          </p>
        </div>
      </section>

      {/* How it Works */}
      <section className="mb-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 md:text-2xl">How it Works</h2>
        
        <div className="space-y-6">
          {/* For families searching */}
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">For families searching</h3>
            <p className="text-base leading-relaxed text-gray-700">
              Use our search feature to look for missing persons by name, NIC number, or photo. Our system
              searches across all registered shelters and missing person reports to help you find your loved
              ones. If we find a match, we&apos;ll provide you with their location and contact information for
              the shelter.
            </p>
          </div>

          {/* For reporting missing persons */}
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">For reporting missing persons</h3>
            <p className="text-base leading-relaxed text-gray-700">
              If you&apos;re looking for someone who hasn&apos;t been found yet, you can create a missing person
              report. This generates a shareable poster that you can distribute on social media and within
              your community. We&apos;ll automatically notify you if someone matching your report is registered
              at a shelter.
            </p>
          </div>

          {/* For shelter staff */}
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">For shelter staff</h3>
            <p className="text-base leading-relaxed text-gray-700">
              Shelter staff can quickly register new arrivals with basic information including photos, health
              status, and contact details. Our system automatically checks for matches with existing missing
              person reports and facilitates family reunification.
            </p>
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="mb-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 md:text-2xl">Emergency Contacts</h2>
        <div className="space-y-2 text-base text-gray-700">
          <div>
            <a
              href="tel:119"
              className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              119
            </a>
            {' - Disaster Management Centre'}
          </div>
          <div>
            <a
              href="tel:110"
              className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              110
            </a>
            {' - Police Emergency'}
          </div>
          <div>
            <a
              href="tel:1990"
              className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              1990
            </a>
            {' - Ambulance'}
          </div>
        </div>
      </section>

      {/* Feedback & Support */}
      <section className="mb-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 md:text-2xl">Feedback & Support</h2>
        <div className="space-y-2 text-base">
          <div>
            <Link
              href="/feedback/problem"
              className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              Report a problem
            </Link>
          </div>
          <div>
            <Link
              href="/feedback/suggestion"
              className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              Suggest improvements
            </Link>
          </div>
          <div>
            <Link
              href="/feedback/technical"
              className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              Technical issues
            </Link>
          </div>
        </div>
      </section>

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

