import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getAnonymousUserIdFromCookies } from '@/lib/utils/anonymousUser';
import { UserReportCard } from '@/components/features/UserReportCard';
import { MissingPersonReport } from '@/components/features/MissingPersonCard';

interface UserPageProps {
  params: Promise<{
    locale: string;
    uuid: string;
  }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { locale, uuid } = await params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    notFound();
  }

  // Verify the UUID matches the cookie
  const cookieStore = await cookies();
  const cookieUserId = getAnonymousUserIdFromCookies(cookieStore);
  
  if (cookieUserId !== uuid) {
    notFound();
  }

  // Fetch user reports directly from database
  const supabase = await createClient();
  const { data: reportsData, error } = await supabase
    .from('missing_persons')
    .select('*')
    .eq('anonymous_user_id', uuid)
    .order('created_at', { ascending: false });

  const reports: MissingPersonReport[] = (reportsData || []).map((item) => ({
    id: item.id,
    fullName: item.full_name,
    age: item.age,
    gender: item.gender,
    photoUrl: item.photo_url,
    lastSeenLocation: item.last_seen_location,
    lastSeenDistrict: item.last_seen_district,
    lastSeenDate: item.last_seen_date,
    clothing: item.clothing,
    reporterName: item.reporter_name,
    reporterPhone: item.reporter_phone,
    status: item.status,
    posterCode: item.poster_code,
    createdAt: item.created_at,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center rounded text-base text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          ← Back to Home
        </Link>
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">My Reports</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your missing person reports
          </p>
        </div>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-gray-500">You haven't created any reports yet.</p>
          <Link
            href={`/${locale}/missing/report`}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Report a Missing Person
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report: any) => (
            <UserReportCard key={report.id} report={report} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

