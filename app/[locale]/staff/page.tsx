import Link from 'next/link';
import { ShelterAuthForm } from '@/components/forms/ShelterAuthForm';
import { Alert } from '@/components/ui';

export default async function StaffPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

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
          Gov Staff Login
        </h1>
        <p className="text-gray-600">
          Enter your credentials to access the registration tools.
        </p>
      </div>

      <Alert variant="warning" title="Government staff only">
        This section is intended only for verified government staff.
      </Alert>

      <div className="mt-6">
        <ShelterAuthForm 
          locale={locale} 
          shelterCodeLabel="Center code"
          accessCodeLabel="Access code"
          submitButtonText="Log in"
          redirectTo={`/${locale}/staff/dashboard`}
        />
      </div>

      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <h3 className="mb-2 text-sm font-bold">Need help?</h3>
        <p className="text-sm text-gray-700">
          Contact your administrator if you don't have access codes or need assistance.
        </p>
      </div>
    </div>
  );
}

