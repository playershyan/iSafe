import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export async function authenticateShelter(
  shelterCode: string,
  accessCode: string
): Promise<{
  success: boolean;
  shelter?: {
    id: string;
    name: string;
    code: string;
    district: string;
  };
  error?: string;
}> {
  try {
    // Find shelter by code
    const shelter = await prisma.shelter.findUnique({
      where: { code: shelterCode.toUpperCase() },
      include: {
        auth: true,
      },
    });

    if (!shelter) {
      return {
        success: false,
        error: 'Shelter not found',
      };
    }

    if (!shelter.auth) {
      return {
        success: false,
        error: 'Shelter authentication not set up',
      };
    }

    // Verify access code
    const isValid = await bcrypt.compare(accessCode, shelter.auth.accessCode);

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid access code',
      };
    }

    return {
      success: true,
      shelter: {
        id: shelter.id,
        name: shelter.name,
        code: shelter.code,
        district: shelter.district,
      },
    };
  } catch (error) {
    console.error('Shelter authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed',
    };
  }
}
