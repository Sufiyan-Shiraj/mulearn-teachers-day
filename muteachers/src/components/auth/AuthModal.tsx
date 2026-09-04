import { useEffect, useState } from 'react'
import { handleFrom, useAuth } from '../../context/AuthContext'
import { Logo } from '../shell/Logo'
import { HeartDoodle, Sparkle } from '../art/Doodles'
import { Decoration } from '../art/Decorations'
import './authModal.css'

/**
 * Asks for a name. That is the whole of signing in here — the name goes on
 * the card, on the profile page and on the leaderboard, and nothing else is
 * collected, so the box has one field and one button.
 */
export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalOptions,
    saveName,
    user,
  } = useAuth()

  const [name, setName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* opening it again to change a name should start from the current one */
  useEffect(() => {
    if (isAuthModalOpen) {
      setName(user?.displayName ?? '')
      setErrorMsg('')
    }
  }, [isAuthModalOpen, user])

  if (!isAuthModalOpen) return null

  const handle = handleFrom(name)
  const renaming = !!user

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!name.trim()) {
      setErrorMsg('Please put in a name so your card can be yours.')
      return
    }
    setIsSubmitting(true)
    const ok = await saveName(name)
    setIsSubmitting(false)
    if (!ok) setErrorMsg('That name won’t work — try letters and numbers.')
  }

  return (
    <div
      className="auth-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) closeAuthModal() }}
    >
      <div className="auth-modal" role="dialog" aria-modal="true">
          {/* Washi Tape Header Accent */}
          <span className="auth-tape" aria-hidden>
            <Decoration deco="tape-red" />
          </span>

          <button
            type="button"
            className="auth-close"
            onClick={closeAuthModal}
            aria-label="Close dialog"
          >
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
              <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <div className="auth-head" style={{ marginBottom: '1.5rem' }}>
            <Logo height={28} />
          </div>

          <form onSubmit={submit} className="auth-form">
            <h2 className="auth-title">
              {authModalOptions?.title || (renaming ? 'Change your name' : 'What’s your name?')}
              <Sparkle size={18} color="var(--gold)" />
            </h2>
            <p className="auth-sub" style={{ marginBottom: '1.2rem' }}>
              {authModalOptions?.subtitle
                || 'It goes on your card and on the leaderboard — nothing else is needed.'}
              <HeartDoodle size={16} className="auth-sub-heart" />
            </p>

            <label className="auth-label">
              <span>Your name</span>
              <div className="auth-input-wrap">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First name is fine"
                  maxLength={40}
                  autoFocus
                  autoComplete="name"
                  enterKeyHint="go"
                  className="auth-input auth-input--name"
                />
              </div>
            </label>

            <p className="auth-handle-note">
              {name.trim()
                ? <>Your cards will live at <code>/u/{handle}</code></>
                : <>Your cards will live at <code>/u/your_name</code></>}
            </p>

            {errorMsg && <p className="auth-err">{errorMsg}</p>}

            <button type="submit" disabled={isSubmitting || !name.trim()} className="auth-btn auth-btn--primary">
              <span>{isSubmitting ? 'Saving…' : renaming ? 'Save name' : 'Start making'}</span>
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
                <path d="M4 10.5 8 14.5 16 5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <p className="auth-footer-note">
              No account, no password — just a name so your cards find their way back to you.
            </p>
          </form>
      </div>
    </div>
  )
}
