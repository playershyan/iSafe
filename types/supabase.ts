export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      persons: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          age: number
          gender: 'MALE' | 'FEMALE' | 'OTHER'
          nic: string | null
          contact_number: string | null
          shelter_id: string
          health_status: 'HEALTHY' | 'MINOR_INJURIES' | 'REQUIRES_CARE' | 'CRITICAL'
          special_notes: string | null
          photo_url: string | null
          photo_public_id: string | null
          missing_report_id: string | null
          matched_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name: string
          age: number
          gender: 'MALE' | 'FEMALE' | 'OTHER'
          nic?: string | null
          contact_number?: string | null
          shelter_id: string
          health_status: 'HEALTHY' | 'MINOR_INJURIES' | 'REQUIRES_CARE' | 'CRITICAL'
          special_notes?: string | null
          photo_url?: string | null
          photo_public_id?: string | null
          missing_report_id?: string | null
          matched_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          age?: number
          gender?: 'MALE' | 'FEMALE' | 'OTHER'
          nic?: string | null
          contact_number?: string | null
          shelter_id?: string
          health_status?: 'HEALTHY' | 'MINOR_INJURIES' | 'REQUIRES_CARE' | 'CRITICAL'
          special_notes?: string | null
          photo_url?: string | null
          photo_public_id?: string | null
          missing_report_id?: string | null
          matched_at?: string | null
        }
      }
      missing_persons: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          age: number
          gender: 'MALE' | 'FEMALE' | 'OTHER'
          nic: string | null
          photo_url: string | null
          photo_public_id: string | null
          last_seen_location: string
          last_seen_district: string | null
          last_seen_date: string | null
          clothing: string | null
          reporter_name: string
          reporter_phone: string
          alt_contact: string | null
          status: 'MISSING' | 'FOUND' | 'CLOSED'
          poster_code: string
          poster_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name: string
          age: number
          gender: 'MALE' | 'FEMALE' | 'OTHER'
          nic?: string | null
          photo_url?: string | null
          photo_public_id?: string | null
          last_seen_location: string
          last_seen_district?: string | null
          last_seen_date?: string | null
          clothing?: string | null
          reporter_name: string
          reporter_phone: string
          alt_contact?: string | null
          status?: 'MISSING' | 'FOUND' | 'CLOSED'
          poster_code: string
          poster_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          age?: number
          gender?: 'MALE' | 'FEMALE' | 'OTHER'
          nic?: string | null
          photo_url?: string | null
          photo_public_id?: string | null
          last_seen_location?: string
          last_seen_district?: string | null
          last_seen_date?: string | null
          clothing?: string | null
          reporter_name?: string
          reporter_phone?: string
          alt_contact?: string | null
          status?: 'MISSING' | 'FOUND' | 'CLOSED'
          poster_code?: string
          poster_url?: string | null
        }
      }
      shelters: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          code: string
          district: string
          address: string | null
          contact_person: string | null
          contact_number: string | null
          capacity: number | null
          current_count: number
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          code: string
          district: string
          address?: string | null
          contact_person?: string | null
          contact_number?: string | null
          capacity?: number | null
          current_count?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          code?: string
          district?: string
          address?: string | null
          contact_person?: string | null
          contact_number?: string | null
          capacity?: number | null
          current_count?: number
          is_active?: boolean
        }
      }
      shelter_auth: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          shelter_id: string
          access_code: string
          last_access_at: string | null
          access_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          shelter_id: string
          access_code: string
          last_access_at?: string | null
          access_count?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          shelter_id?: string
          access_code?: string
          last_access_at?: string | null
          access_count?: number
        }
      }
      matches: {
        Row: {
          id: string
          created_at: string
          matched_at: string
          missing_person_id: string
          person_id: string
          match_score: number
          matched_by: 'MANUAL' | 'AUTOMATIC' | 'PHOTO_MATCH'
          confirmed_at: string | null
          confirmed_by: string | null
          notification_sent: boolean
          notified_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          matched_at?: string
          missing_person_id: string
          person_id: string
          match_score: number
          matched_by?: 'MANUAL' | 'AUTOMATIC' | 'PHOTO_MATCH'
          confirmed_at?: string | null
          confirmed_by?: string | null
          notification_sent?: boolean
          notified_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          matched_at?: string
          missing_person_id?: string
          person_id?: string
          match_score?: number
          matched_by?: 'MANUAL' | 'AUTOMATIC' | 'PHOTO_MATCH'
          confirmed_at?: string | null
          confirmed_by?: string | null
          notification_sent?: boolean
          notified_at?: string | null
        }
      }
      statistics: {
        Row: {
          id: string
          updated_at: string
          total_persons: number
          total_shelters: number
          active_shelters: number
          total_missing: number
          total_matches: number
          by_district: Json
        }
        Insert: {
          id?: string
          updated_at?: string
          total_persons?: number
          total_shelters?: number
          active_shelters?: number
          total_missing?: number
          total_matches?: number
          by_district?: Json
        }
        Update: {
          id?: string
          updated_at?: string
          total_persons?: number
          total_shelters?: number
          active_shelters?: number
          total_missing?: number
          total_matches?: number
          by_district?: Json
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
      gender: 'MALE' | 'FEMALE' | 'OTHER'
      health_status: 'HEALTHY' | 'MINOR_INJURIES' | 'REQUIRES_CARE' | 'CRITICAL'
      missing_status: 'MISSING' | 'FOUND' | 'CLOSED'
      match_method: 'MANUAL' | 'AUTOMATIC' | 'PHOTO_MATCH'
    }
  }
}

