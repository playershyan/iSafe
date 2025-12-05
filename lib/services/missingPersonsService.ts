import { createClient } from '@/utils/supabase/server';
import { MissingPersonReport } from '@/components/features/MissingPersonCard';

export async function getMissingPersons(): Promise<MissingPersonReport[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('missing_persons')
    .select('*')
    .eq('status', 'MISSING')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching missing persons:', error);
    throw new Error('Failed to fetch missing persons');
  }

  if (!data) {
    return [];
  }

  const mapped = data.map((item) => ({
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

  // Debug: Log photo URLs
  console.log('Missing persons with photos:', mapped.filter(p => p.photoUrl).map(p => ({ id: p.id, name: p.fullName, photoUrl: p.photoUrl })));

  return mapped;
}

