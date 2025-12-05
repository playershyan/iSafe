import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generatePosterImage } from '@/lib/services/posterService';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
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
    const { data: missingPerson, error } = await supabase
      .from('missing_persons')
      .select('*')
      .eq('poster_code', posterCode)
      .single();

    if (error || !missingPerson) {
      return NextResponse.json(
        { error: 'Missing person report not found' },
        { status: 404 }
      );
    }

    // Generate poster image
    const posterBuffer = await generatePosterImage(
      {
        fullName: missingPerson.full_name,
        age: missingPerson.age,
        gender: missingPerson.gender,
        photoUrl: missingPerson.photo_url,
        lastSeenLocation: missingPerson.last_seen_location,
        lastSeenDistrict: missingPerson.last_seen_district,
        lastSeenDate: missingPerson.last_seen_date || null,
        reporterPhone: missingPerson.reporter_phone,
        posterCode: missingPerson.poster_code,
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
