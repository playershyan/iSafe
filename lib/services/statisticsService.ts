import { createClient } from '@/utils/supabase/server';
import { AppStatistics } from '@/types';

export async function getStatistics(): Promise<AppStatistics> {
  try {
    const supabase = await createClient();
    
    // Try to get cached statistics
    const { data: stats, error } = await supabase
      .from('statistics')
      .select('*')
      .eq('id', 'singleton')
      .single();

    // If no stats exist, create initial record
    if (error || !stats) {
      const now = new Date().toISOString();
      const { data: newStats, error: createError } = await supabase
        .from('statistics')
        .insert({
          id: 'singleton',
          updated_at: now,
          total_persons: 0,
          total_shelters: 0,
          active_shelters: 0,
          total_missing: 0,
          total_matches: 0,
          by_district: {},
        })
        .select()
        .single();

      if (createError || !newStats) {
        throw createError;
      }

      return {
        totalPersons: newStats.total_persons,
        totalShelters: newStats.total_shelters,
        activeShelters: newStats.active_shelters,
        totalMissing: newStats.total_missing,
        totalMatches: newStats.total_matches,
        byDistrict: newStats.by_district as Record<string, number>,
      };
    }

    return {
      totalPersons: stats.total_persons,
      totalShelters: stats.total_shelters,
      activeShelters: stats.active_shelters,
      totalMissing: stats.total_missing,
      totalMatches: stats.total_matches,
      byDistrict: stats.by_district as Record<string, number>,
    };
  } catch (error) {
    // Only log errors in development to avoid noisy source map warnings
    if (process.env.NODE_ENV === 'development') {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching statistics:', errorMessage);
    }
    // Return default values on error
    return {
      totalPersons: 0,
      totalShelters: 0,
      activeShelters: 0,
      totalMissing: 0,
      totalMatches: 0,
      byDistrict: {},
    };
  }
}

export async function updateStatistics(): Promise<void> {
  try {
    const supabase = await createClient();

    const [personsResult, sheltersResult, activeSheltersResult, missingResult, matchesResult] = await Promise.all([
      supabase.from('persons').select('*', { count: 'exact', head: true }),
      supabase.from('shelters').select('*', { count: 'exact', head: true }),
      supabase.from('shelters').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('missing_persons').select('*', { count: 'exact', head: true }).eq('status', 'MISSING'),
      supabase.from('matches').select('*', { count: 'exact', head: true }).not('confirmed_at', 'is', null),
    ]);

    const totalPersons = personsResult.count || 0;
    const totalShelters = sheltersResult.count || 0;
    const activeShelters = activeSheltersResult.count || 0;
    const totalMissing = missingResult.count || 0;
    const totalMatches = matchesResult.count || 0;

    // Try to update existing record
    const { error: updateError } = await supabase
      .from('statistics')
      .update({
        total_persons: totalPersons,
        total_shelters: totalShelters,
        active_shelters: activeShelters,
        total_missing: totalMissing,
        total_matches: totalMatches,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'singleton');

    // If update failed (record doesn't exist), create it
    if (updateError) {
      const now = new Date().toISOString();
      await supabase.from('statistics').insert({
        id: 'singleton',
        updated_at: now,
        total_persons: totalPersons,
        total_shelters: totalShelters,
        active_shelters: activeShelters,
        total_missing: totalMissing,
        total_matches: totalMatches,
        by_district: {},
      });
    }
  } catch (error) {
    console.error('Error updating statistics:', error);
  }
}
