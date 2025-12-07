import { getServiceRoleClient } from '@/lib/supabase/serviceRoleClient';

export interface StaffStatistics {
  centerPersonsCount: number;
  totalPersonsCount: number;
}

export interface CenterPerson {
  id: string;
  fullName: string;
  gender: string;
  age: number;
}

export async function getStaffStatistics(centerId: string): Promise<StaffStatistics> {
  try {
    const supabase = getServiceRoleClient();
    
    // Count persons in the specific center (using center ID as shelter ID)
    const { count: centerCount, error: centerError } = await supabase
      .from('persons')
      .select('*', { count: 'exact', head: true })
      .eq('shelter_id', centerId);

    // Count total persons across all centers
    const { count: totalCount, error: totalError } = await supabase
      .from('persons')
      .select('*', { count: 'exact', head: true });

    if (centerError || totalError) {
      console.error('Error fetching staff statistics:', centerError || totalError);
      return {
        centerPersonsCount: 0,
        totalPersonsCount: 0,
      };
    }

    return {
      centerPersonsCount: centerCount || 0,
      totalPersonsCount: totalCount || 0,
    };
  } catch (error) {
    console.error('Error fetching staff statistics:', error);
    return {
      centerPersonsCount: 0,
      totalPersonsCount: 0,
    };
  }
}

export async function getCenterPersons(centerId: string): Promise<CenterPerson[]> {
  try {
    const supabase = getServiceRoleClient();
    
    const { data: persons, error } = await supabase
      .from('persons')
      .select('id, full_name, gender, age')
      .eq('shelter_id', centerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching center persons:', error);
      return [];
    }

    return (persons || []).map(person => ({
      id: person.id,
      fullName: person.full_name,
      gender: person.gender,
      age: person.age,
    }));
  } catch (error) {
    console.error('Error fetching center persons:', error);
    return [];
  }
}

