import type { PhotoElement } from '../../lib/types'
import { clampPan } from '../../lib/image'
import { Decoration } from '../art/Decorations'

interface Props { el: PhotoElement; src?: string; mode: 'view' | 'edit' | 'thumb' }

export function PhotoFrame({ el, src, mode }: Props) {
  /* clamped on the way out as well as on the way in: a card saved before the
     limits existed, or one whose zoom was pulled back after panning, must
     still cover its window rather than showing a strip of bare card */
  const ox = clampPan(el.ox, el.zoom)
  const oy = clampPan(el.oy, el.zoom)

  const img = src ? (
    <img
      className="c-photo-img"
      src={src}
      alt=""
      draggable={false}
      style={{
        transform: `scale(${el.zoom}) translate(${ox}%, ${oy}%)`,
      }}
    />
  ) : (
    <div className="c-photo-empty">
      <svg viewBox="0 0 44 40" width="calc(var(--u) * 84)" height="calc(var(--u) * 76)" fill="none" aria-hidden>
        <rect x="1.6" y="6" width="40.8" height="32" rx="6" stroke="currentColor" strokeWidth="2.2" strokeDasharray="5 4" />
        <circle cx="22" cy="22" r="8" stroke="currentColor" strokeWidth="2.2" />
        <path d="M15 6.5 17.6 2h8.8L29 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
      {mode !== 'thumb' && <span className="c-photo-empty-label">Your photo</span>}
    </div>
  )

  const inner = <div className="c-photo-window">{img}</div>

  if (el.frame === 'slot') return <div className="c-photo c-photo--slot">{inner}</div>
  if (el.frame === 'arch-slot') return <div className="c-photo c-photo--arch-slot">{inner}</div>

  if (el.frame === 'circle')
    return <div className="c-photo c-photo--circle">{inner}</div>

  if (el.frame === 'arch')
    return (
      <div className="c-photo c-photo--arch">
        {inner}
        {el.tape && el.tape !== 'none' && <Tape kind={el.tape} />}
      </div>
    )

  if (el.frame === 'plain')
    return (
      <div className="c-photo c-photo--plain">
        {inner}
        {el.tape && el.tape !== 'none' && <Tape kind={el.tape} />}
      </div>
    )

  if (el.frame === 'torn')
    return (
      <div className="c-photo c-photo--torn">
        {inner}
        {el.tape && el.tape !== 'none' && <Tape kind={el.tape} />}
      </div>
    )

  /* polaroid */
  return (
    <div className="c-photo c-photo--polaroid">
      <div className="c-photo-paper">
        {inner}
        {el.caption && <div className="c-photo-caption">{el.caption}</div>}
      </div>
      {el.tape && el.tape !== 'none' && <Tape kind={el.tape} />}
    </div>
  )
}

function Tape({ kind }: { kind: NonNullable<PhotoElement['tape']> }) {
  const deco = kind === 'dots' ? 'tape-dots' : kind === 'kraft' ? 'tape-kraft' : kind === 'red' ? 'tape-red' : 'tape-washi'
  return (
    <div className={`c-photo-tape c-photo-tape--${kind}`}>
      <Decoration deco={deco} />
    </div>
  )
}
