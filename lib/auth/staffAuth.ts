import { createClient } from '@/utils/supabase/server';
import bcrypt from 'bcryptjs';

export async function authenticateStaff(
  centerCode: string,
  accessCode: string
): Promise<{
  success: boolean;
  center?: {
    id: string;
    name: string;
    code: string;
    district: string;
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();
    
    // Find staff center by code
    const { data: center, error: centerError } = await supabase
      .from('staff_centers')
      .select('*')
      .eq('code', centerCode.toUpperCase())
      .single();

    if (centerError || !center) {
      return {
        success: false,
        error: 'Center not found',
      };
    }

    // Find authentication record for this center
    const { data: auth, error: authError } = await supabase
      .from('staff_auth')
      .select('*')
      .eq('center_id', center.id)
      .single();

    if (authError || !auth) {
      return {
        success: false,
        error: 'Staff authentication not set up',
      };
    }

    // Verify access code
    const isValid = await bcrypt.compare(accessCode, auth.access_code);

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid access code',
      };
    }

    // Update access count and last access time
    await supabase
      .from('staff_auth')
      .update({
        access_count: (auth.access_count || 0) + 1,
        last_access_at: new Date().toISOString(),
      })
      .eq('id', auth.id);

    return {
      success: true,
      center: {
        id: center.id,
        name: center.name,
        code: center.code,
        district: center.district,
      },
    };
  } catch (error) {
    console.error('Staff authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed',
    };
  }
}

