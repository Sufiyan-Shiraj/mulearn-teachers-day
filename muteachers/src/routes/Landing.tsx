import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { useHeroParallax } from '../lib/useHeroParallax'
import './landing.css'

export default function Landing() {
  const [tag, setTag] = useState('all')
  const nav = useNavigate()
  const { user, openAuthModal } = useAuth()
  const startCard = useCard(s => s.startCard)
  const rail = useRef<HTMLDivElement>(null)
  const page = useReveal<HTMLDivElement>()
  const userPhoto = useCard(s => s.doc.photo)
  const demoPhoto = userPhoto ?? '/WhatsApp Image 2026-09-04 at 20.28.30.jpeg'

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
              Go get a
              <Burst className="ld-eyebrow-burst" size={28} />
            </p>
            <h1 className="ld-h1">
              <span className="ld-h1-a">SELFIE WITH</span>
              <span className="ld-h1-b">YOUR TEACHER</span>
            </h1>
            <p className="ld-script">
              the ones who got you here
              <Underline className="ld-script-ul" width={250} />
              <HeartDoodle className="ld-script-heart" size={21} />
            </p>
            <p className="ld-lede">
              Catch them between classes. Frame it, name them,<br />and it&rsquo;s on your story in one tap.
            </p>
            <div className="ld-cta">
              <ButtonLink
                to="/photo"
                variant="dark"
                size="lg"
                icon={<SparkIcon />}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault()
                    openAuthModal({
                      title: 'First — what’s your name?',
                      subtitle: 'It goes on your posts and on the board.',
                      redirectTo: '/photo',
                      onSuccess: () => {
                        startCard(TEMPLATES[0].id)
                        nav('/photo')
                      },
                    })
                    return
                  }
                  startCard(TEMPLATES[0].id)
                }}
              >
                Take a selfie with your teacher
              </ButtonLink>
              <ButtonLink to="/leaderboards" variant="outline" size="lg" trailing={<ChevronPill />}>
                See who&rsquo;s ahead
              </ButtonLink>
            </div>
          </div>

          <HeroCollage />
        </div>

        <div className="ld-tick-wrap" aria-hidden>
          <TickCluster className="ld-tick-1 m-drift" size={26} color="var(--muted-2)" />
        </div>
        <TornEdge className="ld-tear" fill="var(--paper-warm)" height={52} />
      </section>

      {/* ---------------- picker strip ---------------- */}
      <section className="ld-picks reveal">
        <div className="shell">
          <div className="ld-picks-head reveal">
            <h2 className="ld-picks-title">
              Pick a frame, then go find them
              <Burst className="ld-picks-burst" size={20} />
            </h2>
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
                        title: 'First — what’s your name?',
                        subtitle: 'It goes on your selfies and on the leaderboard.',
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
                    <CardCanvas doc={{ ...newDoc(t.id), photo: demoPhoto }} template={t} mode="thumb" />
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
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

/* ------------------------------------------------------------------ */

function HeroCollage() {
  /* depth per plane; CSS turns these into the actual offsets */
  const ref = useHeroParallax<HTMLDivElement>()

  return (
    <div ref={ref} className="ld-collage" aria-hidden>
      {/* Background paper strip & grid */}
      <div className="ld-cl-strip ld-plane" style={{ ['--d' as string]: '.22', ['--r' as string]: '1.5deg' }} />
      <div className="ld-cl-grid ld-plane" style={{ ['--d' as string]: '.22', ['--r' as string]: '-2deg' }}>
        <Decoration deco="grid-patch" />
      </div>

      {/* A phone held out at arm's length, mid-selfie — the same chrome the
          camera screen actually shows, previewing the selfie action. */}
      <div className="ld-cl-phone ld-plane" style={{ ['--d' as string]: '.55', ['--r' as string]: '-4deg' }}>
        <div className="ld-cl-screen">
          <img
            src="/WhatsApp Image 2026-09-04 at 20.28.30.jpeg"
            onError={(e) => { e.currentTarget.src = '/WhatsApp Image 2026-09-04 at 20.28.30.jpeg' }}
            alt="Selfie with teacher"
            draggable={false}
          />
          <span className="ld-cl-chip">
            <svg viewBox="0 0 20 18" aria-hidden fill="none">
              <rect x="1.4" y="4.2" width="17.2" height="12.4" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="10" cy="10.4" r="3.4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6.6 4.2 8 1.6h4l1.4 2.6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            Front Camera
          </span>
          <span className="ld-cl-shutter" aria-hidden><span /></span>
        </div>
        <span className="ld-cl-flash" aria-hidden />
      </div>

      {/* Foreground handwritten torn note */}
      <div className="ld-cl-note ld-plane" style={{ ['--d' as string]: '.92', ['--r' as string]: '-1.6deg' }}>
        got one with<br />
        <span>Ms Sharika!</span>
        <HeartDoodle className="ld-cl-note-heart" size={16} />
      </div>

      {/* Airborne floating stickers & doodles at varying floating depths */}
      <div className="ld-cl-star-gold ld-plane m-drift" style={{ ['--d' as string]: '1.35', ['--r' as string]: '16deg' }}>
        <Decoration deco="star-gold" />
      </div>
      <div className="ld-cl-star-silver ld-plane m-drift" style={{ ['--d' as string]: '1.6', ['--r' as string]: '-14deg' }}>
        <Decoration deco="star-silver" />
      </div>
      <div className="ld-cl-heart ld-plane m-float" style={{ ['--d' as string]: '1.85', ['--r' as string]: '6deg' }}>
        <Decoration deco="heart-red" />
      </div>
      <div className="ld-cl-daisy ld-plane m-drift" style={{ ['--d' as string]: '1.35', ['--r' as string]: '-10deg' }}>
        <Decoration deco="daisy" />
      </div>
      <div className="ld-cl-b1 ld-plane" style={{ ['--d' as string]: '1.6' }}>
        <Burst size={22} color="var(--red)" />
      </div>
    </div>
  )
}
