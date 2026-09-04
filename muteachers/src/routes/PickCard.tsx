import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../components/shell/TopNav'
import { TabBar } from '../components/shell/TabBar'
import { SiteFooter } from '../components/shell/SiteFooter'
import { Chip, ChipRow } from '../components/ui/Chip'
import { Burst, HeartDoodle, Sparkle, StarDoodle, TickCluster } from '../components/art/Doodles'
import { CardCanvas } from '../components/card/CardCanvas'
import { TAGS, TEMPLATES } from '../lib/templates'
import { newDoc, useCard } from '../lib/store'
import { useAuth } from '../context/AuthContext'
import { useReveal } from '../lib/useReveal'
import { motion } from 'framer-motion'
import { usePointerParallax } from '../lib/useParallax'
import './pick.css'

const FAV_KEY = 'mut.favs'

export default function PickCard() {
  const [tag, setTag] = useState('all')
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]') } catch { return [] }
  })
  const nav = useNavigate()
  const { user, openAuthModal } = useAuth()
  const startCard = useCard(s => s.startCard)
  const current = useCard(s => s.doc.templateId)
  const userPhoto = useCard(s => s.doc.photo)
  const demoPhoto = userPhoto ?? '/demo-photo.jpg'
  const [picked, setPicked] = useState<string | null>(null)
  const page = useReveal<HTMLDivElement>([tag])

  useEffect(() => { localStorage.setItem(FAV_KEY, JSON.stringify(favs)) }, [favs])

  const shown = TEMPLATES.filter(t => tag === 'all' || t.tags.includes(tag as never))

  const choose = (id: string) => {
    if (!user) {
      openAuthModal({
        mode: 'signup',
        title: 'Sign In to Start Designing',
        subtitle: 'Sign in or sign up to customize this card and save it to your profile ✨',
        redirectTo: '/photo',
        onSuccess: () => {
          setPicked(id)
          startCard(id)
          setTimeout(() => nav('/photo'), 300)
        },
      })
      return
    }
    setPicked(id)
    startCard(id)
    setTimeout(() => nav('/photo'), 340)
  }

  const { containerRef: headRef, getPlaneTransform, isSupported } = usePointerParallax({
      maxOffset: 16,
      maxRotation: 0,
      damping: 24,
      stiffness: 120,
    })

    const starLPlane = getPlaneTransform(0.85)
    const starRPlane = getPlaneTransform(1.25)
    const spPlane = getPlaneTransform(1.55)
    const tickPlane = getPlaneTransform(0.9)

    return (
      <div className="page pk" ref={page}>
        <TopNav back={{ to: '/', label: 'Back to Home' }} />

        <main className="shell pk-main">
          <header className="pk-head" ref={headRef}>
            <p className="pk-eyebrow">
              Pick your card
              <Burst className="pk-eyebrow-burst" size={20} />
            </p>
            <h1 className="pk-title">
              choose a style you <em>love</em>
              <HeartDoodle className="pk-title-heart" size={26} />
            </h1>
            <p className="pk-sub">
              Each design is fully customizable. Add your photo, your words, your heart.
              <HeartDoodle className="pk-sub-heart" size={16} />
            </p>
            <motion.div style={isSupported ? { x: starLPlane.x, y: starLPlane.y } : undefined} className="pk-star-l" aria-hidden>
              <StarDoodle size={26} color="var(--ink-soft)" />
            </motion.div>
            <motion.div style={isSupported ? { x: spPlane.x, y: spPlane.y } : undefined} className="pk-sp-1" aria-hidden>
              <Sparkle size={16} color="var(--ink-soft)" />
            </motion.div>
            <motion.div style={isSupported ? { x: starRPlane.x, y: starRPlane.y } : undefined} className="pk-star-r" aria-hidden>
              <StarDoodle size={30} color="var(--ink-soft)" />
            </motion.div>
            <motion.div style={isSupported ? { x: tickPlane.x, y: tickPlane.y } : undefined} className="pk-tick" aria-hidden>
              <TickCluster size={28} color="var(--ink-soft)" />
            </motion.div>
          </header>

          <ChipRow className="pk-chips">
            {TAGS.map(t => <Chip key={t.key} active={tag === t.key} onClick={() => setTag(t.key)}>{t.label}</Chip>)}
          </ChipRow>

          <ul className="pk-grid stagger" key={tag}>
            {shown.map(t => (
              <li key={t.id} className="pk-cell">
                <button
                  className="pk-card"
                  data-picked={picked === t.id ? '' : undefined}
                  data-current={current === t.id && !picked ? '' : undefined}
                  data-align={t.thumbAlign ?? 'center'}
                  onClick={() => choose(t.id)}
                  aria-label={`Choose the ${t.name} card`}
                >
                  <span className="pk-card-crop">
                    <CardCanvas doc={{ ...newDoc(t.id), photo: demoPhoto }} template={t} face="front" mode="thumb" />
                  </span>
                  {t.isNew && <span className="pk-new">New</span>}
                  <span className="pk-pickline">Use this card</span>
                </button>
                <button
                  className="pk-fav"
                  data-on={favs.includes(t.id) ? '' : undefined}
                  aria-label={favs.includes(t.id) ? `Remove ${t.name} from favourites` : `Save ${t.name} to favourites`}
                  aria-pressed={favs.includes(t.id)}
                  onClick={() => setFavs(f => f.includes(t.id) ? f.filter(x => x !== t.id) : [...f, t.id])}
                >
                  <svg viewBox="0 0 24 22" aria-hidden>
                    <path d="M12 20.2C10.2 18.5 3.2 13.3 3.2 8.6 3.2 5.7 5.5 3.5 8.2 3.5c1.9 0 3.2 1 3.8 2.2.6-1.2 1.9-2.2 3.8-2.2 2.7 0 5 2.2 5 5.1 0 4.7-7 9.9-8.8 11.6Z"
                      stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
                  </svg>
                </button>
                <span className="pk-name">{t.name}</span>
              </li>
            ))}
          </ul>
        </main>

        <SiteFooter />
        <TabBar />
      </div>
    )
  }