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
    /* nobody signs in — the client only ever reads and writes rows */
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  },
)

export interface UserProfile {
  id: string
  displayName: string
  username: string
  createdAt?: string
  /** kept only so old profile shapes still type-check; never set any more */
  email?: string
  avatarUrl?: string
}
