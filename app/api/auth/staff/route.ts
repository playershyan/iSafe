import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateStaff } from '@/lib/auth/staffAuth';
import { createShelterToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

const staffAuthSchema = z.object({
  shelterCode: z.string().min(1, 'Center code required'),
  accessCode: z.string().min(1, 'Access code required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validated = staffAuthSchema.parse(body);

    // Authenticate staff
    const authResult = await authenticateStaff(
      validated.shelterCode,
      validated.accessCode
    );

    if (!authResult.success || !authResult.center) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    // Create JWT token (reusing shelter token structure for compatibility)
    const token = await createShelterToken({
      shelterId: authResult.center.id,
      shelterCode: authResult.center.code,
      shelterName: authResult.center.name,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('shelter_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json({
      success: true,
      center: authResult.center,
    });
  } catch (error) {
    console.error('Staff auth API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('shelter_token');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}

