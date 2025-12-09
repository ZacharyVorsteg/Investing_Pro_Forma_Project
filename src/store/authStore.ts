import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return url && key && !url.includes('placeholder') && !key.includes('placeholder')
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  isDemoMode: boolean
  
  // Actions
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      isDemoMode: !isSupabaseConfigured(),

      signUp: async (email: string, password: string, fullName?: string) => {
        set({ isLoading: true, error: null })
        
        // Demo mode - create user locally
        if (!isSupabaseConfigured()) {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const user: User = {
            id: `demo-${Date.now()}`,
            email,
            full_name: fullName,
            created_at: new Date().toISOString(),
          }
          
          // Store in localStorage
          localStorage.setItem('demo_user', JSON.stringify(user))
          
          set({ user, isAuthenticated: true, isLoading: false, isDemoMode: true })
          return
        }

        // Real Supabase auth
        try {
          const { supabase } = await import('../lib/supabase')
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName },
            },
          })

          if (error) throw error

          if (data.user) {
            const user: User = {
              id: data.user.id,
              email: data.user.email || email,
              full_name: fullName,
              created_at: data.user.created_at,
            }
            set({ user, isAuthenticated: true, isLoading: false })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Sign up failed',
            isLoading: false 
          })
          throw error
        }
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        // Demo mode - authenticate locally
        if (!isSupabaseConfigured()) {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Check if user exists or create new one
          const existingUser = localStorage.getItem('demo_user')
          let user: User
          
          if (existingUser) {
            user = JSON.parse(existingUser)
            // Update email if different
            if (user.email !== email) {
              user.email = email
            }
          } else {
            user = {
              id: `demo-${Date.now()}`,
              email,
              full_name: email.split('@')[0],
              created_at: new Date().toISOString(),
            }
          }
          
          localStorage.setItem('demo_user', JSON.stringify(user))
          set({ user, isAuthenticated: true, isLoading: false, isDemoMode: true })
          return
        }

        // Real Supabase auth
        try {
          const { supabase } = await import('../lib/supabase')
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) throw error

          if (data.user) {
            const user: User = {
              id: data.user.id,
              email: data.user.email || email,
              full_name: data.user.user_metadata?.full_name,
              created_at: data.user.created_at,
            }
            set({ user, isAuthenticated: true, isLoading: false })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Sign in failed',
            isLoading: false 
          })
          throw error
        }
      },

      signOut: async () => {
        set({ isLoading: true })
        
        if (!isSupabaseConfigured()) {
          localStorage.removeItem('demo_user')
          set({ user: null, isAuthenticated: false, isLoading: false })
          return
        }

        try {
          const { supabase } = await import('../lib/supabase')
          await supabase.auth.signOut()
          set({ user: null, isAuthenticated: false, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Sign out failed',
            isLoading: false 
          })
        }
      },

      checkAuth: async () => {
        set({ isLoading: true })
        
        // Demo mode - check localStorage
        if (!isSupabaseConfigured()) {
          const storedUser = localStorage.getItem('demo_user')
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser)
              set({ user, isAuthenticated: true, isLoading: false, isDemoMode: true })
              return
            } catch {
              // Invalid stored data
            }
          }
          set({ user: null, isAuthenticated: false, isLoading: false, isDemoMode: true })
          return
        }

        // Real Supabase auth
        try {
          const { supabase } = await import('../lib/supabase')
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name,
              created_at: session.user.created_at,
            }
            set({ user, isAuthenticated: true, isLoading: false })
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false })
          }
        } catch (error) {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: error instanceof Error ? error.message : 'Auth check failed'
          })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'investor-pro-auth',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isDemoMode: state.isDemoMode,
      }),
    }
  )
)
