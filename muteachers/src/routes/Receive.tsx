import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { CardCanvas } from '../components/card/CardCanvas'
import { HeartDoodle, Sparkle } from '../components/art/Doodles'
import { Decoration } from '../components/art/Decorations'
import { Logo } from '../components/shell/Logo'
import { getTemplate } from '../lib/templates'
import { decodeCard, fetchCard } from '../lib/share'
import { fetchCardFromDb, likeCardInDb } from '../lib/storage'
import type { CardDoc } from '../lib/types'
import { motion } from 'framer-motion'
import { usePointerParallax } from '../lib/useParallax'
import './receive.css'

export default function Receive() {
  const [doc, setDoc] = useState<CardDoc | null>(null)
  const [creator, setCreator] = useState<{ name: string; username: string; avatarUrl?: string } | undefined>()
  const [likes, setLikes] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [state, setState] = useState<'loading' | 'ready' | 'bad'>('loading')

  const { id } = useParams()

  useEffect(() => {
    let live = true
    const load = async () => {
      const slug = id || ''
      // 1. Try hash token for instant render without network wait
      const token = location.hash.slice(1)
      if (token) {
        const d = await decodeCard(token)
        if (d && live) {
          setDoc(d)
          setState('ready')
          // Asynchronously enrich with DB likes and creator
          if (slug) {
            fetchCardFromDb(slug).then(rec => {
              if (rec && live) {
                if (rec.creator) setCreator(rec.creator)
                if (typeof rec.likeCount === 'number') setLikes(rec.likeCount)
              }
            }).catch(() => {})
          }
          return
        }
      }

      // 2. Try Supabase
      if (slug) {
        const record = await fetchCardFromDb(slug)
        if (record && live) {
          setDoc(record.doc)
          setCreator(record.creator)
          setLikes(record.likeCount)
          setState('ready')
          return
        }
      }

      // 3. Try legacy / local companion server
      if (slug) {
        const legacyDoc = await fetchCard(slug)
        if (legacyDoc && live) {
          setDoc(legacyDoc)
          setState('ready')
          return
        }
      }

      if (live) setState('bad')
    }

    load()
    return () => { live = false }
  }, [id])

  const handleLike = async () => {
    if (hasLiked || !doc) return
    setHasLiked(true)
    setLikes(l => l + 1)

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#e11d48', '#ff6b6b', '#f43f5e', '#f59e0b', '#d97706'],
      })
    } catch {
      // particle fallback
    }

    await likeCardInDb(doc.id)
  }

  const { containerRef, tiltX, tiltY, getPlaneTransform, isSupported } = usePointerParallax({
    maxOffset: 22,
    maxRotation: 5,
    damping: 24,
    stiffness: 125,
  })

  const sky1 = getPlaneTransform(0.7)
  const sky2 = getPlaneTransform(1.1)
  const sky3 = getPlaneTransform(1.4)
  const skySp1 = getPlaneTransform(1.7)
  const skySp2 = getPlaneTransform(1.3)

  const tpl = useMemo(() => (doc ? getTemplate(doc.templateId) : null), [doc])

  if (state === 'loading') return <div className="rc rc--wait"><span className="rc-spin" /></div>

  if (state === 'bad' || !doc || !tpl) {
    return (
      <div className="rc rc--wait">
        <div className="rc-empty">
          <HeartDoodle size={40} />
          <h1>This link looks incomplete</h1>
          <p>Ask for the link again — the whole selfie travels inside it, so it has to be copied in full.</p>
          <Link className="rc-cta" to="/">Make your own card</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rc" ref={containerRef}>
      <div className="rc-sky" aria-hidden>
        <motion.span className="rc-h1" style={isSupported ? { x: sky1.x, y: sky1.y } : undefined}><Decoration deco="heart-red" /></motion.span>
        <motion.span className="rc-h2" style={isSupported ? { x: sky2.x, y: sky2.y } : undefined}><Decoration deco="star-gold" /></motion.span>
        <motion.span className="rc-h3" style={isSupported ? { x: sky3.x, y: sky3.y } : undefined}><Decoration deco="daisy" /></motion.span>
        <motion.div className="rc-sp1" style={isSupported ? { x: skySp1.x, y: skySp1.y } : undefined}><Sparkle size={20} color="var(--gold)" /></motion.div>
        <motion.div className="rc-sp2" style={isSupported ? { x: skySp2.x, y: skySp2.y } : undefined}><Sparkle size={14} color="var(--red)" /></motion.div>
      </div>

      <header className="rc-head">
        <p className="rc-kicker">
          {creator ? (
            <span>
              Made by <Link to={`/u/${creator.username}`} className="rc-creator-link"><strong>{creator.name}</strong> (@{creator.username})</Link>
            </span>
          ) : doc.from ? (
            `${doc.from} made this for you`
          ) : (
            'Someone made this for you'
          )}
          <HeartDoodle size={17} className="rc-kicker-heart" />
        </p>
        {doc.to && <h1 className="rc-to">{doc.to}</h1>}
      </header>

      <main className="rc-stage" data-opened="">
        <motion.div
          className="rc-card-tilt"
          style={isSupported ? { rotateX: tiltX, rotateY: tiltY } : undefined}
        >
          <CardCanvas
            doc={doc} template={tpl} face="front" mode="view"
            className="rc-card"
            style={{ ['--card-ar' as string]: String(tpl.aspect) }}
          />
        </motion.div>

        <div className="rc-actions-row">

          {/* Heart / Like appreciation button */}
          <button
            type="button"
            className={`rc-like-btn ${hasLiked ? 'is-liked' : ''}`}
            onClick={handleLike}
            title="Send appreciation"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill={hasLiked ? 'currentColor' : 'none'}>
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            <span>{likes}</span>
          </button>
        </div>
      </main>

      <footer className="rc-foot">
        <Link to="/" className="rc-make">
          Make one of your own
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden>
            <path d="M3 10h13M11.5 5.2 16.4 10l-4.9 4.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <Logo height={18} />
      </footer>
    </div>
  )
}
