import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyShelterToken } from '@/lib/auth/jwt';
import { getStaffStatistics, getCenterPersons } from '@/lib/services/staffStatisticsService';
import { SearchablePeopleTable } from '@/components/features/SearchablePeopleTable';

interface StaffDashboardPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function StaffDashboardPage({ params }: StaffDashboardPageProps) {
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

  // Get statistics and persons list
  const [stats, persons] = await Promise.all([
    getStaffStatistics(session.shelterId),
    getCenterPersons(session.shelterId),
  ]);

  const handleLogout = async () => {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete('shelter_token');
    redirect(`/${locale}/staff`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
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
          <span className="text-lg" aria-hidden="true">🏛️</span>
          <div>
            <p className="text-sm font-medium text-gray-700">Government Staff Dashboard</p>
            <p className="text-xs text-gray-500">{session.shelterName} ({session.shelterCode})</p>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="mb-6 flex flex-wrap items-center gap-6 md:gap-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">📊</span>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.centerPersonsCount.toLocaleString()}</p>
            <p className="text-sm text-gray-600">People admitted in this center</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">🌐</span>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPersonsCount.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total people in all centers</p>
          </div>
        </div>
      </div>

      {/* Action Card */}
      <div className="mb-8">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Register New Person</h2>
          <Link
            href={`/${locale}/staff/dashboard/registration`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Go to Registration
          </Link>
        </div>
      </div>

      {/* People Table - Priority */}
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Registered People in Center</h2>
        </div>
        {persons.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
            <p className="text-gray-500">No people registered in this center yet.</p>
            <Link
              href={`/${locale}/staff/dashboard/registration`}
              className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Register First Person
            </Link>
          </div>
        ) : (
          <SearchablePeopleTable persons={persons} />
        )}
      </div>
    </div>
  );
}

