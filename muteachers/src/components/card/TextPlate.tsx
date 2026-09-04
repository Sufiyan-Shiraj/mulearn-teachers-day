import type { TextElement } from '../../lib/types'

/** the paper / tape backing drawn behind a text block */
export function TextPlate({ kind }: { kind: NonNullable<TextElement['plate']> }) {
  if (kind === 'none') return null

  if (kind === 'torn')
    return (
      <svg className="c-plate" viewBox="0 0 400 140" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="cp-torn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#faf3e6" /><stop offset=".55" stopColor="#f4e9d6" /><stop offset="1" stopColor="#e9dcc5" />
          </linearGradient>
          <filter id="cp-rough"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" /></filter>
        </defs>
        <path filter="url(#cp-rough)"
          d="M2 10 26 5l24 6 25-7 26 6 25-8 26 7 25-6 26 8 25-6 26 7 25-5 26 6 25-7 24 5 22-4 2 122-24 5-24-6-25 7-26-6-25 8-26-7-25 6-26-8-25 6-26-7-25 5-26-6-25 7-24-5-22 4Z"
          fill="url(#cp-torn)" />
        <path d="M16 24h368M16 116h368" stroke="#c9b48c" strokeOpacity=".55" strokeWidth="1.1" strokeDasharray="7 6" />
      </svg>
    )

  if (kind === 'tape')
    return (
      <svg className="c-plate" viewBox="0 0 400 110" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="cp-tape" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f7efdf" /><stop offset="1" stopColor="#ece0c8" />
          </linearGradient>
        </defs>
        <path d="M0 10 400 0v96L0 110Z" fill="url(#cp-tape)" />
        <path d="M0 10 400 0v96L0 110Z" fill="none" stroke="#000" strokeOpacity=".07" />
      </svg>
    )

  if (kind === 'line')
    return (
      <svg className="c-plate c-plate--line" viewBox="0 0 400 110" preserveAspectRatio="none" aria-hidden>
        <path d="M6 104h388" stroke="currentColor" strokeOpacity=".45" strokeWidth="2" strokeDasharray="9 7" />
      </svg>
    )

  /* paper */
  return (
    <svg className="c-plate" viewBox="0 0 400 140" preserveAspectRatio="none" aria-hidden>
      <rect x="2" y="2" width="396" height="136" rx="4" fill="#fbf6ea" />
      <rect x="2" y="2" width="396" height="136" rx="4" fill="none" stroke="#d8c9a8" strokeOpacity=".7" />
    </svg>
  )
}
