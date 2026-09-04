import './misc.css'
/** Torn-paper edge used between page bands. */
export function TornEdge({ fill = 'var(--paper-warm)', flip = false, height = 46, className = '' }:
  { fill?: string; flip?: boolean; height?: number; className?: string }) {
  return (
    <svg
      className={`torn ${className}`}
      viewBox="0 0 1440 60"
      preserveAspectRatio="none"
      style={{ height, transform: flip ? 'scaleY(-1)' : undefined }}
      aria-hidden
    >
      <path
        d="M0 34c38-9 62 4 96 1s54-16 90-13 58 15 92 12 52-15 88-13 60 14 96 12 54-14 90-12 58 15 94 12 52-14 88-12 60 14 96 11 54-13 90-11 58 14 94 11 52-13 88-11 44 8 72 6 46-6 66-9 58 15 98 14 54-15 102-13V60H0Z"
        fill={fill}
      />
      <path
        d="M0 34c38-9 62 4 96 1s54-16 90-13 58 15 92 12 52-15 88-13 60 14 96 12 54-14 90-12 58 15 94 12 52-14 88-12 60 14 96 11 54-13 90-11 58 14 94 11 52-13 88-11 44 8 72 6 46-6 66-9 58 15 98 14 54-15 102-13"
        fill="none" stroke="rgba(120,92,62,.16)" strokeWidth="1.4"
      />
    </svg>
  )
}

/** A torn scrap of note paper with a hand-written line of copy. */
export function NoteScrap({ children, className = '', rotate = -2, clip = false, width }:
  { children: React.ReactNode; className?: string; rotate?: number; clip?: boolean; width?: number | string }) {
  return (
    <div className={`scrap ${className}`} style={{ transform: `rotate(${rotate}deg)`, width }}>
      {clip && (
        <svg className="scrap-clip" viewBox="0 0 24 46" fill="none" aria-hidden>
          <path d="M17.5 12.5v20.8c0 4.4-2.6 7.2-6.2 7.2S5 37.7 5 33.3V10.6C5 7.5 6.9 5.4 9.5 5.4s4.4 2.1 4.4 5.2v21.7c0 1.8-.9 3-2.4 3s-2.4-1.2-2.4-3V13.4"
            stroke="#9aa2ad" strokeWidth="2.1" strokeLinecap="round" />
        </svg>
      )}
      <div className="scrap-in">{children}</div>
    </div>
  )
}
