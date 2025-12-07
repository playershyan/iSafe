import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase/serviceRoleClient';
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

    const supabase = getServiceRoleClient();
    const now = new Date().toISOString();

    // Verify shelter exists (or create it if it's a staff center)
    const shelterId = session.shelterId;
    let { data: shelter, error: shelterCheckError } = await supabase
      .from('shelters')
      .select('id, name, code')
      .eq('id', shelterId)
      .maybeSingle();

    // If shelter doesn't exist, check if it's a staff center and create corresponding shelter
    if (shelterCheckError || !shelter) {
      console.log('Shelter not found, checking if it\'s a staff center...');
      
      // Check if this is a staff center
      const { data: staffCenter, error: staffCenterError } = await supabase
        .from('staff_centers')
        .select('id, name, code, district')
        .eq('id', shelterId)
        .single();

      if (staffCenter && !staffCenterError) {
        console.log('Found staff center, creating corresponding shelter...', { 
          id: staffCenter.id, 
          code: staffCenter.code, 
          name: staffCenter.name 
        });
        
        // Create a corresponding shelter with the same ID
        const { data: newShelter, error: createShelterError } = await supabase
          .from('shelters')
          .insert({
            id: staffCenter.id,
            name: staffCenter.name,
            code: staffCenter.code,
            district: staffCenter.district,
            is_active: true,
            created_at: now,
            updated_at: now,
            current_count: 0,
          })
          .select()
          .single();

        if (createShelterError) {
          console.error('Failed to create shelter for staff center:', {
            error: createShelterError,
            code: createShelterError.code,
            message: createShelterError.message,
            details: createShelterError.details,
            hint: createShelterError.hint,
          });
          
          // Check if it's a unique constraint violation (shelter already exists)
          if (createShelterError.code === '23505') {
            // Try to fetch the existing shelter
            const { data: existingShelter } = await supabase
              .from('shelters')
              .select('id, name, code')
              .eq('id', staffCenter.id)
              .single();
            
            if (existingShelter) {
              shelter = existingShelter;
              console.log('Shelter already exists, using existing:', { id: shelter.id, code: shelter.code });
            } else {
              return NextResponse.json(
                { error: 'Shelter with this code already exists' },
                { status: 409 }
              );
            }
          } else {
            return NextResponse.json(
              { error: 'Failed to create shelter record', details: createShelterError.message },
              { status: 500 }
            );
          }
        } else if (!newShelter) {
          console.error('Shelter creation returned null');
          return NextResponse.json(
            { error: 'Failed to create shelter record - no data returned' },
            { status: 500 }
          );
        } else {
          // newShelter is guaranteed to be non-null here
          shelter = newShelter;
          console.log('Created shelter for staff center:', { id: newShelter.id, code: newShelter.code });
        }
      } else {
        console.error('Shelter not found and not a staff center:', { 
          shelterId, 
          error: shelterCheckError,
          staffCenterError 
        });
        return NextResponse.json(
          { error: 'Shelter not found' },
          { status: 400 }
        );
      }
    }

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

    if (insertError) {
      console.error('Bulk insert error:', {
        error: insertError,
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });
      
      // Provide more specific error messages
      if (insertError.code === '23503') {
        return NextResponse.json(
          { error: 'Invalid shelter ID. The shelter does not exist.' },
          { status: 400 }
        );
      }
      
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'One or more persons with duplicate NICs already exist' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to register persons', details: insertError.message },
        { status: 500 }
      );
    }

    if (!insertedPersons || insertedPersons.length === 0) {
      console.error('Bulk insert returned no data');
      return NextResponse.json(
        { error: 'Failed to register persons - no data returned' },
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

