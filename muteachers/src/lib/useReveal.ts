import { useEffect, useRef } from 'react'

/**
 * Adds `.is-in` to every `.reveal` inside the container as it scrolls
 * into view, with a small stagger between siblings. One observer per
 * screen rather than one per element.
 */
export function useReveal<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const items = [...root.querySelectorAll<HTMLElement>('.reveal')]
    if (!items.length) return

    if (typeof IntersectionObserver === 'undefined'
      || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach(n => n.classList.add('is-in'))
      return
    }

    const seen = new WeakSet<HTMLElement>()
    const io = new IntersectionObserver(entries => {
      const arriving = entries.filter(e => e.isIntersecting).map(e => e.target as HTMLElement)
      arriving.forEach((n, i) => {
        if (seen.has(n)) return
        seen.add(n)
        if (!n.style.getPropertyValue('--d')) n.style.setProperty('--d', `${i * 70}ms`)
        n.classList.add('is-in')
        io.unobserve(n)
      })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })

    items.forEach(n => io.observe(n))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}

/** Smoothly bring a node into view, respecting reduced motion. */
export function scrollIntoView(node: Element | null, block: ScrollLogicalPosition = 'center') {
  if (!node) return
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  node.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block })
}
