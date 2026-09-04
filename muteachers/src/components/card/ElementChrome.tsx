import { useRef } from 'react'
import type { PointerEvent as RPointerEvent } from 'react'
import type { CardElement } from '../../lib/types'
import { clampBox } from '../../lib/types'
import { useCard } from '../../lib/store'

interface Props {
  el: CardElement
  active: boolean
  onActivate: () => void
  onEnter: () => void
}

interface Drag {
  mode: 'move' | 'resize' | 'rotate'
  startX: number; startY: number
  boxW: number; boxH: number
  ox: number; oy: number; ow: number; oh: number; osize: number; orot: number
  cx: number; cy: number
  startAngle: number
  startDist: number
  moved: boolean
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/** an element may overflow the card, but not so far that it is unmanageable */
const MAX_SIZE = 140

export function ElementChrome({ el, active, onActivate, onEnter }: Props) {
  const update = useCard(s => s.update)
  const beginChange = useCard(s => s.beginChange)
  const remove = useCard(s => s.remove)
  const bringForward = useCard(s => s.bringForward)
  const editing = useCard(s => s.editingId === el.id)
  const drag = useRef<Drag | null>(null)
  const pinch = useRef<Map<number, { x: number; y: number }>>(new Map())
  const pinchStart = useRef<{ dist: number; angle: number; w: number; size: number; rot: number } | null>(null)

  const cardRect = (node: HTMLElement) => {
    const card = node.closest('.c-card') as HTMLElement
    return card.getBoundingClientRect()
  }

  const begin = (e: RPointerEvent, mode: Drag['mode']) => {
    const node = e.currentTarget as HTMLElement
    const wrap = node.closest('.c-el') as HTMLElement
    const r = cardRect(node)
    const wr = wrap.getBoundingClientRect()
    drag.current = {
      mode,
      startX: e.clientX, startY: e.clientY,
      boxW: r.width, boxH: r.height,
      ox: el.box.x, oy: el.box.y, ow: el.box.w, oh: el.box.h,
      osize: el.kind === 'text' ? el.size : 0,
      orot: el.rot,
      cx: wr.left + wr.width / 2, cy: wr.top + wr.height / 2,
      startAngle: Math.atan2(e.clientY - (wr.top + wr.height / 2), e.clientX - (wr.left + wr.width / 2)),
      startDist: Math.hypot(e.clientX - (wr.left + wr.width / 2), e.clientY - (wr.top + wr.height / 2)),
      moved: false,
    }
    beginChange()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onMove = (e: RPointerEvent) => {
    /* two-finger pinch → scale + rotate */
    if (pinch.current.has(e.pointerId)) {
      pinch.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pinch.current.size === 2) {
        const [a, b] = [...pinch.current.values()]
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        const ang = Math.atan2(a.y - b.y, a.x - b.x) * 180 / Math.PI
        if (!pinchStart.current) {
          beginChange()
          pinchStart.current = { dist, angle: ang, w: el.box.w, size: el.kind === 'text' ? el.size : 0, rot: el.rot }
        } else {
          const p = pinchStart.current
          const k = clamp(dist / (p.dist || 1), 0.25, 5)
          const patch: Record<string, unknown> = {
            box: clampBox({ ...el.box, w: clamp(p.w * k, 4, MAX_SIZE), h: el.kind === 'text' ? el.box.h : clamp(el.box.h * k, 2, MAX_SIZE) }),
            rot: p.rot + (ang - p.angle),
          }
          if (el.kind === 'text') patch.size = clamp(p.size * k, 8, 220)
          update(el.id, patch as Partial<CardElement>, { history: false })
        }
        return
      }
    }

    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (!d.moved && Math.hypot(dx, dy) < 4) return
    d.moved = true

    if (d.mode === 'move') {
      update(el.id, {
        box: clampBox({
          ...el.box,
          x: d.ox + (dx / d.boxW) * 100,
          y: d.oy + (dy / d.boxH) * 100,
        }),
      } as Partial<CardElement>, { history: false })
      return
    }

    if (d.mode === 'rotate') {
      const a = Math.atan2(e.clientY - d.cy, e.clientX - d.cx)
      let deg = d.orot + (a - d.startAngle) * 180 / Math.PI
      const snap = Math.round(deg / 15) * 15
      if (Math.abs(deg - snap) < 3.5) deg = snap
      update(el.id, { rot: Math.round(deg * 10) / 10 } as Partial<CardElement>, { history: false })
      return
    }

    /* resize — scale from the element centre using pointer distance */
    const dist = Math.hypot(e.clientX - d.cx, e.clientY - d.cy)
    const k = clamp(dist / (d.startDist || 1), 0.2, 6)
    const patch: Record<string, unknown> = {
      box: clampBox({
        x: d.ox - (d.ow * (k - 1)) / 2,
        y: el.kind === 'text' ? d.oy : d.oy - (d.oh * (k - 1)) / 2,
        w: clamp(d.ow * k, 4, MAX_SIZE),
        h: el.kind === 'text' ? d.oh : clamp(d.oh * k, 2, MAX_SIZE),
      }),
    }
    if (el.kind === 'text') patch.size = clamp(d.osize * k, 8, 220)
    update(el.id, patch as Partial<CardElement>, { history: false })
  }

  const end = (e: RPointerEvent) => {
    pinch.current.delete(e.pointerId)
    if (pinch.current.size < 2) pinchStart.current = null
    const d = drag.current
    drag.current = null
    if (!d) return
    if (d.moved) return
    /* a tap, not a drag */
    if (d.mode === 'move') {
      if (!active) onActivate()
      else if (el.kind === 'text' && !editing) onEnter()
      else onEnter()
    }
  }

  const label =
    el.kind === 'text' ? `${(el as { label?: string }).label ?? 'Text'} — ${el.text.trim() || 'empty'}`
    : el.kind === 'photo' ? 'Your selfie'
    : `Sticker: ${el.deco.replace(/-/g, ' ')}`

  /* the whole element is the hit target while editing is off */
  return (
    <>
      <button
        type="button"
        className="c-hit"
        aria-label={label}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!active) onActivate(); else onEnter(); return }
          if (!active) return
          const nudge = e.shiftKey ? 4 : 1
          const move = (dx: number, dy: number) => {
            e.preventDefault()
            update(el.id, { box: clampBox({ ...el.box, x: el.box.x + dx, y: el.box.y + dy }) } as Partial<CardElement>)
          }
          if (e.key === 'ArrowLeft') move(-nudge, 0)
          if (e.key === 'ArrowRight') move(nudge, 0)
          if (e.key === 'ArrowUp') move(0, -nudge)
          if (e.key === 'ArrowDown') move(0, nudge)
        }}
        onPointerDown={e => {
          if (editing) return
          e.stopPropagation()
          pinch.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
          if (!active) onActivate()
          if (!el.fixed) begin(e, 'move')
          else drag.current = { ...drag.current!, mode: 'move', moved: false } as Drag
        }}
        onPointerMove={onMove}
        onPointerUp={end}
        onPointerCancel={end}
        onDoubleClick={e => { e.stopPropagation(); if (el.kind === 'text') onEnter() }}
        style={{ pointerEvents: editing ? 'none' : 'auto' }}
      />

      {active && (
        <>
          <div className="c-ring" />
          <button className="c-handle c-handle--del" title="Delete" aria-label="Delete element"
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); remove(el.id) }}>
            <svg viewBox="0 0 16 16" aria-hidden><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>

          <button className="c-handle c-handle--move" title="Move" aria-label="Move element"
            onPointerDown={e => { e.stopPropagation(); bringForward(el.id); begin(e, 'move') }}
            onPointerMove={onMove} onPointerUp={end} onPointerCancel={end}>
            <svg viewBox="0 0 18 18" aria-hidden>
              <path d="M9 2v14M2 9h14M9 2 6.6 4.6M9 2l2.4 2.6M9 16l-2.4-2.6M9 16l2.4-2.6M2 9l2.6-2.4M2 9l2.6 2.4M16 9l-2.6-2.4M16 9l-2.6 2.4"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>

          <button className="c-handle c-handle--rot" title="Rotate" aria-label="Rotate element"
            onPointerDown={e => { e.stopPropagation(); begin(e, 'rotate') }}
            onPointerMove={onMove} onPointerUp={end} onPointerCancel={end}>
            <svg viewBox="0 0 18 18" aria-hidden>
              <path d="M14.4 7.2A5.8 5.8 0 1 1 9 3.2" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              <path d="M9 .8v4.8l4-2.4z" fill="currentColor" />
            </svg>
          </button>

          <button className="c-handle c-handle--size" title="Resize" aria-label="Resize element"
            onPointerDown={e => { e.stopPropagation(); begin(e, 'resize') }}
            onPointerMove={onMove} onPointerUp={end} onPointerCancel={end}>
            <svg viewBox="0 0 18 18" aria-hidden>
              <path d="M11 3h4v4M7 15H3v-4M15 3 3 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
        </>
      )}
    </>
  )
}
