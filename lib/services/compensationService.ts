/**
 * Compensation Service
 * Handles business logic for disaster compensation applications
 */

import { createClient } from '@/utils/supabase/server';
import { Database } from '@/types/supabase';
import type { ClaimType, CompensationFilter } from '@/lib/utils/validation';

type CompensationApplication = Database['public']['Tables']['compensation_applications']['Row'];
type CompensationClaim = Database['public']['Tables']['compensation_claims']['Row'];
type AdministrativeDivision = Database['public']['Tables']['administrative_divisions']['Row'];

export interface CreateApplicationData {
  applicantName: string;
  applicantNic: string;
  applicantPhone: string;
  applicantAddress: string;
  district: string;
  divisionalSecretariat: string;
  gramaNiladhariDivision: string;
  claims: ClaimType[];
  phoneVerified: boolean;
  submittedFromIp?: string;
}

export interface ApplicationWithClaims extends CompensationApplication {
  claims: CompensationClaim[];
}

/**
 * Generate unique application code
 * Format: COMP-2025-XXXXXX (6 random alphanumeric characters)
 */
export function generateApplicationCode(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `COMP-${year}-${code}`;
}

/**
 * Create a new compensation application with claims
 */
export async function createApplication(
  data: CreateApplicationData
): Promise<{ success: boolean; application?: ApplicationWithClaims; error?: string }> {
  try {
    const supabase = await createClient();

    // Generate unique application code
    let applicationCode = generateApplicationCode();

    // Ensure uniqueness (retry if collision)
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('compensation_applications')
        .select('id')
        .eq('application_code', applicationCode)
        .single();

      if (!existing) break;

      applicationCode = generateApplicationCode();
      attempts++;
    }

    if (attempts >= 5) {
      return { success: false, error: 'Failed to generate unique application code' };
    }

    // Insert application
    const { data: application, error: appError } = await supabase
      .from('compensation_applications')
      .insert({
        applicant_name: data.applicantName,
        applicant_nic: data.applicantNic,
        applicant_phone: data.applicantPhone,
        applicant_address: data.applicantAddress,
        district: data.district,
        divisional_secretariat: data.divisionalSecretariat,
        grama_niladhari_division: data.gramaNiladhariDivision,
        application_code: applicationCode,
        phone_verified: data.phoneVerified,
        submitted_from_ip: data.submittedFromIp,
        status: 'PENDING',
      })
      .select()
      .single();

    if (appError || !application) {
      console.error('Error creating application:', appError);
      return { success: false, error: 'Failed to create application' };
    }

    // Insert claims
    const claimsToInsert = data.claims.map((claimType) => ({
      application_id: application.id,
      claim_type: claimType,
      claim_status: 'PENDING' as const,
    }));

    const { data: claims, error: claimsError } = await supabase
      .from('compensation_claims')
      .insert(claimsToInsert)
      .select();

    if (claimsError || !claims) {
      console.error('Error creating claims:', claimsError);
      // Rollback application
      await supabase.from('compensation_applications').delete().eq('id', application.id);
      return { success: false, error: 'Failed to create claims' };
    }

    return {
      success: true,
      application: {
        ...application,
        claims,
      },
    };
  } catch (error) {
    console.error('Error in createApplication:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Get applications with optional filters and pagination
 */
export async function getApplications(
  filters: CompensationFilter
): Promise<{
  success: boolean;
  applications?: ApplicationWithClaims[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('compensation_applications')
      .select('*, compensation_claims(*)', { count: 'exact' });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.district) {
      query = query.eq('district', filters.district);
    }

    if (filters.divisionalSecretariat) {
      query = query.eq('divisional_secretariat', filters.divisionalSecretariat);
    }

    if (filters.gramaNiladhariDivision) {
      query = query.eq('grama_niladhari_division', filters.gramaNiladhariDivision);
    }

    // Search by name, NIC, or application code
    if (filters.search) {
      query = query.or(
        `applicant_name.ilike.%${filters.search}%,applicant_nic.ilike.%${filters.search}%,application_code.ilike.%${filters.search}%`
      );
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .range(from, to)
      .order('created_at', { ascending: false });

    const { data: applications, error, count } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
      return { success: false, error: 'Failed to fetch applications' };
    }

    // Filter by claim type if specified (post-query filter since it's in related table)
    let filteredApplications = applications || [];
    if (filters.claimType) {
      filteredApplications = filteredApplications.filter((app: any) =>
        app.compensation_claims?.some((claim: any) => claim.claim_type === filters.claimType)
      );
    }

    // Transform to expected format
    const transformedApplications: ApplicationWithClaims[] = filteredApplications.map((app: any) => ({
      ...app,
      claims: app.compensation_claims || [],
    }));

    return {
      success: true,
      applications: transformedApplications,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    console.error('Error in getApplications:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Get a single application by ID
 */
export async function getApplicationById(
  id: string
): Promise<{ success: boolean; application?: ApplicationWithClaims; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: application, error } = await supabase
      .from('compensation_applications')
      .select('*, compensation_claims(*)')
      .eq('id', id)
      .single();

    if (error || !application) {
      return { success: false, error: 'Application not found' };
    }

    return {
      success: true,
      application: {
        ...application,
        claims: (application as any).compensation_claims || [],
      },
    };
  } catch (error) {
    console.error('Error in getApplicationById:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  id: string,
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID',
  adminNotes?: string,
  reviewedBy?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('compensation_applications')
      .update({
        status,
        admin_notes: adminNotes,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating application status:', error);
      return { success: false, error: 'Failed to update status' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Mark SMS as sent for an application
 */
export async function markSmsSent(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('compensation_applications')
      .update({
        sms_sent: true,
        sms_sent_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error marking SMS as sent:', error);
      return { success: false, error: 'Failed to mark SMS as sent' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in markSmsSent:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Get administrative divisions (for dropdowns)
 */
export async function getAdministrativeDivisions(): Promise<{
  success: boolean;
  divisions?: AdministrativeDivision[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data: divisions, error } = await supabase
      .from('administrative_divisions')
      .select('*')
      .eq('is_active', true)
      .order('district')
      .order('divisional_secretariat')
      .order('grama_niladhari_division');

    if (error) {
      console.error('Error fetching divisions:', error);
      return { success: false, error: 'Failed to fetch divisions' };
    }

    return { success: true, divisions: divisions || [] };
  } catch (error) {
    console.error('Error in getAdministrativeDivisions:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Get unique districts
 */
export async function getDistricts(): Promise<{
  success: boolean;
  districts?: string[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data: divisions, error } = await supabase
      .from('administrative_divisions')
      .select('district')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching districts:', error);
      return { success: false, error: 'Failed to fetch districts' };
    }

    const uniqueDistricts = [...new Set(divisions?.map((d) => d.district) || [])].sort();
    return { success: true, districts: uniqueDistricts };
  } catch (error) {
    console.error('Error in getDistricts:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Get divisional secretariats for a district
 */
export async function getDivisionalSecretariats(
  district: string
): Promise<{
  success: boolean;
  secretariats?: string[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data: divisions, error } = await supabase
      .from('administrative_divisions')
      .select('divisional_secretariat')
      .eq('district', district)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching divisional secretariats:', error);
      return { success: false, error: 'Failed to fetch secretariats' };
    }

    const uniqueSecretariats = [...new Set(divisions?.map((d) => d.divisional_secretariat) || [])].sort();
    return { success: true, secretariats: uniqueSecretariats };
  } catch (error) {
    console.error('Error in getDivisionalSecretariats:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Get grama niladhari divisions for a divisional secretariat
 */
export async function getGramaNiladhariDivisions(
  district: string,
  divisionalSecretariat: string
): Promise<{
  success: boolean;
  divisions?: string[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data: divisions, error } = await supabase
      .from('administrative_divisions')
      .select('grama_niladhari_division')
      .eq('district', district)
      .eq('divisional_secretariat', divisionalSecretariat)
      .eq('is_active', true)
      .order('grama_niladhari_division');

    if (error) {
      console.error('Error fetching GN divisions:', error);
      return { success: false, error: 'Failed to fetch GN divisions' };
    }

    return { success: true, divisions: divisions?.map((d) => d.grama_niladhari_division) || [] };
  } catch (error) {
    console.error('Error in getGramaNiladhariDivisions:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Get compensation statistics
 */
export async function getStatistics(): Promise<{
  success: boolean;
  stats?: {
    totalApplications: number;
    byStatus: Record<string, number>;
    byDistrict: Record<string, number>;
    byClaimType: Record<string, number>;
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get all applications with claims
    const { data: applications, error } = await supabase
      .from('compensation_applications')
      .select('status, district, compensation_claims(claim_type)');

    if (error) {
      console.error('Error fetching statistics:', error);
      return { success: false, error: 'Failed to fetch statistics' };
    }

    const stats = {
      totalApplications: applications?.length || 0,
      byStatus: {} as Record<string, number>,
      byDistrict: {} as Record<string, number>,
      byClaimType: {} as Record<string, number>,
    };

    // Count by status and district
    applications?.forEach((app: any) => {
      stats.byStatus[app.status] = (stats.byStatus[app.status] || 0) + 1;
      stats.byDistrict[app.district] = (stats.byDistrict[app.district] || 0) + 1;

      // Count claim types
      app.compensation_claims?.forEach((claim: any) => {
        stats.byClaimType[claim.claim_type] = (stats.byClaimType[claim.claim_type] || 0) + 1;
      });
    });

    return { success: true, stats };
  } catch (error) {
    console.error('Error in getStatistics:', error);
    return { success: false, error: 'Internal server error' };
  }
}
