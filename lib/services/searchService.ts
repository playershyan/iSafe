import { prisma } from '@/lib/db/prisma';
import { PersonSearchResult } from '@/types';

export async function searchByName(query: string): Promise<PersonSearchResult[]> {
  try {
    // Use PostgreSQL full-text search with similarity
    // For MVP, using basic ILIKE for partial matching
    // TODO: Enable pg_trgm extension for better fuzzy search
    const results = await prisma.person.findMany({
      where: {
        fullName: {
          contains: query,
          mode: 'insensitive',
        },
      },
      include: {
        shelter: {
          select: {
            name: true,
            district: true,
            contactNumber: true,
          },
        },
      },
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return results.map((person) => ({
      id: person.id,
      fullName: person.fullName,
      age: person.age,
      gender: person.gender,
      nic: person.nic || undefined,
      photoUrl: person.photoUrl || undefined,
      healthStatus: person.healthStatus,
      shelter: {
        name: person.shelter.name,
        district: person.shelter.district,
        contactNumber: person.shelter.contactNumber || undefined,
      },
      createdAt: person.createdAt,
    }));
  } catch (error) {
    console.error('Search by name error:', error);
    return [];
  }
}

export async function searchByNIC(nic: string): Promise<PersonSearchResult[]> {
  try {
    const normalizedNIC = nic.trim().toUpperCase();

    const results = await prisma.person.findMany({
      where: {
        nic: {
          equals: normalizedNIC,
          mode: 'insensitive',
        },
      },
      include: {
        shelter: {
          select: {
            name: true,
            district: true,
            contactNumber: true,
          },
        },
      },
      take: 10,
    });

    return results.map((person) => ({
      id: person.id,
      fullName: person.fullName,
      age: person.age,
      gender: person.gender,
      nic: person.nic || undefined,
      photoUrl: person.photoUrl || undefined,
      healthStatus: person.healthStatus,
      shelter: {
        name: person.shelter.name,
        district: person.shelter.district,
        contactNumber: person.shelter.contactNumber || undefined,
      },
      createdAt: person.createdAt,
    }));
  } catch (error) {
    console.error('Search by NIC error:', error);
    return [];
  }
}
