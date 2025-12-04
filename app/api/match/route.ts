import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { verifyShelterToken } from '@/lib/auth/jwt';
import { createMatch } from '@/lib/services/matchService';

const confirmMatchSchema = z.object({
  personId: z.string(),
  missingPersonId: z.string(),
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
    const validated = confirmMatchSchema.parse(body);

    // Create match record
    await createMatch(validated.personId, validated.missingPersonId, 100);

    return NextResponse.json({
      success: true,
      message: 'Match confirmed successfully',
    });
  } catch (error) {
    console.error('Confirm match error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to confirm match' },
      { status: 500 }
    );
  }
}
