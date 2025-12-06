import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { verifyShelterToken } from '@/lib/auth/jwt';
import { generateId } from '@/lib/utils/helpers';
import { findMatches, sendNotificationsForMatches } from '@/lib/services/matchService';

const personSchema = z.object({
  fullName: z.string().min(2).max(100),
  age: z.number().min(0).max(120),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  shelterId: z.string(),
});

const bulkRegisterSchema = z.object({
  persons: z.array(personSchema).min(1, 'At least one person is required'),
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
    const validated = bulkRegisterSchema.parse(body);

    // Verify all persons belong to the authenticated center
    for (const person of validated.persons) {
      if (person.shelterId !== session.shelterId) {
        return NextResponse.json(
          { error: 'Shelter ID mismatch' },
          { status: 403 }
        );
      }
    }

    const supabase = await createClient();
    const now = new Date().toISOString();

    // Prepare persons for bulk insert
    const personsToInsert = validated.persons.map((person) => ({
      id: generateId(),
      created_at: now,
      updated_at: now,
      full_name: person.fullName,
      age: person.age,
      gender: person.gender,
      shelter_id: person.shelterId,
      nic: null,
      contact_number: null,
      photo_url: null,
      photo_public_id: null,
      special_notes: null,
      missing_report_id: null,
      matched_at: null,
    }));

    // Bulk insert persons
    const { data: insertedPersons, error: insertError } = await supabase
      .from('persons')
      .insert(personsToInsert)
      .select();

    if (insertError || !insertedPersons) {
      console.error('Bulk insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to register persons' },
        { status: 500 }
      );
    }

    // Check for matches and send notifications for each person (non-blocking)
    // Process in background - don't wait for completion
    Promise.all(
      insertedPersons.map(async (person) => {
        try {
          // Find potential matches for this person
          const matches = await findMatches({
            fullName: person.full_name,
            age: person.age,
            gender: person.gender,
            nic: person.nic || undefined,
          });

          // Send notifications if matches found
          if (matches && matches.length > 0) {
            await sendNotificationsForMatches(
              person.id,
              person.full_name,
              matches,
              person.shelter_id
            );
          }
        } catch (error) {
          // Log error but don't fail - continue with other persons
          console.error(`Error processing matches for person ${person.id}:`, error);
        }
      })
    ).catch((error) => {
      // Log overall error but don't throw
      console.error('Error in background match processing:', error);
    });

    return NextResponse.json({
      success: true,
      count: insertedPersons.length,
      persons: insertedPersons,
    });
  } catch (error) {
    console.error('Bulk registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to register persons' },
      { status: 500 }
    );
  }
}

