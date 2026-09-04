import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (import.meta.env as any).NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (import.meta.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key'),
)

// Supabase client instance
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'implicit',
      storageKey: 'mulearn_auth_token',
    },
  },
)

export interface UserProfile {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  username: string
  createdAt?: string
}

/**
 * Sign in with Google OAuth via Supabase
 */
export async function signInWithGoogle() {
  if (!isSupabaseConfigured) {
    console.error('Supabase is not configured.')
    alert('Supabase credentials are not configured. Please check your environment variables.')
    return { data: null, error: new Error('Supabase not configured') }
  }

  const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined

  try {
    const res = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })

    if (res.error) {
      console.error('Supabase Google OAuth Error:', res.error)
      alert(`Google Sign-In Error: ${res.error.message}\n\nPlease verify Google provider is active in your Supabase Dashboard.`)
      return res
    }

    if (res.data?.url && typeof window !== 'undefined') {
      window.location.href = res.data.url
    }

    return res
  } catch (err: any) {
    console.error('OAuth initiation error:', err)
    alert(`Failed to start Google login: ${err.message || err}`)
    return { data: null, error: err }
  }
}

/**
 * Sign out from Supabase
 */
export async function signOut() {
  if (isSupabaseConfigured) {
    return supabase.auth.signOut()
  }

  return { error: null }
}
