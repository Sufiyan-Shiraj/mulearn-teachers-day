import { useEffect, useRef } from 'react'
import { motionValue, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'

export interface PointerParallaxOptions {
  /** Maximum pixel translation for depth 1.0 (default: 24) */
  maxOffset?: number
  /** Maximum rotation degrees in 3D (default: 7) */
  maxRotation?: number
  /** Damping factor for spring physics (default: 22) */
  damping?: number
  /** Stiffness for spring physics (default: 130) */
  stiffness?: number
  /** Mass for spring physics (default: 0.6) */
  mass?: number
}

/**
 * Whether pointer-driven motion is worth running at all.
 *
 * Read once, outside React: a phone is not going to grow a mouse mid-session,
 * and this decides whether springs get created — not just whether their output
 * is used. The old version built the springs either way, so every phone paid
 * for a framer-motion animation loop that could never move anything.
 */
const canParallax = (() => {
  if (typeof window === 'undefined' || typeof matchMedia !== 'function') return false
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  return matchMedia('(pointer: fine)').matches
})()

export function usePointerParallax(options: PointerParallaxOptions = {}) {
  const {
    maxOffset = 24,
    maxRotation = 7,
    damping = 22,
    stiffness = 130,
    mass = 0.6,
  } = options

  const containerRef = useRef<HTMLDivElement | null>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const smoothX = useSpring(rawX, { damping, stiffness, mass })
  const smoothY = useSpring(rawY, { damping, stiffness, mass })

  useEffect(() => {
    if (!canParallax) return
    const node = containerRef.current
    if (!node) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect()
      const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
      const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
      rawX.set(Math.max(-1.3, Math.min(1.3, nx)))
      rawY.set(Math.max(-1.3, Math.min(1.3, ny)))
    }
    const handleMouseLeave = () => { rawX.set(0); rawY.set(0) }

    node.addEventListener('mousemove', handleMouseMove, { passive: true })
    node.addEventListener('mouseleave', handleMouseLeave, { passive: true })
    return () => {
      node.removeEventListener('mousemove', handleMouseMove)
      node.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [rawX, rawY])

  /**
   * Callers ask for a plane per depth during render, so this cannot call a
   * hook — `useTransform` here would change the hook order the moment a
   * caller asked for a different number of planes. Each derived value is
   * built once and cached by its factor instead, so re-rendering does not
   * pile up another subscription on the source every time.
   */
  const derived = useRef(new Map<string, MotionValue<number>>())
  const derive = (source: MotionValue<number>, factor: number, axis: 'x' | 'y') => {
    const id = `${axis}:${factor}`
    const cache = derived.current
    let out = cache.get(id)
    if (!out) {
      const made = motionValue(source.get() * factor)
      source.on('change', v => made.set(v * factor))
      cache.set(id, made)
      out = made
    }
    return out
  }

  const getPlaneTransform = (depth: number) => ({
    x: derive(smoothX, maxOffset * depth, 'x'),
    y: derive(smoothY, maxOffset * depth, 'y'),
  })

  const tiltX = derive(smoothY, -maxRotation, 'x')
  const tiltY = derive(smoothX, maxRotation, 'y')

  return { containerRef, smoothX, smoothY, tiltX, tiltY, getPlaneTransform, isSupported: canParallax }
}

export function useScrollParallax(speed = 40, targetRef?: React.RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll(
    targetRef
      ? { target: targetRef, offset: ['start end', 'end start'] }
      : undefined,
  )

  /* a spring per parallax layer re-running on every scroll frame is the
     single most expensive thing on a phone, and the effect is invisible
     there anyway — so on touch it resolves to a flat zero */
  const y = useTransform(scrollYProgress, [0, 1], canParallax ? [-speed, speed] : [0, 0])
  const smoothY = useSpring(y, { stiffness: 100, damping: 25, mass: 0.5 })

  return smoothY
}
