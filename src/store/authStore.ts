import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  
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
      isLoading: true,
      isAuthenticated: false,
      error: null,

      signUp: async (email: string, password: string, fullName?: string) => {
        set({ isLoading: true, error: null })
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
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
        try {
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
        try {
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
        try {
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
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    useAuthStore.setState({
      user: {
        id: session.user.id,
        email: session.user.email || '',
        full_name: session.user.user_metadata?.full_name,
        created_at: session.user.created_at,
      },
      isAuthenticated: true,
      isLoading: false,
    })
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }
})

