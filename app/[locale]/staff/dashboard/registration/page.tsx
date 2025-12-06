import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyShelterToken } from '@/lib/auth/jwt';
import { BulkRegistrationForm } from '@/components/forms/BulkRegistrationForm';
import { getCenterPersons } from '@/lib/services/staffStatisticsService';
import { HeaderDisplay } from './HeaderDisplay';

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
      <HeaderDisplay 
        locale={locale}
        shelterName={session.shelterName}
        shelterCode={session.shelterCode}
      />

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

