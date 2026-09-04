import type { ReactNode } from 'react'

export const ToolIcons = {
  card: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.2" y="2.6" width="12" height="16" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.8 5.4h12a2.2 2.2 0 0 1 2.2 2.2v11.6a2.2 2.2 0 0 1-2.2 2.2H8.8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" opacity=".45" />
      <path d="M6 9.4h6.4M6 12.6h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  text: (
    <svg viewBox="0 0 26 22" fill="none" aria-hidden>
      <text x="0" y="18" fontFamily="Playfair Display, serif" fontSize="20" fontWeight="600" fill="currentColor">T</text>
      <text x="13" y="18" fontFamily="Playfair Display, serif" fontSize="15" fontWeight="600" fill="currentColor">t</text>
    </svg>
  ),
  handwrite: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19.6 5 15.5 16.4 4.1a2.3 2.3 0 0 1 3.3 3.3L8.3 18.8 4 19.6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14.6 6.2 17.9 9.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  decorate: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2.6 14.9 9l7 .5-5.3 4.6 1.6 6.9L12 17.4 5.8 21l1.6-6.9L2.1 9.5 9.1 9 12 2.6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  stickers: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.2 14.2c1.2 1.8 6.4 1.8 7.6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="9" cy="9.6" r="1.15" fill="currentColor" /><circle cx="15" cy="9.6" r="1.15" fill="currentColor" />
    </svg>
  ),
  colors: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 2.6a9.4 9.4 0 0 1 0 18.8" fill="currentColor" opacity=".22" />
      <path d="M2.6 12h18.8" stroke="currentColor" strokeWidth="1.2" opacity=".5" />
    </svg>
  ),
  photo: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2.6" y="4.4" width="18.8" height="15.2" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.6" cy="9.6" r="1.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.4 16.6 9 11.8l4.6 4 3-2.4 4 3.6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
} satisfies Record<string, ReactNode>

export function AaIcon({ small }: { small?: boolean }) {
  return (
    <svg viewBox="0 0 22 18" fill="none" aria-hidden>
      <path d="M2 15.4 6.6 3.2h1.4l4.6 12.2M3.9 11.4h6.9" stroke="currentColor" strokeWidth={small ? 1.5 : 1.7} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.6 8.6v6.8M19.6 10.8a3.2 3.2 0 1 0 0 3.2" stroke="currentColor" strokeWidth={small ? 1.5 : 1.7} strokeLinecap="round" />
    </svg>
  )
}

export function AlignIcon({ v }: { v: 'left' | 'center' | 'right' | 'justify' }) {
  const rows: Record<string, string> = {
    left: 'M2 3h16M2 7.6h10M2 12.2h16M2 16.8h10',
    center: 'M2 3h16M5 7.6h10M2 12.2h16M5 16.8h10',
    right: 'M2 3h16M8 7.6h10M2 12.2h16M8 16.8h10',
    justify: 'M2 3h16M2 7.6h16M2 12.2h16M2 16.8h16',
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d={rows[v]} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function SizeIcon() {
  return (
    <svg viewBox="0 0 22 18" fill="none" aria-hidden>
      <path d="M1.6 15.4 6 3.6h1.3l4.4 11.8M3.4 11.6h6.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.6 4v8M14.2 7.2h6.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function MoveIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M10 2v16M2 10h16M10 2 7.4 4.8M10 2l2.6 2.8M10 18l-2.6-2.8M10 18l2.6-2.8M2 10l2.8-2.6M2 10l2.8 2.6M18 10l-2.8-2.6M18 10l-2.8 2.6"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3.4 5.4h13.2M8 2.6h4M5.6 5.4l.8 11a1.4 1.4 0 0 0 1.4 1.3h4.4a1.4 1.4 0 0 0 1.4-1.3l.8-11M8.4 8.4v6M11.6 8.4v6"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DotsIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <circle cx="4" cy="10" r="1.7" fill="currentColor" /><circle cx="10" cy="10" r="1.7" fill="currentColor" /><circle cx="16" cy="10" r="1.7" fill="currentColor" />
    </svg>
  )
}
