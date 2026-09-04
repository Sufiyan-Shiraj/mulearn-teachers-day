import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from './Logo'
import { HeartDoodle, Sparkle, Underline } from '../art/Doodles'
import { useScrollHeader } from '../../lib/useScrollHeader'
import { useAuth } from '../../context/AuthContext'
import './topnav.css'

interface Props {
  /** left slot replaces the logo row on step pages */
  back?: { to: string; label: string }
  compact?: boolean
}

const LINKS = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/about', label: 'About' },
]

const SHEET = [
  { to: '/', label: 'Home' },
  { to: '/photo', label: 'Make a card' },
  { to: '/my-cards', label: 'My Cards' },
  { to: '/leaderboards', label: 'Leaderboards' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/about', label: 'About' },
]

export function TopNav({ back }: Props) {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const nav = useNavigate()
  const { hidden, scrolled } = useScrollHeader()
  const { user, openAuthModal, signOut } = useAuth()

  useEffect(() => { setOpen(false) }, [loc.pathname])
  useEffect(() => {
    document.body.classList.toggle('no-scroll', open)
    return () => document.body.classList.remove('no-scroll')
  }, [open])

  return (
    <>
      <header className="nav" data-hidden={hidden && !open ? '' : undefined} data-scrolled={scrolled ? '' : undefined}>
        <div className="shell nav-in">
          <Link to="/" className="nav-logo" aria-label="μlearn ASI — home">
            <Logo height={27} />
          </Link>

          <nav className="nav-links" aria-label="Main">
            {LINKS.map(l => (
              <Link key={l.to} to={l.to} className="nav-link" data-active={loc.pathname === l.to ? '' : undefined}>
                {l.label}
              </Link>
            ))}

            <Link to="/leaderboards" className="nav-link" data-active={loc.pathname === '/leaderboards' ? '' : undefined}>
              Leaderboards
            </Link>

            <Link to="/my-cards" className="nav-tape">
              My Cards
              <svg className="nav-tape-ul" viewBox="0 0 120 8" preserveAspectRatio="none" aria-hidden>
                <path d="M3 5.4C24 2.6 46 1.7 68 2.3c17 .5 34 1.6 49 3" stroke="var(--red)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              </svg>
            </Link>

            {/* Auth Button or User Profile pill */}
            {user ? (
              <div className="nav-user-wrap">
                <Link to={`/u/${user.username}`} className="nav-user-pill" title="View your public profile">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="nav-user-avatar" />
                  ) : (
                    <span className="nav-user-avatar-initials">{user.displayName.charAt(0)}</span>
                  )}
                  <span className="nav-user-name">@{user.username || 'me'}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="nav-signout-btn"
                  title="Change your name"
                  aria-label="Change your name"
                >
                  <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
                    <path d="M7.5 3.5H4a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 4 16.5h3.5M13 13.5l3.5-3.5L13 6.5M7 10h9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ) : (
              <button type="button" onClick={openAuthModal} className="nav-signin-btn">
                <span>Add your name</span>
              </button>
            )}

            <HeartDoodle size={20} className="nav-heart" />
          </nav>

          <button className="nav-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(v => !v)}>
            <span /><span /><span />
          </button>
        </div>

        {back && (
          <div className="shell nav-back-row">
            <button className="nav-back" onClick={() => nav(back.to)}>
              <svg viewBox="0 0 20 16" aria-hidden><path d="M8 2 2 8l6 6M2 8h16" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span>{back.label}</span>
            </button>
          </div>
        )}
      </header>

      {open && createPortal(
        <div className="nav-sheet" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="nav-sheet-head">
            <Logo height={24} />
            <button className="nav-sheet-close" onClick={() => setOpen(false)} aria-label="Close menu">
              <svg viewBox="0 0 20 20" aria-hidden><path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>
            </button>
          </div>

          <p className="nav-sheet-eyebrow">
            Where would you like to go?
            <Sparkle className="nav-sheet-sp" size={16} color="var(--red)" />
          </p>

          <nav className="nav-sheet-in">
            {SHEET.map((l, i) => (
              <Link
                key={l.to}
                to={l.to}
                className="nav-sheet-link"
                data-active={loc.pathname === l.to ? '' : undefined}
                style={{ ['--i' as string]: String(i) }}
                onClick={(e) => {
                  if (l.to === '/photo' && !user) {
                    e.preventDefault()
                    setOpen(false)
                    openAuthModal({
                      title: 'First — what’s your name?',
                      subtitle: 'It goes on your card so your teacher knows who it’s from.',
                      redirectTo: '/photo',
                      onSuccess: () => {
                        nav('/photo')
                      },
                    })
                  }
                }}
              >
                <span className="nav-sheet-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="nav-sheet-label">
                  {l.label}
                  <Underline className="nav-sheet-ul" width={200} />
                </span>
                <svg className="nav-sheet-go" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path d="M4 10h11M10.6 5.6 15 10l-4.4 4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ))}

            {user && (
              <Link
                to={`/u/${user.username}`}
                className="nav-sheet-link"
                style={{ ['--i' as string]: '6' }}
              >
                <span className="nav-sheet-num">07</span>
                <span className="nav-sheet-label">
                  My Profile (@{user.username})
                  <Underline className="nav-sheet-ul" width={200} />
                </span>
                <svg className="nav-sheet-go" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path d="M4 10h11M10.6 5.6 15 10l-4.4 4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )}
          </nav>

          {/* Auth section in drawer */}
          <div className="nav-sheet-auth">
            {user ? (
              <div className="nav-sheet-user-card">
                <div className="nav-sheet-user-info">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="nav-sheet-user-av" />
                  ) : (
                    <span className="nav-sheet-user-init">{user.displayName.charAt(0)}</span>
                  )}
                  <div>
                    <strong>{user.displayName}</strong>
                    <span>@{user.username}</span>
                  </div>
                </div>
                <button type="button" onClick={() => { signOut(); setOpen(false) }} className="nav-sheet-signout">
                  Change name
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setOpen(false); openAuthModal() }}
                className="nav-sheet-signin-btn"
              >
                Add your name
              </button>
            )}
          </div>

          <p className="nav-sheet-foot">
            Made with <HeartDoodle size={15} className="nav-sheet-foot-heart" /> by μlearn ASI
          </p>
        </div>,
        document.body,
      )}
    </>
  )
}
