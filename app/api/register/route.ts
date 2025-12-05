import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { verifyShelterToken } from '@/lib/auth/jwt';
import { findMatches } from '@/lib/services/matchService';
import { generateId } from '@/lib/utils/helpers';

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

    const supabase = await createClient();

    // Generate unique ID
    const id = generateId();
    const now = new Date().toISOString();

    // Create person record
    const { data: person, error: createError } = await supabase
      .from('persons')
      .insert({
        id: id,
        created_at: now,
        updated_at: now,
        full_name: validated.fullName,
        age: validated.age,
        gender: validated.gender,
        nic: validated.nic || null,
        photo_url: validated.photoUrl || null,
        contact_number: validated.contactNumber || null,
        health_status: validated.healthStatus,
        special_notes: validated.specialNotes || null,
        shelter_id: validated.shelterId,
      })
      .select()
      .single();

    if (createError || !person) {
      throw createError || new Error('Failed to create person');
    }

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
