import { prisma } from '@/lib/db/prisma';
import { AppStatistics } from '@/types';

export async function getStatistics(): Promise<AppStatistics> {
  try {
    // Try to get cached statistics
    let stats = await prisma.statistics.findUnique({
      where: { id: 'singleton' },
    });

    // If no stats exist, create initial record
    if (!stats) {
      stats = await prisma.statistics.create({
        data: {
          id: 'singleton',
          totalPersons: 0,
          totalShelters: 0,
          activeShelters: 0,
          totalMissing: 0,
          totalMatches: 0,
          byDistrict: {},
        },
      });
    }

    return {
      totalPersons: stats.totalPersons,
      totalShelters: stats.totalShelters,
      activeShelters: stats.activeShelters,
      totalMissing: stats.totalMissing,
      totalMatches: stats.totalMatches,
      byDistrict: stats.byDistrict as Record<string, number>,
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
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
    const [totalPersons, totalShelters, activeShelters, totalMissing, totalMatches] = await Promise.all([
      prisma.person.count(),
      prisma.shelter.count(),
      prisma.shelter.count({ where: { isActive: true } }),
      prisma.missingPerson.count({ where: { status: 'MISSING' } }),
      prisma.match.count({ where: { confirmedAt: { not: null } } }),
    ]);

    await prisma.statistics.upsert({
      where: { id: 'singleton' },
      update: {
        totalPersons,
        totalShelters,
        activeShelters,
        totalMissing,
        totalMatches,
        updatedAt: new Date(),
      },
      create: {
        id: 'singleton',
        totalPersons,
        totalShelters,
        activeShelters,
        totalMissing,
        totalMatches,
        byDistrict: {},
      },
    });
  } catch (error) {
    console.error('Error updating statistics:', error);
  }
}
