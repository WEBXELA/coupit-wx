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
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          square_access_token: string | null
          square_refresh_token: string | null
          square_token_expires_at: string | null
          square_merchant_id: string | null
          square_environment: 'production' | 'sandbox' | null
          square_connected_at: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          square_access_token?: string | null
          square_refresh_token?: string | null
          square_token_expires_at?: string | null
          square_merchant_id?: string | null
          square_environment?: 'production' | 'sandbox' | null
          square_connected_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          square_access_token?: string | null
          square_refresh_token?: string | null
          square_token_expires_at?: string | null
          square_merchant_id?: string | null
          square_environment?: 'production' | 'sandbox' | null
          square_connected_at?: string | null
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