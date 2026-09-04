import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './tabbar.css'

interface Item {
  to: string
  label: string
  icon: React.ReactNode
  accent?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function TabBar() {
  const { pathname } = useLocation()
  const nav = useNavigate()
  const { user, openAuthModal } = useAuth()

  const items: Item[] = [
    { to: '/', label: 'Home', icon: <HomeIcon /> },
    {
      to: '/photo',
      label: 'Create',
      icon: <PlusIcon />,
      accent: true,
      onClick: (e) => {
        if (!user) {
          e.preventDefault()
          openAuthModal({
                        title: 'First — what’s your name?',
            subtitle: 'Sign in or sign up to personalize, save, and share your card ✨',
            redirectTo: '/photo',
            onSuccess: () => {
              nav('/photo')
            },
          })
        }
      },
    },
    { to: '/my-cards', label: 'My Cards', icon: <HeartIcon /> },
    { to: '/leaderboards', label: 'Boards', icon: <TrophyIcon /> },
    {
      to: user?.username ? `/u/${user.username}` : '#auth',
      label: user ? 'Profile' : 'Your name',
      icon: <UserIcon />,
      onClick: (e) => {
        if (!user) {
          e.preventDefault()
          openAuthModal({
            title: 'What’s your name?',
            subtitle: 'Sign in to access your cards and creator profile ✨',
          })
        }
      },
    },
  ]

  /* the indicator slides to whichever item owns the current route */
  let active = items.findIndex(i => i.to === pathname)
  if (active < 0) active = items.findIndex(i => i.to !== '/' && !i.to.startsWith('#') && pathname.startsWith(i.to))

  return (
    <>
      <div className="tb-spacer" aria-hidden />
      <nav className="tb" aria-label="App sections">
        <div className="tb-dock" style={{ ['--n' as string]: items.length, ['--i' as string]: Math.max(active, 0) }}>
          {active >= 0 && <span className="tb-pill" aria-hidden />}
          <ul className="tb-list">
            {items.map((i, idx) => (
              <li key={i.label}>
                <NavLink
                  to={i.to}
                  className="tb-item"
                  end={i.to === '/'}
                  data-accent={i.accent ? '' : undefined}
                  data-on={idx === active ? '' : undefined}
                  onClick={i.onClick}
                >
                  <span className="tb-icon">{i.icon}</span>
                  <span className="tb-label">{i.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  )
}

function HomeIcon() { return <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 10.6 12 4l8 6.6V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg> }
function PlusIcon() { return <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 5.2v13.6M5.2 12h13.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg> }
function HeartIcon() { return <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 20.4C10 18.6 3.6 13.6 3.6 9.1 3.6 6.3 5.8 4.2 8.4 4.2c1.8 0 3.1 1 3.6 2.1.5-1.1 1.8-2.1 3.6-2.1 2.6 0 4.8 2.1 4.8 4.9 0 4.5-6.4 9.5-8.4 11.3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg> }
function TrophyIcon() { return <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M7 4h10v5a5 5 0 0 1-10 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M7 5.5H4.6V7a3 3 0 0 0 2.6 3M17 5.5h2.4V7a3 3 0 0 1-2.6 3M12 14v3.4M8.4 20.4h7.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> }
function UserIcon() { return <svg viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="8" r="4.2" stroke="currentColor" strokeWidth="1.6" /><path d="M4.5 19.5c0-3.3 3.4-5.5 7.5-5.5s7.5 2.2 7.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg> }
