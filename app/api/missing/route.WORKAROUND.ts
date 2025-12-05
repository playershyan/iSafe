// TEMPORARY WORKAROUND VERSION - Uses camelCase columns
// This file is a backup/alternative that works with the current database state
//
// To use this workaround:
// 1. Rename current route.ts to route.ORIGINAL.ts
// 2. Rename this file to route.ts
// 3. Restart your dev server
//
// IMPORTANT: This is NOT the recommended solution!
// You should run the migration instead: database/migrations/20241205_convert_to_snake_case.sql

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { generatePosterCode } from '@/lib/utils/helpers';

const createMissingPersonSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  age: z.number().min(0, 'Age must be at least 0').max(120, 'Age must be at most 120'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { errorMap: () => ({ message: 'Gender is required' }) }),
  photoUrl: z.union([z.string().url(), z.literal('')]).optional(),
  lastSeenLocation: z.string().min(2, 'Location must be at least 2 characters').max(200),
  lastSeenDistrict: z.union([z.string(), z.literal('')]).optional(),
  lastSeenDate: z.string().min(1, 'Date is required'),
  clothing: z.union([z.string().max(500), z.literal('')]).optional(),
  reporterName: z.string().min(2, 'Reporter name must be at least 2 characters').max(100),
  reporterPhone: z.string().regex(/^0\d{9}$/, 'Phone must be 10 digits starting with 0'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Normalize photoUrl - if empty string, set to undefined
    if (body.photoUrl === '') {
      body.photoUrl = undefined;
    }

    // Validate request data
    const validated = createMissingPersonSchema.parse(body);

    // Generate unique poster code
    const posterCode = generatePosterCode();

    // ⚠️ WORKAROUND: Using camelCase columns (with quotes)
    // Create missing person record
    const { data: missingPerson, error: dbError } = await supabase
      .from('missing_persons')
      .insert({
        fullName: validated.fullName,  // ⚠️ camelCase instead of full_name
        age: validated.age,
        gender: validated.gender,
        photoUrl: validated.photoUrl && validated.photoUrl !== '' ? validated.photoUrl : null,  // ⚠️ camelCase
        lastSeenLocation: validated.lastSeenLocation,  // ⚠️ camelCase
        lastSeenDistrict: validated.lastSeenDistrict && validated.lastSeenDistrict !== '' ? validated.lastSeenDistrict : null,  // ⚠️ camelCase
        lastSeenDate: validated.lastSeenDate || null,  // ⚠️ camelCase
        clothing: validated.clothing && validated.clothing !== '' ? validated.clothing : null,
        reporterName: validated.reporterName,  // ⚠️ camelCase
        reporterPhone: validated.reporterPhone,  // ⚠️ camelCase
        posterCode: posterCode,  // ⚠️ camelCase
        status: 'MISSING',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error creating missing person:', dbError);
      console.error('Error details:', {
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
        code: dbError.code
      });

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
          details: process.env.NODE_ENV === 'development' ? dbError.details : undefined,
          hint: process.env.NODE_ENV === 'development' ? dbError.hint : undefined
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
      posterCode: missingPerson.posterCode,  // ⚠️ camelCase
      id: missingPerson.id,
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
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const posterCode = searchParams.get('posterCode');

    if (!posterCode) {
      return NextResponse.json(
        { error: 'Poster code required' },
        { status: 400 }
      );
    }

    // ⚠️ WORKAROUND: Using camelCase column names
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
      .eq('posterCode', posterCode)  // ⚠️ camelCase
      .single();

    if (error || !missingPerson) {
      console.error('Get missing person error:', error);
      return NextResponse.json(
        { error: 'Missing person report not found', details: error?.message },
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
      {
        error: 'Failed to fetch missing person report',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
