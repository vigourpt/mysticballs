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
      user_profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          readings_count: number
          is_premium: boolean
          is_admin: boolean
          last_reading_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          readings_count?: number
          is_premium?: boolean
          is_admin?: boolean
          last_reading_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          readings_count?: number
          is_premium?: boolean
          is_admin?: boolean
          last_reading_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_reading_count: {
        Args: { p_id: string }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
