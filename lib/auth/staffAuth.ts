import { getServiceRoleClient } from '@/lib/supabase/serviceRoleClient';
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
    const supabase = getServiceRoleClient();
    
    // Normalize center code - trim and uppercase
    const normalizedCode = centerCode.trim().toUpperCase();
    
    console.log('Staff auth attempt:', { centerCode, normalizedCode });
    
    // Find staff center by code
    const { data: center, error: centerError } = await supabase
      .from('staff_centers')
      .select('*')
      .eq('code', normalizedCode)
      .single();

    if (centerError) {
      console.error('Error finding staff center:', centerError);
      return {
        success: false,
        error: centerError.code === 'PGRST116' ? 'Center not found' : `Database error: ${centerError.message}`,
      };
    }

    if (!center) {
      console.error('Center not found for code:', normalizedCode);
      return {
        success: false,
        error: 'Center not found',
      };
    }
    
    // Check if center is active
    if (!center.is_active) {
      console.error('Center is inactive:', { id: center.id, code: center.code });
      return {
        success: false,
        error: 'Center is inactive',
      };
    }
    
    console.log('Center found:', { id: center.id, code: center.code, name: center.name, isActive: center.is_active });

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
    
    console.log('Access code verification:', { isValid, providedCode: accessCode.substring(0, 3) + '...' });

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

