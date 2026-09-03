import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key')
);

// Supabase client
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
    }
  }
);

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  if (!isSupabaseConfigured) {
    // In local demo mode, simulate instant Google login
    const demoUser = {
      id: 'demo-user-123',
      email: 'student.mulearn@gmail.com',
      displayName: 'mulearn Student',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      username: 'mulearn_student',
      createdAt: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('mulearn_demo_user', JSON.stringify(demoUser));
      window.dispatchEvent(new Event('mulearn_auth_change'));
    }
    return { data: { user: demoUser }, error: null };
  }

  const redirectTo = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/auth/callback` 
    : undefined;

  try {
    const res = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (res.error) {
      console.error('Supabase Google OAuth Error:', res.error);
      alert(`Google Sign-In Error: ${res.error.message}\n\nPlease check that Google provider is enabled in your Supabase Dashboard (Authentication -> Providers -> Google).`);
      return res;
    }

    // Force top-level window navigation if not already redirected
    if (res.data?.url && typeof window !== 'undefined') {
      window.location.href = res.data.url;
    }

    return res;
  } catch (err: any) {
    console.error('OAuth initiation error:', err);
    alert(`Failed to start Google login: ${err.message || err}`);
    return { data: null, error: err };
  }
}

/**
 * Sign out
 */
export async function signOut() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mulearn_demo_user');
    window.dispatchEvent(new Event('mulearn_auth_change'));
  }
  if (isSupabaseConfigured) {
    return supabase.auth.signOut();
  }
  return { error: null };
}
