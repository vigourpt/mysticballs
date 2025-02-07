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
          last_reading_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          display_name?: string | null
          readings_count?: number
          is_premium?: boolean
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
          last_reading_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      increment_reading_count: {
        Args: {
          user_id: string
        }
        Returns: {
          id: string
          email: string
          display_name: string | null
          readings_count: number
          is_premium: boolean
          last_reading_date: string | null
          created_at: string
          updated_at: string
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}