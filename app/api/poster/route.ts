import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generatePosterImage } from '@/lib/services/posterService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const posterCode = searchParams.get('posterCode');
    const format = (searchParams.get('format') || 'square') as 'square' | 'story';

    if (!posterCode) {
      return NextResponse.json(
        { error: 'Poster code required' },
        { status: 400 }
      );
    }

    // Fetch missing person data
    const missingPerson = await prisma.missingPerson.findUnique({
      where: { posterCode },
    });

    if (!missingPerson) {
      return NextResponse.json(
        { error: 'Missing person report not found' },
        { status: 404 }
      );
    }

    // Generate poster image
    const posterBuffer = await generatePosterImage(
      {
        fullName: missingPerson.fullName,
        age: missingPerson.age,
        gender: missingPerson.gender,
        photoUrl: missingPerson.photoUrl,
        lastSeenLocation: missingPerson.lastSeenLocation,
        lastSeenDistrict: missingPerson.lastSeenDistrict,
        lastSeenDate: missingPerson.lastSeenDate?.toISOString() || null,
        reporterPhone: missingPerson.reporterPhone,
        posterCode: missingPerson.posterCode,
      },
      format
    );

    // Return image
    return new NextResponse(posterBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${posterCode}-${format}.png"`,
      },
    });
  } catch (error) {
    console.error('Poster generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate poster' },
      { status: 500 }
    );
  }
}
