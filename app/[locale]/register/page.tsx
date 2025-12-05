import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyShelterToken } from '@/lib/auth/jwt';
import { ShelterRegistrationForm } from '@/components/forms/ShelterRegistrationForm';
import { Alert } from '@/components/ui';

interface RegisterPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params;
  
  // Get token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('shelter_token')?.value;
  
  // Verify token and get session
  const session = token ? await verifyShelterToken(token) : null;
  
  // Redirect to auth page if no valid session
  if (!session) {
    redirect(`/${locale}/register/auth`);
  }

  const handleLogout = async () => {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete('shelter_token');
    redirect(`/${locale}/register/auth`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header Bar */}
      <div className="mb-6">
        <form action={handleLogout}>
          <button
            type="submit"
            className="inline-flex items-center rounded text-base text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            ← Logout
          </button>
        </form>
        <div className="mt-2 flex items-start gap-2">
          <span className="text-lg" aria-hidden="true">📍</span>
          <div>
            <p className="text-sm font-medium text-gray-700">{session.shelterName}</p>
          </div>
        </div>
      </div>

      {/* Stats Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-900">
        Registered today: 0
      </div>

      <ShelterRegistrationForm
        locale={locale}
        shelterInfo={{
          id: session.shelterId,
          name: session.shelterName,
          code: session.shelterCode,
        }}
      />
    </div>
  );
}
