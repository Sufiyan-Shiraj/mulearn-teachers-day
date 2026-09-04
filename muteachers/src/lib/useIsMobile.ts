import { useEffect, useState } from 'react'

/** matches the editor's own breakpoint, so JS and CSS agree on what "mobile" is */
const QUERY = '(max-width: 860px)'

/**
 * Whether the compact layout is in force.
 *
 * The editor has two ways of showing the same panels — a sidebar on a wide
 * screen and a bottom sheet on a narrow one — and the toolbar has to open the
 * right one. Hiding the wrong one in CSS is not enough: a sheet that is
 * display:none is still a dialog in the accessibility tree.
 */
export function useIsMobile() {
  const [is, setIs] = useState(
    () => typeof matchMedia === 'function' && matchMedia(QUERY).matches,
  )

  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const mq = matchMedia(QUERY)
    const on = () => setIs(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  return is
}
