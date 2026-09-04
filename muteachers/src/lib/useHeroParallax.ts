import { useEffect, useRef } from 'react'

/**
 * Pointer and scroll parallax for the hero, written as CSS custom properties.
 *
 * This used to be framer-motion springs — one motion value per plane, each
 * driving an inline style through React. That pulled the whole animation
 * engine into the first chunk and ran a scroll listener on phones, where the
 * effect is switched off anyway.
 *
 * Here the listeners only ever attach on a device with a real pointer, they
 * write two numbers onto one element, and the transforms are done by CSS on
 * the compositor. Nothing re-renders, and on a phone nothing is attached at
 * all.
 */
const canParallax = (() => {
  if (typeof window === 'undefined' || typeof matchMedia !== 'function') return false
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  return matchMedia('(pointer: fine)').matches
})()

export function useHeroParallax<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!canParallax || !node) return

    let frame = 0
    let px = 0, py = 0, sy = 0
    /* one write per frame, however many events arrive in between */
    const flush = () => {
      frame = 0
      node.style.setProperty('--px', px.toFixed(3))
      node.style.setProperty('--py', py.toFixed(3))
      node.style.setProperty('--sy', sy.toFixed(1))
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(flush) }

    const onMove = (e: PointerEvent) => {
      const r = node.getBoundingClientRect()
      px = Math.max(-1.3, Math.min(1.3, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)))
      py = Math.max(-1.3, Math.min(1.3, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)))
      schedule()
    }
    const onLeave = () => { px = 0; py = 0; schedule() }
    const onScroll = () => {
      /* how far the hero has travelled up the screen, roughly -1..1 */
      const r = node.getBoundingClientRect()
      sy = Math.max(-1, Math.min(1, -r.top / Math.max(1, window.innerHeight))) * 34
      schedule()
    }

    onScroll()
    node.addEventListener('pointermove', onMove, { passive: true })
    node.addEventListener('pointerleave', onLeave, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return ref
}
