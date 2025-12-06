/**
 * API Route: Admin Login for Compensation Dashboard
 * POST /api/compensation/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  authenticateCompensationAdmin,
  createCompensationAdminToken,
} from '@/lib/auth/compensationAdminAuth';
import { compensationAdminAuthSchema } from '@/lib/utils/validation';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = compensationAdminAuthSchema.parse(body);

    // Authenticate admin
    const { success, admin, error } = await authenticateCompensationAdmin(
      validated.username,
      validated.password
    );

    if (!success || !admin) {
      return NextResponse.json(
        { error: error || 'Authentication failed' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createCompensationAdminToken({
      adminId: admin.id,
      username: admin.username,
      fullName: admin.fullName,
      role: admin.role,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('compensation_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json({
      success: true,
      admin: {
        username: admin.username,
        fullName: admin.fullName,
        role: admin.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
