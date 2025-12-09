import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          property_type: string | null
          status: string
          created_at: string
          updated_at: string
          is_template: boolean
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          property_type?: string
          status?: string
          created_at?: string
          updated_at?: string
          is_template?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          property_type?: string
          status?: string
          updated_at?: string
          is_template?: boolean
        }
      }
      project_data: {
        Row: {
          project_id: string
          section: string
          data: Record<string, unknown>
          updated_at: string
        }
        Insert: {
          project_id: string
          section: string
          data: Record<string, unknown>
          updated_at?: string
        }
        Update: {
          data?: Record<string, unknown>
          updated_at?: string
        }
      }
    }
  }
}

