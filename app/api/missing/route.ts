import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { generatePosterCode } from '@/lib/utils/helpers';

const createMissingPersonSchema = z.object({
  fullName: z.string().min(2).max(100),
  age: z.number().min(0).max(120),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  photoUrl: z.string().url().optional().or(z.literal('')),
  lastSeenLocation: z.string().min(2).max(200),
  lastSeenDistrict: z.string().min(2),
  lastSeenDate: z.string().optional(),
  clothing: z.string().max(500).optional(),
  reporterName: z.string().min(2).max(100),
  reporterPhone: z.string().regex(/^0\d{9}$/),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request data
    const validated = createMissingPersonSchema.parse(body);

    // Generate unique poster code
    const posterCode = generatePosterCode();

    // Create missing person record
    const missingPerson = await prisma.missingPerson.create({
      data: {
        fullName: validated.fullName,
        age: validated.age,
        gender: validated.gender,
        photoUrl: validated.photoUrl || null,
        lastSeenLocation: validated.lastSeenLocation,
        lastSeenDistrict: validated.lastSeenDistrict,
        lastSeenDate: validated.lastSeenDate ? new Date(validated.lastSeenDate) : null,
        clothing: validated.clothing,
        reporterName: validated.reporterName,
        reporterPhone: validated.reporterPhone,
        posterCode,
        status: 'MISSING',
      },
    });

    return NextResponse.json({
      success: true,
      posterCode: missingPerson.posterCode,
      id: missingPerson.id,
    });
  } catch (error) {
    console.error('Create missing person error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create missing person report' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const posterCode = searchParams.get('posterCode');

    if (!posterCode) {
      return NextResponse.json(
        { error: 'Poster code required' },
        { status: 400 }
      );
    }

    const missingPerson = await prisma.missingPerson.findUnique({
      where: { posterCode },
      include: {
        foundPersons: {
          include: {
            shelter: {
              select: {
                name: true,
                district: true,
                contactNumber: true,
              },
            },
          },
        },
      },
    });

    if (!missingPerson) {
      return NextResponse.json(
        { error: 'Missing person report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      missingPerson,
    });
  } catch (error) {
    console.error('Get missing person error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch missing person report' },
      { status: 500 }
    );
  }
}
