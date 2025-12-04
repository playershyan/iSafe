import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { verifyShelterToken } from '@/lib/auth/jwt';
import { findMatches } from '@/lib/services/matchService';

const registerPersonSchema = z.object({
  fullName: z.string().min(2).max(100),
  age: z.number().min(0).max(120),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  nic: z
    .string()
    .regex(/^(\d{9}[VvXx]|\d{12})$/)
    .transform((val) => val.toUpperCase())
    .optional()
    .or(z.literal('')),
  photoUrl: z.string().url().optional().or(z.literal('')),
  contactNumber: z.string().regex(/^0\d{9}$/).optional().or(z.literal('')),
  healthStatus: z.enum(['HEALTHY', 'MINOR_INJURIES', 'REQUIRES_CARE', 'CRITICAL']),
  specialNotes: z.string().max(500).optional(),
  shelterId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify shelter authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('shelter_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const session = await verifyShelterToken(token);

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request data
    const validated = registerPersonSchema.parse(body);

    // Verify shelter ID matches authenticated session
    if (validated.shelterId !== session.shelterId) {
      return NextResponse.json(
        { error: 'Shelter ID mismatch' },
        { status: 403 }
      );
    }

    // Create person record
    const person = await prisma.person.create({
      data: {
        fullName: validated.fullName,
        age: validated.age,
        gender: validated.gender,
        nic: validated.nic || null,
        photoUrl: validated.photoUrl || null,
        contactNumber: validated.contactNumber || null,
        healthStatus: validated.healthStatus,
        specialNotes: validated.specialNotes || null,
        shelterId: validated.shelterId,
      },
    });

    // Find potential matches
    const matches = await findMatches({
      fullName: validated.fullName,
      age: validated.age,
      gender: validated.gender,
      nic: validated.nic || undefined,
    });

    return NextResponse.json({
      success: true,
      personId: person.id,
      matches,
    });
  } catch (error) {
    console.error('Register person error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to register person' },
      { status: 500 }
    );
  }
}
