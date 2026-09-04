import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { Logo } from '../shell/Logo'
import { HeartDoodle, Sparkle } from '../art/Doodles'
import { Decoration } from '../art/Decorations'
import './authModal.css'

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalOptions,
    signInWithGoogle,
    showUsernamePrompt,
    updateUsername,
    user,
  } = useAuth()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [usernameInput, setUsernameInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (authModalOptions?.mode) {
      setMode(authModalOptions.mode)
    }
  }, [authModalOptions])

  if (!isAuthModalOpen && !showUsernamePrompt) return null

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!usernameInput.trim()) {
      setErrorMsg('Please enter a username.')
      return
    }
    setIsSubmitting(true)
    const success = await updateUsername(usernameInput)
    setIsSubmitting(false)
    if (!success) {
      setErrorMsg('Username is already taken or invalid. Use letters, numbers, and underscores only.')
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        key="auth-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="auth-overlay"
        onClick={(e) => { if (e.target === e.currentTarget && !showUsernamePrompt) closeAuthModal() }}
      >
        <motion.div
          key="auth-dialog"
          initial={{ opacity: 0, scale: 0.93, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', damping: 26, stiffness: 380 }}
          className="auth-modal"
          role="dialog"
          aria-modal="true"
        >
          {/* Washi Tape Header Accent */}
          <span className="auth-tape" aria-hidden>
            <Decoration deco="tape-red" />
          </span>

          {/* Close Button */}
          {!showUsernamePrompt && (
            <motion.button
              whileHover={{ rotate: 90, scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="auth-close"
              onClick={closeAuthModal}
              aria-label="Close dialog"
            >
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
                <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </motion.button>
          )}

          {/* Logo */}
          <div className="auth-head" style={{ marginBottom: showUsernamePrompt ? '1.5rem' : '0.8rem' }}>
            <Logo height={28} />

            {!showUsernamePrompt && (
              <div className="auth-tabs" role="tablist" aria-label="Sign in or Sign up">
                <button
                  type="button"
                  className="auth-tab"
                  role="tab"
                  aria-selected={mode === 'signin'}
                  data-active={mode === 'signin' ? '' : undefined}
                  onClick={() => setMode('signin')}
                >
                  {mode === 'signin' && (
                    <motion.span
                      layoutId="auth-active-tab-pill"
                      className="auth-tab-pill"
                      transition={{ type: 'spring', damping: 28, stiffness: 450 }}
                    />
                  )}
                  <span className="auth-tab-text">Sign In</span>
                </button>
                <button
                  type="button"
                  className="auth-tab"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  data-active={mode === 'signup' ? '' : undefined}
                  onClick={() => setMode('signup')}
                >
                  {mode === 'signup' && (
                    <motion.span
                      layoutId="auth-active-tab-pill"
                      className="auth-tab-pill"
                      transition={{ type: 'spring', damping: 28, stiffness: 450 }}
                    />
                  )}
                  <span className="auth-tab-text">Sign Up</span>
                </button>
              </div>
            )}
          </div>

          {/* Username Setup Form (if new account) */}
          {showUsernamePrompt ? (
            <form onSubmit={handleUsernameSubmit} className="auth-form">
              <h2 className="auth-title">
                Choose your username <Sparkle size={18} color="var(--gold)" />
              </h2>
              <p className="auth-sub" style={{ marginBottom: '1rem' }}>
                Your cards will be shared at <code>/u/{usernameInput || user?.username || 'handle'}</code>
              </p>

              <label className="auth-label">
                <span>Pick your handle</span>
                <div className="auth-input-wrap">
                  <span className="auth-at">@</span>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder={user?.username || 'your_name'}
                    autoFocus
                    className="auth-input"
                  />
                </div>
              </label>

              {errorMsg && <p className="auth-err">{errorMsg}</p>}

              <button type="submit" disabled={isSubmitting} className="auth-btn auth-btn--primary">
                <span>{isSubmitting ? 'Saving…' : 'Complete Setup'}</span>
                <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
                  <path d="M4 10.5 8 14.5 16 5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === 'signup' ? 16 : -16, filter: 'blur(3px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: mode === 'signup' ? -16 : 16, filter: 'blur(3px)' }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="auth-tab-content"
              >
                <h2 className="auth-title">
                  {mode === 'signup'
                    ? (authModalOptions?.title || 'Create Your Account')
                    : (authModalOptions?.title || 'Welcome Back')}
                </h2>
                <p className="auth-sub" style={{ marginBottom: '1.4rem' }}>
                  {mode === 'signup'
                    ? (authModalOptions?.subtitle || 'Sign up with Google to personalize, save, and share your cards')
                    : (authModalOptions?.subtitle || 'Sign in with Google to access your cards and creator profile')}
                  <HeartDoodle size={16} className="auth-sub-heart" />
                </p>

                <div className="auth-actions">
                  {/* Google OAuth Button */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => signInWithGoogle()}
                    className="auth-btn auth-btn--google"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{mode === 'signup' ? 'Sign Up with Google' : 'Sign In with Google'}</span>
                  </motion.button>

                  <p className="auth-switch-note">
                    {mode === 'signup' ? (
                      <>
                        Already have an account?
                        <button type="button" className="auth-switch-btn" onClick={() => setMode('signin')}>
                          Sign In
                        </button>
                      </>
                    ) : (
                      <>
                        Don&rsquo;t have an account yet?
                        <button type="button" className="auth-switch-btn" onClick={() => setMode('signup')}>
                          Sign Up
                        </button>
                      </>
                    )}
                  </p>

                  <p className="auth-footer-note">
                    Cards are safely linked to your Google account and rank on the leaderboards.
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
