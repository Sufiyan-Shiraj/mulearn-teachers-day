import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from './Logo'
import { Decoration } from '../art/Decorations'
import { HeartDoodle, Sparkle, Burst, StarDoodle } from '../art/Doodles'
import { TornEdge } from '../ui/Torn'
import './preloader.css'

interface PreloaderProps {
  onComplete?: () => void
}

const CAPTIONS = [
  { at: 0, text: 'Selecting cotton cardstock…' },
  { at: 28, text: 'Applying patterned washi tape…' },
  { at: 58, text: 'Inking heartfelt appreciation…' },
  { at: 86, text: 'Sealing with love ✨' },
]

export function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0)
  const [isDone, setIsDone] = useState(false)
  const [caption, setCaption] = useState(CAPTIONS[0].text)

  useEffect(() => {
    let start: number | null = null
    const duration = 2400 // 2.4 seconds for a luxurious editorial feel
    let frameId: number

    const tick = (timestamp: number) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const rawProgress = Math.min(100, Math.floor((elapsed / duration) * 100))

      setProgress(rawProgress)

      // Update caption according to progress
      for (let i = CAPTIONS.length - 1; i >= 0; i--) {
        if (rawProgress >= CAPTIONS[i].at) {
          setCaption(CAPTIONS[i].text)
          break
        }
      }

      if (elapsed < duration) {
        frameId = requestAnimationFrame(tick)
      } else {
        setProgress(100)
        setTimeout(() => {
          setIsDone(true)
          setTimeout(() => {
            onComplete?.()
          }, 650)
        }, 320)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [onComplete])

  const handleSkip = () => {
    setIsDone(true)
    setTimeout(() => {
      onComplete?.()
    }, 300)
  }

  // Heart stroke offset: from 260 down to 0 as progress goes from 25 to 75
  const strokeOffset = Math.max(0, Math.min(260, 260 - ((progress - 20) / 60) * 260))

  return (
    <AnimatePresence>
      {!isDone ? (
        <div className="preloader-root" role="status" aria-label="Loading stationery studio">
          {/* Top Half Curtain */}
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: '-105%' }}
            transition={{ duration: 0.62, ease: [0.76, 0, 0.24, 1] }}
            className="preloader-curtain preloader-curtain--top"
          >
            <TornEdge className="preloader-tear-top" fill="var(--paper-warm)" height={28} />
          </motion.div>

          {/* Bottom Half Curtain */}
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: '105%' }}
            transition={{ duration: 0.62, ease: [0.76, 0, 0.24, 1] }}
            className="preloader-curtain preloader-curtain--bottom"
          >
            <TornEdge className="preloader-tear-bottom" fill="var(--paper-warm)" height={28} />
          </motion.div>

          {/* Floating Ambient Doodles on Desk */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.85, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.4 }}
            className="preloader-doodle-1 m-drift"
          >
            <StarDoodle size={36} color="var(--muted-2)" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.85, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="preloader-doodle-2 m-float"
          >
            <Sparkle size={32} color="var(--gold)" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.85, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="preloader-doodle-3 m-drift"
          >
            <Burst size={28} color="var(--red)" />
          </motion.div>

          {/* Central Scrapbook Card on Desk */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -20 }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            className="preloader-stage"
          >
            <div className="preloader-card">
              {/* Corner Washi Tapes */}
              <motion.span
                initial={{ opacity: 0, rotate: -35, scale: 0.8 }}
                animate={{ opacity: 1, rotate: -22, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="preloader-tape-left"
                aria-hidden
              >
                <Decoration deco="tape-dots" />
              </motion.span>

              <motion.span
                initial={{ opacity: 0, rotate: 40, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 26, scale: 1 }}
                transition={{ delay: 0.28, duration: 0.3 }}
                className="preloader-tape-right"
                aria-hidden
              >
                <Decoration deco="tape-kraft" />
              </motion.span>

              {/* Logo */}
              <div className="preloader-logo-wrap">
                <Logo height={32} />
              </div>

              {/* Inked Heart Doodle drawing itself */}
              <div className="preloader-heart-wrap">
                <svg className="preloader-heart-svg" viewBox="0 0 72 64" fill="none" aria-hidden>
                  <path
                    className="preloader-heart-path"
                    d="M36 56 C14 42 4 28 4 17 C4 7 12 2 21 2 C28 2 33 6 36 11 C39 6 44 2 51 2 C60 2 68 7 68 17 C68 28 58 42 36 56 Z"
                    stroke="var(--red, #861f21)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ strokeDashoffset: strokeOffset }}
                  />
                </svg>
                {progress > 60 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                    style={{ position: 'absolute', top: -6, right: -12 }}
                  >
                    <Sparkle size={20} color="var(--gold)" />
                  </motion.span>
                )}
              </div>

              {/* Handwritten Script */}
              <p className="preloader-script">
                to the ones who <em>inspire us</em>
              </p>

              {/* Vintage Postal Stamp & Counter */}
              <div className="preloader-stamp-box">
                <motion.div
                  className="preloader-stamp-ring"
                  animate={{ rotate: progress >= 80 ? -4 : 0 }}
                  transition={{ type: 'spring', damping: 15 }}
                >
                  <span className="preloader-stamp-counter">
                    {String(progress).padStart(2, '0')}%
                  </span>
                  <div className="preloader-stamp-brand">
                    <img
                      src="/logo.svg"
                      alt="μlearn ASI"
                      className="preloader-stamp-logo"
                      draggable={false}
                    />
                    <span className="preloader-stamp-year">• 2026</span>
                  </div>
                </motion.div>
              </div>

              {/* Cycling Status Caption */}
              <motion.p
                key={caption}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="preloader-caption"
              >
                <HeartDoodle size={15} color="var(--red)" />
                <span>{caption}</span>
              </motion.p>
            </div>
          </motion.div>

          {/* Quick Skip Button */}
          <button
            type="button"
            className="preloader-skip-btn"
            onClick={handleSkip}
            aria-label="Skip intro sequence"
          >
            Skip Intro ✕
          </button>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
