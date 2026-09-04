import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AuthModal } from './components/auth/AuthModal'

import Landing from './routes/Landing'

/* The intro plays once a session and is the heaviest thing in the app — it is
   the only reason framer-motion was in the first chunk. Splitting it out means
   every navigation after the intro never touches that code again. */
const Preloader = lazy(() => import('./components/shell/Preloader').then(m => ({ default: m.Preloader })))

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

/**
 * Pull the rest of the flow in while the browser is idle.
 *
 * Every step is a separate chunk, so without this the first tap on "Next"
 * waits on a network round trip — which is exactly where the app felt slow.
 * By the time anyone has framed a photo, the editor is already parsed.
 */
function usePrefetchFlow() {
  useEffect(() => {
    const pull = () => {
      import('./routes/AddPhoto')
      import('./routes/Editor')
      import('./routes/Preview')
      import('./routes/Share')
    }
    const idle = (window as unknown as {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number
    }).requestIdleCallback
    if (idle) { const id = idle(pull, { timeout: 2500 }); return () => cancelIdleCallback?.(id) }
    const t = setTimeout(pull, 1200)
    return () => clearTimeout(t)
  }, [])
}

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
  usePrefetchFlow()
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
          <Suspense fallback={null}><Preloader
            onComplete={() => {
              try { sessionStorage.setItem('mulearn_intro_seen', 'true') } catch {}
              setShowPreloader(false)
            }}
          /></Suspense>
        )}
        <AuthModal />
        <Suspense fallback={<div className="boot" aria-hidden />}>
          <Transition>
            <Routes>
              <Route path="/" element={<Landing />} />
              {/* picking a card is no longer a step — every template can be
                  swapped inside the editor, so old links land on the camera */}
              <Route path="/pick" element={<Navigate to="/photo" replace />} />
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
