import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AuthModal } from './components/auth/AuthModal'
import { Preloader } from './components/shell/Preloader'

import Landing from './routes/Landing'

const PickCard = lazy(() => import('./routes/PickCard'))
const AddPhoto = lazy(() => import('./routes/AddPhoto'))
const Editor = lazy(() => import('./routes/Editor'))
const Preview = lazy(() => import('./routes/Preview'))
const Share = lazy(() => import('./routes/Share'))
const Receive = lazy(() => import('./routes/Receive'))
const MyCards = lazy(() => import('./routes/MyCards'))
const Leaderboards = lazy(() => import('./routes/Leaderboards'))
const UserProfile = lazy(() => import('./routes/UserProfile'))
const HowItWorks = lazy(() => import('./routes/HowItWorks'))
const About = lazy(() => import('./routes/About'))
/* internal QA surfaces — dev only */
const Gallery = lazy(() => import('./routes/_Gallery'))
const CardDebug = lazy(() => import('./routes/_Card'))

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

/** re-keys on navigation so each screen plays its entrance */
function Transition({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  return <div className="route" key={pathname}>{children}</div>
}

export function App() {
  const [showPreloader, setShowPreloader] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('mulearn_intro_seen')
    }
    return false
  })

  useEffect(() => {
    const handleReplay = () => setShowPreloader(true)
    window.addEventListener('mulearn_replay_preloader', handleReplay)
    return () => window.removeEventListener('mulearn_replay_preloader', handleReplay)
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="paper-grain" aria-hidden />
        <ScrollTop />
        {showPreloader && (
          <Preloader
            onComplete={() => {
              try { sessionStorage.setItem('mulearn_intro_seen', 'true') } catch {}
              setShowPreloader(false)
            }}
          />
        )}
        <AuthModal />
        <Suspense fallback={<div className="boot" aria-hidden />}>
          <Transition>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/pick" element={<PickCard />} />
              <Route path="/photo" element={<AddPhoto />} />
              <Route path="/create" element={<Editor />} />
              <Route path="/preview" element={<Preview />} />
              <Route path="/share" element={<Share />} />
              <Route path="/c" element={<Receive />} />
              <Route path="/c/:id" element={<Receive />} />
              <Route path="/my-cards" element={<MyCards />} />
              <Route path="/leaderboards" element={<Leaderboards />} />
              <Route path="/u/:username" element={<UserProfile />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/about" element={<About />} />
              {import.meta.env.DEV && <Route path="/_gallery" element={<Gallery />} />}
              {import.meta.env.DEV && <Route path="/_card" element={<CardDebug />} />}
              <Route path="*" element={<Landing />} />
            </Routes>
          </Transition>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
