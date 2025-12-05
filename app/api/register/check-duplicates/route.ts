import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { verifyShelterToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const checkDuplicatesSchema = z.object({
  names: z.array(z.string().min(1)).min(1),
  centerId: z.string(),
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
    const validated = checkDuplicatesSchema.parse(body);

    // Verify center ID matches authenticated session
    if (validated.centerId !== session.shelterId) {
      return NextResponse.json(
        { error: 'Center ID mismatch' },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Normalize names for comparison (trim and lowercase)
    const normalizedNames = validated.names.map(name => name.trim().toLowerCase());

    // Get all existing persons in the center
    const { data: existingPersons, error } = await supabase
      .from('persons')
      .select('full_name')
      .eq('shelter_id', validated.centerId);

    if (error) {
      console.error('Error checking duplicates:', error);
      return NextResponse.json(
        { error: 'Failed to check duplicates' },
        { status: 500 }
      );
    }

    // Normalize existing names for comparison
    const existingNames = new Set(
      (existingPersons || []).map(p => p.full_name.toLowerCase().trim())
    );

    // Find duplicates
    const duplicates: string[] = [];
    normalizedNames.forEach((normalizedName, index) => {
      if (existingNames.has(normalizedName)) {
        duplicates.push(validated.names[index]); // Return original case
      }
    });

    return NextResponse.json({
      hasDuplicates: duplicates.length > 0,
      duplicates,
    });
  } catch (error) {
    console.error('Check duplicates error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to check duplicates' },
      { status: 500 }
    );
  }
}

