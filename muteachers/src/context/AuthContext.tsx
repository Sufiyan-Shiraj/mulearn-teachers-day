/* ============================================================
   Who is making this card.

   There is no sign-in. Someone types a display name, the browser
   mints an id for them and keeps both in local storage, and that
   id owns their cards, their profile page and their place on the
   leaderboard. Nothing is verified and nothing can be locked out
   of — for a one-day event board that is the whole point.

   The names here still say "auth" because every screen calls
   `useAuth()` and `openAuthModal()`; what they now open is a box
   asking for a name.
   ============================================================ */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { type UserProfile } from '../lib/supabase'
import { pushProfile } from '../lib/profile'

export interface AuthModalOptions {
  title?: string
  subtitle?: string
  /** where to go once a name has been given */
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
  /** create or rename the person at the keyboard; false if the name was unusable */
  saveName: (name: string) => Promise<boolean>
  /** forget the name on this device, so the next card asks again */
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const LS_PROFILE = 'mulearn_profile'

/* ---------------- names and handles ---------------- */

export function cleanName(raw: string) {
  return raw.trim().replace(/\s+/g, ' ').slice(0, 40)
}

/** a display name turned into something that can live in a URL */
export function handleFrom(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 20)
  return base || 'student'
}

const suffix = () => Math.random().toString(36).slice(2, 6)

function readProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LS_PROFILE)
    if (!raw) return null
    const p = JSON.parse(raw) as UserProfile
    return p?.id && p?.displayName ? p : null
  } catch { return null }
}

function writeProfile(p: UserProfile | null) {
  try {
    if (p) localStorage.setItem(LS_PROFILE, JSON.stringify(p))
    else localStorage.removeItem(LS_PROFILE)
  } catch { /* private mode */ }
}

function newId() {
  try { return crypto.randomUUID() } catch { /* older browsers */ }
  return `${Date.now().toString(16)}-${suffix()}${suffix()}-${suffix()}${suffix()}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalOptions, setAuthModalOptions] = useState<AuthModalOptions | null>(null)

  /* the name lives on the device, so there is nothing to wait for */
  useEffect(() => {
    setUser(readProfile())
    setLoading(false)
  }, [])

  const openAuthModal = (options?: AuthModalOptions | unknown) => {
    /* several screens pass this straight to onClick, so a click event can
       arrive here instead of options — ignore it rather than storing it */
    if (options && typeof options === 'object' && !('nativeEvent' in options) && !('_reactName' in options)) {
      const opts = options as AuthModalOptions
      setAuthModalOptions(opts)
      if (opts.redirectTo) {
        try { sessionStorage.setItem('mulearn_post_auth_redirect', opts.redirectTo) } catch { /* ignore */ }
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

  const saveName = async (raw: string): Promise<boolean> => {
    const displayName = cleanName(raw)
    if (!displayName) return false

    const existing = readProfile()
    const draft: UserProfile = existing
      ? { ...existing, displayName, username: existing.username || handleFrom(displayName) }
      : {
          id: newId(),
          displayName,
          username: handleFrom(displayName),
          createdAt: new Date().toISOString(),
        }

    const saved = await pushProfile(draft)
    writeProfile(saved)
    setUser(saved)

    setIsAuthModalOpen(false)
    const opts = authModalOptions
    setAuthModalOptions(null)

    if (opts?.onSuccess) {
      opts.onSuccess()
    } else {
      try {
        const target = sessionStorage.getItem('mulearn_post_auth_redirect')
        if (target) {
          sessionStorage.removeItem('mulearn_post_auth_redirect')
          navigate(target)
        }
      } catch { /* ignore */ }
    }
    return true
  }

  const signOut = async () => {
    writeProfile(null)
    setUser(null)
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
        saveName,
        signOut,
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
