/* Hand-drawn accents used throughout the interface chrome. */
import type { CSSProperties } from 'react'

type P = { className?: string; style?: CSSProperties; color?: string; size?: number }

export function HeartDoodle({ className, style, color = 'var(--red)', size = 22 }: P) {
  return (
    <svg className={className} style={style} width={size} height={size * 0.92} viewBox="0 0 24 22" fill="none" aria-hidden>
      <path d="M12 20.2C10.4 18.6 3.4 13.4 2.2 9.3 1.2 5.9 3.3 2.6 6.4 2.3c2.4-.2 4.4 1.4 5.5 3.5C13 3.7 14.9 2 17.3 2.1c3.2.1 5.2 3.5 4.3 6.9-1.1 4.2-8 9.5-9.6 11.2Z"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function HeartSolid({ className, style, color = 'var(--red)', size = 18 }: P) {
  return (
    <svg className={className} style={style} width={size} height={size * 0.9} viewBox="0 0 24 22" aria-hidden>
      <path d="M12 20.6C9.9 18.6 2.6 13.2 1.7 8.7.9 4.9 3.5 1.7 6.9 1.9c2.3.1 4.1 1.6 5.1 3.4 1-1.8 2.8-3.3 5.1-3.4 3.4-.2 6 3 5.2 6.8-.9 4.5-8.2 9.9-10.3 11.9Z" fill={color} />
    </svg>
  )
}

export function StarDoodle({ className, style, color = 'var(--ink)', size = 26 }: P) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path d="M14 2.4 17.2 11l8.6.3-6.7 5.6 2.4 8.6L14 20.6 6.5 25.5l2.4-8.6L2.2 11.3 10.8 11 14 2.4Z"
        stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M4.8 8.2 23 19.4M23.4 8.4 5 19.6" stroke={color} strokeWidth=".9" opacity=".55" />
    </svg>
  )
}

export function Sparkle({ className, style, color = 'var(--ink)', size = 18 }: P) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M10 1.5c.6 4.4 3.3 7.2 8 8-4.7.8-7.4 3.6-8 8-.6-4.4-3.3-7.2-8-8 4.7-.8 7.4-3.6 8-8Z" fill={color} />
    </svg>
  )
}

/** the small hand-drawn tick cluster seen in the page corners */
export function TickCluster({ className, style, color = 'var(--ink)', size = 30 }: P) {
  return (
    <svg className={className} style={style} width={size} height={size * 0.6} viewBox="0 0 30 18" fill="none" aria-hidden>
      <path d="M3 4 L7 9 M1.5 10 L7 9 M6 14.5 L7 9" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12.5 14 L17 3.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M22 4 L26 9 M20.5 10 L26 9 M25 14.5 L26 9" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

/** three short radiating strokes — the "excited" mark next to headings */
export function Burst({ className, style, color = 'var(--red)', size = 26 }: P) {
  return (
    <svg className={className} style={style} width={size} height={size * 0.85} viewBox="0 0 26 22" fill="none" aria-hidden>
      <path d="M3.2 3.4 8.4 7.2M2.6 11.2h6.6M4.8 19 9 14.4" stroke={color} strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  )
}

/** hand-drawn underline used beneath emphasised words */
export function Underline({ className, style, color = 'var(--red)', width = 180 }: P & { width?: number }) {
  return (
    <svg className={className} style={style} width={width} height="10" viewBox="0 0 180 10" fill="none" preserveAspectRatio="none" aria-hidden>
      <path d="M2 6.4C28 3.2 63 1.9 96 2.6c28 .6 55 2.4 82 4.6" stroke={color} strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  )
}

export function CurvedArrow({ className, style, color = 'var(--red)', size = 60 }: P) {
  return (
    <svg className={className} style={style} width={size} height={size * 0.55} viewBox="0 0 60 33" fill="none" aria-hidden>
      <path d="M2 24C10 9 30 2.5 50 8.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M40.5 4.5 51 8.8l-4.6 8.4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Squiggle({ className, style, color = 'var(--gold)', width = 90 }: P & { width?: number }) {
  return (
    <svg className={className} style={style} width={width} height="14" viewBox="0 0 90 14" fill="none" aria-hidden>
      <path d="M2 8c6-8 12 8 18 0s12 8 18 0 12 8 18 0 12 8 18 0" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function SmileyDoodle({ className, style, color = 'var(--ink)', size = 18 }: P) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="8.2" stroke={color} strokeWidth="1.3" />
      <path d="M6.6 11.6c1 1.6 5.8 1.6 6.8 0" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7.3" cy="8" r=".95" fill={color} /><circle cx="12.7" cy="8" r=".95" fill={color} />
    </svg>
  )
}

export function Paperclip({ className, style, color = '#9aa2ad', size = 40 }: P) {
  return (
    <svg className={className} style={style} width={size} height={size * 1.9} viewBox="0 0 24 46" fill="none" aria-hidden>
      <path d="M17.5 12.5v20.8c0 4.4-2.6 7.2-6.2 7.2S5 37.7 5 33.3V10.6C5 7.5 6.9 5.4 9.5 5.4s4.4 2.1 4.4 5.2v21.7c0 1.8-.9 3-2.4 3s-2.4-1.2-2.4-3V13.4"
        stroke={color} strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  )
}
