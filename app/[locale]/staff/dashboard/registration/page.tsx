import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyShelterToken } from '@/lib/auth/jwt';
import { BulkRegistrationForm } from '@/components/forms/BulkRegistrationForm';
import { getCenterPersons } from '@/lib/services/staffStatisticsService';

interface StaffRegistrationPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function StaffRegistrationPage({ params }: StaffRegistrationPageProps) {
  const { locale } = await params;
  
  // Get token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('shelter_token')?.value;
  
  // Verify token and get session
  const session = token ? await verifyShelterToken(token) : null;
  
  // Redirect to staff login page if no valid session
  if (!session) {
    redirect(`/${locale}/staff`);
  }

  // Get existing persons for duplicate checking
  const existingPersons = await getCenterPersons(session.shelterId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header Bar */}
      <div className="mb-6">
        <Link
          href={`/${locale}/staff/dashboard`}
          className="inline-flex items-center rounded text-base text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          ← Back to Dashboard
        </Link>
        <div className="mt-2 flex items-start gap-2">
          <span className="text-lg" aria-hidden="true">🏛️</span>
          <div>
            <p className="text-sm font-medium text-gray-700">Registration</p>
            <p className="text-xs text-gray-500">{session.shelterName} ({session.shelterCode})</p>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Register People</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add multiple people at once. Fill in the table below and click Save when done.
        </p>
      </div>

      {/* Registration Form */}
      <BulkRegistrationForm 
        locale={locale} 
        centerId={session.shelterId}
        existingPersons={existingPersons}
      />
    </div>
  );
}

