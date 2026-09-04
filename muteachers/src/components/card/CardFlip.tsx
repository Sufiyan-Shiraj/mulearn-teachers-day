import { useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { CardDoc, Template } from '../../lib/types'
import { CardCanvas } from './CardCanvas'
import './flip.css'

interface Props {
  doc: CardDoc
  template: Template
  flipped: boolean
  onFlip?: (next: boolean) => void
  /** swipe / click anywhere on the card toggles the flip */
  interactive?: boolean
  mode?: 'view' | 'thumb'
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

export function CardFlip({ doc, template, flipped, onFlip, interactive = true, mode = 'view', className, style, children }: Props) {
  const start = useRef<{ x: number; y: number; t: number } | null>(null)
  const [drag, setDrag] = useState(0)

  return (
    <div
      className={`f-stage ${className ?? ''}`}
      style={style}
      onPointerDown={e => {
        if (!interactive) return
        start.current = { x: e.clientX, y: e.clientY, t: Date.now() }
      }}
      onPointerMove={e => {
        if (!interactive || !start.current) return
        const dx = e.clientX - start.current.x
        if (Math.abs(dx) > 6) setDrag(Math.max(-1, Math.min(1, dx / 260)))
      }}
      onPointerUp={e => {
        if (!interactive || !start.current) return
        const dx = e.clientX - start.current.x
        const dy = e.clientY - start.current.y
        const quick = Date.now() - start.current.t < 500
        start.current = null
        setDrag(0)
        if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy)) { onFlip?.(!flipped); return }
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6 && quick) onFlip?.(!flipped)
      }}
      onPointerCancel={() => { start.current = null; setDrag(0) }}
      onKeyDown={e => {
        if (!interactive) return
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onFlip?.(!flipped) }
      }}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? (flipped ? 'Show the front of the card' : 'Open the card') : undefined}
    >
      <div className="f-persp">
        <div
          className="f-inner"
          style={{
            transform: `rotateY(${(flipped ? 180 : 0) + drag * 22}deg)`,
            transition: drag ? 'none' : 'transform .78s cubic-bezier(.36,.72,.24,1)',
          }}
        >
          <div className="f-face f-face--front" aria-hidden={flipped}>
            <CardCanvas doc={doc} template={template} face="front" mode={mode} />
          </div>
          <div className="f-face f-face--back" aria-hidden={!flipped}>
            <CardCanvas doc={doc} template={template} face="back" mode={mode} />
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
