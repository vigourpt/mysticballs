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
          subscription_id: string | null
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
          subscription_id?: string | null
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
          subscription_id?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan_id: string
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_id: string
          status: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_id?: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
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
      has_active_subscription: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
