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
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center text-sm text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
        >
          ← Back home
        </Link>
        <form action={handleLogout}>
          <button
            type="submit"
            className="text-sm text-danger hover:text-red-700"
          >
            Logout
          </button>
        </form>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
        Register a person in your shelter
      </h1>
      <p className="mb-6 text-gray-600">
        Add people currently staying at your shelter so families can find them.
      </p>

      <Alert variant="info" title="Automatic matching">
        We'll automatically try to match this person with any existing missing person reports.
      </Alert>

      <div className="mt-6">
        <ShelterRegistrationForm
          locale={locale}
          shelterInfo={{
            id: session.shelterId,
            name: session.shelterName,
            code: session.shelterCode,
          }}
        />
      </div>
    </div>
  );
}
