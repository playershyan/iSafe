import { createClient } from '@/utils/supabase/server';
import bcrypt from 'bcryptjs';

export async function authenticateShelter(
  shelterCode: string,
  accessCode: string
): Promise<{
  success: boolean;
  shelter?: {
    id: string;
    name: string;
    code: string;
    district: string;
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();
    
    // Find shelter by code
    const { data: shelter, error: shelterError } = await supabase
      .from('shelters')
      .select(`
        *,
        auth:shelter_auth(*)
      `)
      .eq('code', shelterCode.toUpperCase())
      .single();

    if (shelterError || !shelter) {
      return {
        success: false,
        error: 'Shelter not found',
      };
    }

    if (!shelter.auth || !Array.isArray(shelter.auth) || shelter.auth.length === 0) {
      return {
        success: false,
        error: 'Shelter authentication not set up',
      };
    }

    const auth = shelter.auth[0];

    // Verify access code
    const isValid = await bcrypt.compare(accessCode, auth.access_code);

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid access code',
      };
    }

    return {
      success: true,
      shelter: {
        id: shelter.id,
        name: shelter.name,
        code: shelter.code,
        district: shelter.district,
      },
    };
  } catch (error) {
    console.error('Shelter authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed',
    };
  }
}
