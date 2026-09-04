import { useEffect, useRef, useState } from 'react'
import { useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion'

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

export function usePointerParallax(options: PointerParallaxOptions = {}) {
  const {
    maxOffset = 24,
    maxRotation = 7,
    damping = 22,
    stiffness = 130,
    mass = 0.6,
  } = options

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isSupported, setIsSupported] = useState(true)

  // Normalized motion values from -1 to 1
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  // Smooth springs for buttery physical motion
  const smoothX = useSpring(rawX, { damping, stiffness, mass })
  const smoothY = useSpring(rawY, { damping, stiffness, mass })

  useEffect(() => {
    // Check reduced motion preference or coarse pointer (touch)
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouchOnly = window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches

    if (prefersReduced || isTouchOnly) {
      setIsSupported(false)
      return
    }

    const node = containerRef.current
    if (!node) {
      // Viewport-wide fallback listener
      const handleWindowMove = (e: MouseEvent) => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1
        const ny = (e.clientY / window.innerHeight) * 2 - 1
        rawX.set(Math.max(-1, Math.min(1, nx)))
        rawY.set(Math.max(-1, Math.min(1, ny)))
      }

      window.addEventListener('mousemove', handleWindowMove, { passive: true })
      return () => window.removeEventListener('mousemove', handleWindowMove)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect()
      // Center coordinate of the container
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Normalized distance from center (-1 to 1)
      const nx = (e.clientX - centerX) / (rect.width / 2)
      const ny = (e.clientY - centerY) / (rect.height / 2)

      // Clamped to avoid runaway offsets if pointer is far away
      rawX.set(Math.max(-1.3, Math.min(1.3, nx)))
      rawY.set(Math.max(-1.3, Math.min(1.3, ny)))
    }

    const handleMouseLeave = () => {
      // Gently return to rest state
      rawX.set(0)
      rawY.set(0)
    }

    node.addEventListener('mousemove', handleMouseMove, { passive: true })
    node.addEventListener('mouseleave', handleMouseLeave, { passive: true })

    return () => {
      node.removeEventListener('mousemove', handleMouseMove)
      node.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [rawX, rawY])

  /**
   * Derive translated X and Y motion values scaled by depth factor
   */
  const getPlaneTransform = (depth: number) => {
    const x = useTransform(smoothX, v => (isSupported ? v * maxOffset * depth : 0))
    const y = useTransform(smoothY, v => (isSupported ? v * maxOffset * depth : 0))
    return { x, y }
  }

  /**
   * Derive 3D tilt angles (rotateX, rotateY)
   */
  const tiltX = useTransform(smoothY, v => (isSupported ? -v * maxRotation : 0))
  const tiltY = useTransform(smoothX, v => (isSupported ? v * maxRotation : 0))

  return {
    containerRef,
    smoothX,
    smoothY,
    tiltX,
    tiltY,
    getPlaneTransform,
    isSupported,
  }
}

/**
 * Hook for scroll-driven vertical parallax offset
 */
export function useScrollParallax(speed = 40, targetRef?: React.RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll(
    targetRef
      ? { target: targetRef, offset: ['start end', 'end start'] }
      : undefined,
  )

  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsSupported(false)
    }
  }, [])

  const y = useTransform(scrollYProgress, [0, 1], isSupported ? [-speed, speed] : [0, 0])
  const smoothY = useSpring(y, { stiffness: 100, damping: 25, mass: 0.5 })

  return smoothY
}
