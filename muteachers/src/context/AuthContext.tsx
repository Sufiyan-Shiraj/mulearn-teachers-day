import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  isSupabaseConfigured,
  signInWithGoogle as doSignInWithGoogle,
  signOut as doSignOut,
  supabase,
  type UserProfile,
} from '../lib/supabase'

export interface AuthModalOptions {
  mode?: 'signin' | 'signup'
  title?: string
  subtitle?: string
  redirectTo?: string
  onSuccess?: () => void
}

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  isAuthModalOpen: boolean
  authModalOptions: AuthModalOptions | null
  openAuthModal: (options?: AuthModalOptions | unknown) => void
  closeAuthModal: () => void
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateUsername: (newUsername: string) => Promise<boolean>
  showUsernamePrompt: boolean
  setShowUsernamePrompt: (show: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalOptions, setAuthModalOptions] = useState<AuthModalOptions | null>(null)
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false)

  const checkSession = async () => {
    setLoading(true)

    // Check Supabase session
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              displayName: profile.display_name || session.user.user_metadata?.full_name || 'Student',
              avatarUrl: profile.avatar_url || session.user.user_metadata?.avatar_url || '',
              username: profile.username || '',
              createdAt: profile.created_at,
            })
            if (!profile.username) {
              setShowUsernamePrompt(true)
            }
          } else {
            // Upsert new user profile
            const defaultUsername = (session.user.email?.split('@')[0] || 'student')
              .replace(/[^a-z0-9_]/gi, '')
              .toLowerCase()

            const newUser: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
              displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Student',
              avatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
              username: defaultUsername,
              createdAt: new Date().toISOString(),
            }

            try {
              await supabase.from('users').upsert({
                id: newUser.id,
                email: newUser.email,
                display_name: newUser.displayName,
                avatar_url: newUser.avatarUrl,
                username: newUser.username,
              })
            } catch (err) {
              console.warn('Profile upsert warning:', err)
            }

            setUser(newUser)
            setShowUsernamePrompt(true)
          }

          try {
            const target = sessionStorage.getItem('mulearn_post_auth_redirect')
            if (target) {
              sessionStorage.removeItem('mulearn_post_auth_redirect')
              navigate(target)
            }
          } catch {
            // ignore
          }
        } else {
          setUser(null)
        }
      } catch (e) {
        console.error('Session check error:', e)
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    checkSession()

    const handleCustomAuthChange = () => {
      checkSession()
    }

    window.addEventListener('mulearn_auth_change', handleCustomAuthChange)

    let authListener: { subscription: { unsubscribe: () => void } } | null = null
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          checkSession()
        } else {
          setUser(null)
        }
      })
      authListener = data
    }

    return () => {
      window.removeEventListener('mulearn_auth_change', handleCustomAuthChange)
      if (authListener) authListener.subscription.unsubscribe()
    }
  }, [])

  const triggerPostAuth = () => {
    if (authModalOptions?.onSuccess) {
      const cb = authModalOptions.onSuccess
      setAuthModalOptions(null)
      cb()
    } else {
      try {
        const target = sessionStorage.getItem('mulearn_post_auth_redirect')
        if (target) {
          sessionStorage.removeItem('mulearn_post_auth_redirect')
          navigate(target)
        }
      } catch {
        // storage error
      }
    }
  }

  const openAuthModal = (options?: AuthModalOptions | unknown) => {
    if (options && typeof options === 'object' && !('nativeEvent' in options) && !('_reactName' in options)) {
      const opts = options as AuthModalOptions
      setAuthModalOptions(opts)
      if (opts.redirectTo) {
        try {
          sessionStorage.setItem('mulearn_post_auth_redirect', opts.redirectTo)
        } catch {
          // ignore
        }
      }
    } else {
      setAuthModalOptions(null)
    }
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
    setAuthModalOptions(null)
  }

  const signInWithGoogle = async () => {
    try {
      await doSignInWithGoogle()
      setIsAuthModalOpen(false)
    } catch (e) {
      console.error('Sign in failed:', e)
    }
  }

  const signOut = async () => {
    await doSignOut()
    setUser(null)
  }

  const updateUsername = async (newUsername: string): Promise<boolean> => {
    const clean = newUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (!clean || !user) return false

    const updatedUser = { ...user, username: clean }
    setUser(updatedUser)

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ username: clean })
          .eq('id', user.id)

        if (error) {
          console.warn('Username update failed in Supabase:', error)
          return false
        }
      } catch (e) {
        console.warn('Username update error:', e)
        return false
      }
    }

    setShowUsernamePrompt(false)
    triggerPostAuth()
    return true
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        authModalOptions,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signOut,
        updateUsername,
        showUsernamePrompt,
        setShowUsernamePrompt,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
