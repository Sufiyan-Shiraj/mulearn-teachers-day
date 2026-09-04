import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TopNav } from '../components/shell/TopNav'
import { ButtonLink, ChevronPill, SparkIcon } from '../components/ui/Button'
import { Chip, ChipRow } from '../components/ui/Chip'
import { TornEdge } from '../components/ui/Torn'
import { Burst, HeartDoodle, TickCluster, Underline } from '../components/art/Doodles'
import { Decoration } from '../components/art/Decorations'
import { TEMPLATES, TAGS } from '../lib/templates'
import { CardCanvas } from '../components/card/CardCanvas'
import { useCard, newDoc } from '../lib/store'
import { useAuth } from '../context/AuthContext'
import { SiteFooter } from '../components/shell/SiteFooter'
import { useReveal } from '../lib/useReveal'
import { motion } from 'framer-motion'
import { usePointerParallax, useScrollParallax } from '../lib/useParallax'
import './landing.css'

export default function Landing() {
  const [tag, setTag] = useState('all')
  const nav = useNavigate()
  const { user, openAuthModal } = useAuth()
  const startCard = useCard(s => s.startCard)
  const rail = useRef<HTMLDivElement>(null)
  const page = useReveal<HTMLDivElement>()
  const userPhoto = useCard(s => s.doc.photo)
  const demoPhoto = userPhoto ?? '/demo-photo.jpg'
  const collageScrollY = useScrollParallax(34)
  const tickScrollY = useScrollParallax(-22)

  const shown = TEMPLATES.filter(t => tag === 'all' || t.tags.includes(tag as never))

  const scrollRail = (dir: 1 | -1) => {
    const n = rail.current
    if (!n) return
    n.scrollBy({ left: dir * Math.min(n.clientWidth * 0.8, 520), behavior: 'smooth' })
  }

  return (
    <div className="page" ref={page}>
      <TopNav />

      {/* ---------------- hero ---------------- */}
      <section className="ld-hero">
        <div className="shell ld-hero-in">
          <div className="ld-copy">
            <p className="ld-eyebrow">
              Make a
              <Burst className="ld-eyebrow-burst" size={28} />
            </p>
            <h1 className="ld-h1">
              <span className="ld-h1-a">TEACHER&rsquo;S</span>
              <span className="ld-h1-b">DAY CARD</span>
            </h1>
            <p className="ld-script">
              they&rsquo;ll always remember
              <Underline className="ld-script-ul" width={230} />
              <HeartDoodle className="ld-script-heart" size={21} />
            </p>
            <p className="ld-lede">
              Create a beautiful card with your photo,<br />your words, and your heart.
            </p>
            <div className="ld-cta">
              <ButtonLink
                to="/pick"
                variant="dark"
                size="lg"
                icon={<SparkIcon />}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault()
                    openAuthModal({
                      mode: 'signup',
                      title: 'Sign In to Create a Card',
                      subtitle: 'Sign in or sign up to personalize, save, and share your card ✨',
                      redirectTo: '/pick',
                      onSuccess: () => {
                        startCard(TEMPLATES[0].id)
                        nav('/pick')
                      },
                    })
                    return
                  }
                  startCard(TEMPLATES[0].id)
                }}
              >
                Create a Card
              </ButtonLink>
              <ButtonLink to="/how-it-works" variant="outline" size="lg" trailing={<ChevronPill />}>
                See How It Works
              </ButtonLink>
            </div>
          </div>

          <HeroCollage scrollY={collageScrollY} />
        </div>

        <motion.div style={{ y: tickScrollY }} className="ld-tick-wrap" aria-hidden>
          <TickCluster className="ld-tick-1 m-drift" size={26} color="var(--muted-2)" />
        </motion.div>
        <TornEdge className="ld-tear" fill="var(--paper-warm)" height={52} />
      </section>

      {/* ---------------- picker strip ---------------- */}
      <section className="ld-picks reveal">
        <div className="shell">
          <div className="ld-picks-head reveal">
            <h2 className="ld-picks-title">
              Pick a card that feels you
              <Burst className="ld-picks-burst" size={20} />
            </h2>
            <Link to="/pick" className="ld-viewall">
              View all templates
              <span className="ld-viewall-chev">
                <svg viewBox="0 0 12 12" aria-hidden><path d="M4.4 2.4 8 6l-3.6 3.6" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </Link>
          </div>
        </div>

        <div className="ld-rail-wrap">
          <button className="ld-rail-btn ld-rail-btn--prev" onClick={() => scrollRail(-1)} aria-label="Previous templates">
            <svg viewBox="0 0 14 14" aria-hidden><path d="M9 2 4 7l5 5" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className="ld-rail" ref={rail}>
            <div className="ld-rail-in stagger">
              {shown.map(t => (
                <button
                  key={t.id}
                  className="ld-tile"
                  onClick={() => {
                    if (!user) {
                      openAuthModal({
                        mode: 'signup',
                        title: 'Sign In to Start Designing',
                        subtitle: 'Sign in or sign up to customize this card and save it to your profile ✨',
                        redirectTo: '/photo',
                        onSuccess: () => {
                          startCard(t.id)
                          nav('/photo')
                        },
                      })
                      return
                    }
                    startCard(t.id)
                    nav('/photo')
                  }}
                  aria-label={`Use the ${t.name} template`}
                >
                  <span className="ld-tile-crop" data-align={t.thumbAlign ?? 'center'}>
                    <CardCanvas doc={{ ...newDoc(t.id), photo: demoPhoto }} template={t} face="front" mode="thumb" />
                  </span>
                  <span className="ld-tile-name">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="ld-rail-veil" aria-hidden />
          <button className="ld-rail-btn ld-rail-btn--next" onClick={() => scrollRail(1)} aria-label="More templates">
            <svg viewBox="0 0 14 14" aria-hidden><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>

        <div className="shell">
          <ChipRow className="ld-chips">
            {TAGS.map(t => (
              <Chip key={t.key} active={tag === t.key} onClick={() => setTag(t.key)}>{t.label}</Chip>
            ))}
          </ChipRow>
          <Link to="/pick" className="ld-viewall-mobile">
            View all templates
            <span className="ld-viewall-chev">
              <svg viewBox="0 0 12 12" aria-hidden><path d="M4.4 2.4 8 6l-3.6 3.6" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

/* ------------------------------------------------------------------ */

function HeroCollage({ scrollY }: { scrollY?: any }) {
  const { containerRef, tiltX, tiltY, getPlaneTransform, isSupported } = usePointerParallax({
    maxOffset: 24,
    maxRotation: 5.5,
    damping: 24,
    stiffness: 135,
  })

  // Planes by depth
  const backPlane = getPlaneTransform(0.22)
  const midPlane = getPlaneTransform(0.55)
  const forePlane = getPlaneTransform(0.92)
  const airPlane1 = getPlaneTransform(1.35)
  const airPlane2 = getPlaneTransform(1.6)
  const airPlane3 = getPlaneTransform(1.85)

  return (
    <motion.div
      ref={containerRef}
      className="ld-collage"
      style={isSupported ? { rotateX: tiltX, rotateY: tiltY, y: scrollY } : { y: scrollY }}
      aria-hidden
    >
      {/* Background paper strip & grid */}
      <motion.div
        className="ld-cl-strip"
        style={isSupported ? { x: backPlane.x, y: backPlane.y, rotate: 1.5 } : undefined}
      />
      <motion.div
        className="ld-cl-grid"
        style={isSupported ? { x: backPlane.x, y: backPlane.y, rotate: -2 } : undefined}
      >
        <Decoration deco="grid-patch" />
      </motion.div>

      {/* Midground Polaroid frame & washi tape */}
      <motion.div
        className="ld-cl-frame"
        style={isSupported ? { x: midPlane.x, y: midPlane.y, rotate: -1.2 } : undefined}
      >
        <div className="ld-cl-photo">
          <img src="/demo-photo.jpg" alt="" draggable={false} />
        </div>
        <div className="ld-cl-tape"><Decoration deco="tape-dots" /></div>
      </motion.div>

      {/* Foreground handwritten torn note */}
      <motion.div
        className="ld-cl-note"
        style={isSupported ? { x: forePlane.x, y: forePlane.y, rotate: -1.6 } : undefined}
      >
        Thank you for<br />
        <span>inspiring us every day!</span>
        <HeartDoodle className="ld-cl-note-heart" size={16} />
      </motion.div>

      {/* Airborne floating stickers & doodles at varying floating depths */}
      <motion.div
        className="ld-cl-star-gold m-drift"
        style={isSupported ? { x: airPlane1.x, y: airPlane1.y, rotate: 16 } : undefined}
      >
        <Decoration deco="star-gold" />
      </motion.div>
      <motion.div
        className="ld-cl-star-silver m-drift"
        style={isSupported ? { x: airPlane2.x, y: airPlane2.y, rotate: -14 } : undefined}
      >
        <Decoration deco="star-silver" />
      </motion.div>
      <motion.div
        className="ld-cl-heart m-float"
        style={isSupported ? { x: airPlane3.x, y: airPlane3.y, rotate: 6 } : undefined}
      >
        <Decoration deco="heart-red" />
      </motion.div>
      <motion.div
        className="ld-cl-daisy m-drift"
        style={isSupported ? { x: airPlane1.x, y: airPlane1.y, rotate: -10 } : undefined}
      >
        <Decoration deco="daisy" />
      </motion.div>
      <motion.div
        className="ld-cl-b1"
        style={isSupported ? { x: airPlane2.x, y: airPlane2.y } : undefined}
      >
        <Burst size={22} color="var(--red)" />
      </motion.div>
    </motion.div>
  )
}
