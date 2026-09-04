import { useEffect, useState } from 'react'

export interface HeaderState { hidden: boolean; scrolled: boolean }

/**
 * Header behaviour: sits in the flow at the top of a page, lifts away once
 * you start reading downward, and comes straight back the moment you scroll
 * up. Small movements are ignored so it never flickers.
 */
export function useScrollHeader(revealAt = 90): HeaderState {
  const [state, setState] = useState<HeaderState>({ hidden: false, scrolled: false })

  useEffect(() => {
    let last = window.scrollY
    let ticking = false

    const read = () => {
      ticking = false
      const y = window.scrollY
      const delta = y - last
      if (Math.abs(delta) < 6) return
      const atTop = y < revealAt
      last = y
      setState(prev => {
        const hidden = atTop ? false : delta > 0
        const scrolled = y > 12
        return prev.hidden === hidden && prev.scrolled === scrolled ? prev : { hidden, scrolled }
      })
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(read)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [revealAt])

  return state
}
