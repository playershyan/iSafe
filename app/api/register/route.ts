import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase/serviceRoleClient';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { verifyShelterToken } from '@/lib/auth/jwt';
import { findMatches, sendNotificationsForMatches } from '@/lib/services/matchService';
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

    const supabase = getServiceRoleClient();

    // Generate unique ID
    const id = generateId();
    const now = new Date().toISOString();

    // Verify shelter exists before inserting
    let { data: shelter, error: shelterCheckError } = await supabase
      .from('shelters')
      .select('id, name, code')
      .eq('id', validated.shelterId)
      .maybeSingle();

    // If shelter doesn't exist, check if it's a staff center and create corresponding shelter
    if (shelterCheckError || !shelter) {
      console.log('Shelter not found, checking if it\'s a staff center...');
      
      // Check if this is a staff center
      const { data: staffCenter, error: staffCenterError } = await supabase
        .from('staff_centers')
        .select('id, name, code, district')
        .eq('id', validated.shelterId)
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
          shelterId: validated.shelterId, 
          error: shelterCheckError,
          staffCenterError 
        });
        return NextResponse.json(
          { error: 'Shelter not found' },
          { status: 400 }
        );
      }
    }

    // Final check: shelter must exist at this point
    if (!shelter) {
      return NextResponse.json(
        { error: 'Shelter record not available' },
        { status: 500 }
      );
    }

    console.log('Creating person:', {
      id,
      name: validated.fullName,
      shelterId: validated.shelterId,
      shelterName: shelter.name,
    });

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
        special_notes: validated.specialNotes || null,
        shelter_id: validated.shelterId,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating person:', {
        error: createError,
        code: createError.code,
        message: createError.message,
        details: createError.details,
        hint: createError.hint,
      });
      
      // Provide more specific error messages
      if (createError.code === '23503') {
        return NextResponse.json(
          { error: 'Invalid shelter ID. The shelter does not exist.' },
          { status: 400 }
        );
      }
      
      if (createError.code === '23505') {
        return NextResponse.json(
          { error: 'A person with this NIC already exists' },
          { status: 409 }
        );
      }
      
      throw createError;
    }

    if (!person) {
      console.error('Person creation returned null data');
      return NextResponse.json(
        { error: 'Failed to create person record' },
        { status: 500 }
      );
    }

    console.log('Person created successfully:', { personId: person.id });

    // Find potential matches
    const matches = await findMatches({
      fullName: validated.fullName,
      age: validated.age,
      gender: validated.gender,
      nic: validated.nic || undefined,
    });

    // Send notifications for matches (non-blocking - don't fail registration if this fails)
    if (matches && matches.length > 0) {
      sendNotificationsForMatches(
        person.id,
        validated.fullName,
        matches,
        validated.shelterId
      ).catch((error) => {
        // Log error but don't throw - registration should succeed even if notifications fail
        console.error('Error sending match notifications:', error);
      });
    }

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
