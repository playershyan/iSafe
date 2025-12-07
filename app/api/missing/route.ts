import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase/serviceRoleClient';
import { z } from 'zod';
import { generatePosterCode, generateId } from '@/lib/utils/helpers';
import { getAnonymousUserIdFromCookies, setAnonymousUserIdCookie } from '@/lib/utils/anonymousUser';
import { cookies } from 'next/headers';

const createMissingPersonSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  age: z.number().min(0, 'Age must be at least 0').max(120, 'Age must be at most 120'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { errorMap: () => ({ message: 'Gender is required' }) }),
  nic: z
    .string()
    .regex(/^(\d{9}[VvXx]|\d{12})$/, 'Invalid NIC format')
    .transform((val) => val.toUpperCase())
    .optional()
    .or(z.literal('')),
  photoUrl: z.union([z.string().url(), z.literal('')]).optional(),
  lastSeenLocation: z.string().min(2, 'Location must be at least 2 characters').max(200),
  lastSeenDistrict: z.union([z.string(), z.literal('')]).optional(),
  lastSeenDate: z.string().min(1, 'Date is required'),
  clothing: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.string().max(500, 'Clothing description must be at most 500 characters').optional()
  ),
  reporterName: z.string().min(2, 'Reporter name must be at least 2 characters').max(100),
  reporterPhone: z.string().regex(/^0\d{9}$/, 'Phone must be 10 digits starting with 0'),
  alternativeContact: z.string().regex(/^0\d{9}$/, 'Phone must be 10 digits starting with 0').optional().or(z.literal('')),
  anonymousUserId: z.string().uuid().optional(),
  locale: z.enum(['en', 'si', 'ta']).optional().default('en'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceRoleClient();
    const cookieStore = await cookies();
    const body = await request.json();
    
    // Normalize photoUrl - if empty string, set to undefined
    if (body.photoUrl === '') {
      body.photoUrl = undefined;
    }

    // Get or create anonymous user ID
    let anonymousUserId = body.anonymousUserId || getAnonymousUserIdFromCookies(cookieStore);
    
    // If no anonymous user ID exists, we'll let the client generate one
    // The client should send it in the request body

    // Validate request data
    const validated = createMissingPersonSchema.parse(body);
    
    // Use anonymousUserId from validated body if provided
    anonymousUserId = validated.anonymousUserId || anonymousUserId;

    // Generate unique IDs
    const id = generateId();
    const posterCode = generatePosterCode();
    const now = new Date().toISOString();
    
    // Set cookie if we have an anonymous user ID
    if (anonymousUserId) {
      setAnonymousUserIdCookie(cookieStore, anonymousUserId);
    }

    // Debug: Log photo URL before insert
    console.log('Creating missing person with photoUrl:', validated.photoUrl);

    // Create missing person record
    const { data: missingPerson, error: dbError } = await supabase
      .from('missing_persons')
      .insert({
        id: id,
        created_at: now,
        updated_at: now,
        full_name: validated.fullName,
        age: validated.age,
        gender: validated.gender,
        nic: validated.nic && validated.nic !== '' ? validated.nic : null,
        photo_url: validated.photoUrl && validated.photoUrl !== '' ? validated.photoUrl : null,
        last_seen_location: validated.lastSeenLocation,
        last_seen_district: validated.lastSeenDistrict && validated.lastSeenDistrict !== '' ? validated.lastSeenDistrict : null,
        last_seen_date: validated.lastSeenDate || null,
        clothing: validated.clothing || null,
        reporter_name: validated.reporterName,
        reporter_phone: validated.reporterPhone,
        alt_contact: validated.alternativeContact && validated.alternativeContact !== '' ? validated.alternativeContact : null,
        poster_code: posterCode,
        status: 'MISSING',
        anonymous_user_id: anonymousUserId || null,
        locale: validated.locale || 'en',
      })
      .select()
      .single();
    
    // Debug: Log what was actually stored
    if (missingPerson) {
      console.log('Missing person created with photo_url:', missingPerson.photo_url);
    }

    if (dbError) {
      console.error('Database error creating missing person:', dbError);
      
      // Handle specific database errors
      if (dbError.code === '23505') {
        // Unique constraint violation
        return NextResponse.json(
          { error: 'A record with this information already exists', details: dbError.details },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Database error',
          message: dbError.message,
          details: process.env.NODE_ENV === 'development' ? dbError.details : undefined
        },
        { status: 500 }
      );
    }

    if (!missingPerson) {
      return NextResponse.json(
        { error: 'Failed to create missing person record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      posterCode: missingPerson.poster_code,
      id: missingPerson.id,
      anonymousUserId: anonymousUserId,
    });
  } catch (error) {
    console.error('Create missing person error:', error);

    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors,
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    // Log the full error for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      { 
        error: 'Failed to create missing person report',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceRoleClient();
    const { searchParams } = new URL(request.url);
    const posterCode = searchParams.get('posterCode');

    if (!posterCode) {
      return NextResponse.json(
        { error: 'Poster code required' },
        { status: 400 }
      );
    }

    const { data: missingPerson, error } = await supabase
      .from('missing_persons')
      .select(`
        *,
        found_persons:persons(
          *,
          shelter:shelters(
            name,
            district,
            contact_number
          )
        )
      `)
      .eq('poster_code', posterCode)
      .single();

    if (error || !missingPerson) {
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
