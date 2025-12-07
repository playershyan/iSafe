/**
 * Compensation Admin Authentication
 * Handles authentication for compensation dashboard administrators
 */

import { getServiceRoleClient } from '@/lib/supabase/serviceRoleClient';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export interface CompensationAdminSession {
  adminId: string;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

/**
 * Authenticate admin user
 */
export async function authenticateCompensationAdmin(
  username: string,
  password: string
): Promise<{
  success: boolean;
  admin?: {
    id: string;
    username: string;
    fullName: string;
    role: 'ADMIN' | 'SUPER_ADMIN';
  };
  error?: string;
}> {
  try {
    const supabase = getServiceRoleClient();

    // Find admin by username
    const { data: admin, error: adminError } = await supabase
      .from('compensation_admins')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (adminError || !admin) {
      console.error('Admin lookup error:', adminError);
      return {
        success: false,
        error: 'Invalid username or password',
      };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, admin.password_hash);

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid username or password',
      };
    }

    // Update last login
    await supabase
      .from('compensation_admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id);

    return {
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        fullName: admin.full_name,
        role: admin.role,
      },
    };
  } catch (error) {
    console.error('Compensation admin authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed',
    };
  }
}

/**
 * Create JWT token for admin
 */
export async function createCompensationAdminToken(
  session: CompensationAdminSession
): Promise<string> {
  const token = await new SignJWT({
    adminId: session.adminId,
    username: session.username,
    fullName: session.fullName,
    role: session.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify JWT token and get admin session
 */
export async function verifyCompensationAdminToken(
  token: string
): Promise<CompensationAdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as CompensationAdminSession;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Hash password for creating/updating admin users
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}
