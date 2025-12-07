/**
 * Supabase Database Types
 * Generated manually based on database schema
 * 
 * Note: This file should ideally be generated using Supabase CLI:
 * npx supabase gen types typescript --project-id <project-id> > types/supabase.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      compensation_applications: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          applicant_name: string
          applicant_nic: string
          applicant_phone: string
          applicant_address: string
          district: string
          divisional_secretariat: string
          grama_niladhari_division: string
          status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID'
          admin_notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          application_code: string
          submitted_from_ip: string | null
          phone_verified: boolean
          sms_sent: boolean
          sms_sent_at: string | null
          locale: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          applicant_name: string
          applicant_nic: string
          applicant_phone: string
          applicant_address: string
          district: string
          divisional_secretariat: string
          grama_niladhari_division: string
          status?: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID'
          admin_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          application_code: string
          submitted_from_ip?: string | null
          phone_verified?: boolean
          sms_sent?: boolean
          sms_sent_at?: string | null
          locale?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          applicant_name?: string
          applicant_nic?: string
          applicant_phone?: string
          applicant_address?: string
          district?: string
          divisional_secretariat?: string
          grama_niladhari_division?: string
          status?: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID'
          admin_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          application_code?: string
          submitted_from_ip?: string | null
          phone_verified?: boolean
          sms_sent?: boolean
          sms_sent_at?: string | null
          locale?: string | null
        }
      }
      compensation_claims: {
        Row: {
          id: string
          application_id: string
          claim_type: 'CLEANING_ALLOWANCE' | 'KITCHEN_UTENSILS' | 'LIVELIHOOD_ALLOWANCE' | 'RENTAL_ALLOWANCE' | 'CROP_DAMAGE_PADDY' | 'CROP_DAMAGE_VEGETABLES' | 'LIVESTOCK_FARM' | 'SMALL_ENTERPRISE' | 'FISHING_BOAT' | 'SCHOOL_SUPPLIES' | 'BUSINESS_BUILDING' | 'NEW_HOUSE_CONSTRUCTION' | 'LAND_PURCHASE' | 'HOUSE_REPAIR' | 'DEATH_DISABILITY'
          claim_status: 'PENDING' | 'APPROVED' | 'REJECTED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          claim_type: 'CLEANING_ALLOWANCE' | 'KITCHEN_UTENSILS' | 'LIVELIHOOD_ALLOWANCE' | 'RENTAL_ALLOWANCE' | 'CROP_DAMAGE_PADDY' | 'CROP_DAMAGE_VEGETABLES' | 'LIVESTOCK_FARM' | 'SMALL_ENTERPRISE' | 'FISHING_BOAT' | 'SCHOOL_SUPPLIES' | 'BUSINESS_BUILDING' | 'NEW_HOUSE_CONSTRUCTION' | 'LAND_PURCHASE' | 'HOUSE_REPAIR' | 'DEATH_DISABILITY'
          claim_status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          claim_type?: 'CLEANING_ALLOWANCE' | 'KITCHEN_UTENSILS' | 'LIVELIHOOD_ALLOWANCE' | 'RENTAL_ALLOWANCE' | 'CROP_DAMAGE_PADDY' | 'CROP_DAMAGE_VEGETABLES' | 'LIVESTOCK_FARM' | 'SMALL_ENTERPRISE' | 'FISHING_BOAT' | 'SCHOOL_SUPPLIES' | 'BUSINESS_BUILDING' | 'NEW_HOUSE_CONSTRUCTION' | 'LAND_PURCHASE' | 'HOUSE_REPAIR' | 'DEATH_DISABILITY'
          claim_status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          created_at?: string
          updated_at?: string
        }
      }
      compensation_admins: {
        Row: {
          id: string
          username: string
          password_hash: string
          full_name: string
          email: string | null
          role: 'ADMIN' | 'SUPER_ADMIN'
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          full_name: string
          email?: string | null
          role?: 'ADMIN' | 'SUPER_ADMIN'
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          full_name?: string
          email?: string | null
          role?: 'ADMIN' | 'SUPER_ADMIN'
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      administrative_divisions: {
        Row: {
          id?: string
          district: string
          divisional_secretariat: string
          grama_niladhari_division: string
          gn_code: string | null
        }
        Insert: {
          id?: string
          district: string
          divisional_secretariat: string
          grama_niladhari_division: string
          gn_code?: string | null
        }
        Update: {
          id?: string
          district?: string
          divisional_secretariat?: string
          grama_niladhari_division?: string
          gn_code?: string | null
        }
      }
      districts: {
        Row: {
          id: string
          name: string
          name_sinhala: string | null
          name_tamil: string | null
          province: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_sinhala?: string | null
          name_tamil?: string | null
          province?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_sinhala?: string | null
          name_tamil?: string | null
          province?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
