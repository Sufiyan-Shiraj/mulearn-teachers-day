import { memo, useCallback, useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { CardDoc, CardElement, DecoElement, PhotoElement, Template, TextElement } from '../../lib/types'
import { clampBox } from '../../lib/types'
import { FONTS } from '../../lib/fonts'
import { TemplateArt } from '../art/TemplateArt'
import { Decoration } from '../art/Decorations'
import { DECO_ASPECT } from '../../lib/decoMeta'
import { useCard } from '../../lib/store'
import { PhotoFrame } from './PhotoFrame'
import { TextPlate } from './TextPlate'
import { ElementChrome } from './ElementChrome'
import './card.css'

export type CanvasMode = 'view' | 'edit' | 'thumb'

interface Props {
  doc: CardDoc
  template: Template
  mode?: CanvasMode
  className?: string
  style?: CSSProperties
}

/* ------------------------------------------------------------------ */

/**
 * Pull the selection handles back onto the card.
 *
 * They hang off the element's corners, and the card clips whatever leaves it,
 * so an element resized past the edge lost every handle at once and could only
 * be recovered with undo. These put each handle where the element still meets
 * the card instead. Applied to every selected element rather than only the
 * ones that look like they need it: a sticker or a line of text has no fixed
 * height in its box, so there is no reliable way to tell in advance.
 */
const HANDLE_MARGIN = 4

function handleVars(el: CardElement): CSSProperties {
  const b = clampBox(el.box)
  const lo = HANDLE_MARGIN
  const hi = 100 - HANDLE_MARGIN

  /* Rotation swings the corners out past the box, so the window is pulled in
     by roughly how far — approximate, but it errs towards keeping a handle on
     the card rather than losing one. */
  const t = Math.abs(Math.sin((el.rot * Math.PI) / 180))
  const padX = Math.min(20, (b.h || b.w) * t * 0.5)
  const padY = Math.min(20, b.w * t * 0.5)

  const loX = lo + padX, hiX = hi - padX
  const loY = lo + padY, hiY = hi - padY

  /* `min(100%, …)` is what makes this work for text and stickers, whose real
     height the box never knows — 100% is whatever was actually laid out. */
  return {
    ['--h-l' as string]: `calc(var(--cw) * ${Math.max(0, loX - b.x).toFixed(2)})`,
    ['--h-r' as string]: `min(100%, calc(var(--cw) * ${Math.max(1, hiX - b.x).toFixed(2)}))`,
    ['--h-t' as string]: `calc(var(--ch) * ${Math.max(0, loY - b.y).toFixed(2)})`,
    ['--h-b' as string]: `min(100%, calc(var(--ch) * ${Math.max(1, hiY - b.y).toFixed(2)}))`,
  }
}

function elStyle(el: CardElement): CSSProperties {
  /* a safety net as well as a rule: a card saved before the bounds existed
     can hold an element that is entirely off the paper, and clamping here
     brings it back within reach instead of leaving it lost */
  const box = clampBox(el.box)
  const h = el.kind === 'text' ? undefined : `${box.h}%`
  return {
    left: `${box.x}%`,
    top: `${box.y}%`,
    width: `${box.w}%`,
    height: h,
    transform: `rotate(${el.rot}deg)`,
  }
}

const TextView = memo(function TextView({ el }: { el: TextElement }) {
  const f = FONTS[el.font]
  const empty = !el.text.trim()
  return (
    <div
      className="c-text-body"
      style={{
        fontFamily: f.stack,
        fontWeight: el.weight ?? f.weight,
        fontSize: `calc(var(--u) * ${el.size})`,
        lineHeight: el.lh ?? f.lh,
        letterSpacing: el.ls ? `calc(var(--u) * ${el.ls})` : undefined,
        color: el.color,
        textAlign: el.align,
        fontStyle: el.italic ? 'italic' : undefined,
        textTransform: el.upper ? 'uppercase' : undefined,
        textShadow: el.shadow,
        transform: el.scaleX ? `scaleX(${el.scaleX})` : undefined,
        transformOrigin: 'center center',
        opacity: empty ? 0.42 : 1,
        ...(el.gradient ? {
          backgroundImage: el.gradient,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        } : null),
      }}
    >
      {empty ? el.placeholder : el.text}
    </div>
  )
})

/* ------------------------------------------------------------------ */

function EditableText({ el }: { el: TextElement }) {
  const ref = useRef<HTMLDivElement>(null)
  const editing = useCard(s => s.editingId === el.id)
  const update = useCard(s => s.update)
  const beginChange = useCard(s => s.beginChange)
  const f = FONTS[el.font]

  /* keep the DOM in sync only when the value changes from the outside */
  useEffect(() => {
    const n = ref.current
    if (!n) return
    if (n.innerText.replace(/\n$/, '') !== el.text) n.innerText = el.text
  }, [el.text])

  useEffect(() => {
    if (!editing) return
    const n = ref.current
    if (!n) return
    n.focus({ preventScroll: true })
    const r = document.createRange()
    r.selectNodeContents(n); r.collapse(false)
    const sel = getSelection()
    sel?.removeAllRanges(); sel?.addRange(r)
  }, [editing])

  /* one undo step per visit to a text box, taken before the first keystroke */
  const snapped = useRef(false)
  useEffect(() => { snapped.current = false }, [editing])

  const onInput = useCallback(() => {
    const n = ref.current
    if (!n) return
    if (!snapped.current) { snapped.current = true; beginChange() }
    let v = n.innerText.replace(/\n$/, '')
    if (el.maxLen && v.length > el.maxLen) {
      v = v.slice(0, el.maxLen)
      n.innerText = v
      const r = document.createRange(); r.selectNodeContents(n); r.collapse(false)
      const sel = getSelection(); sel?.removeAllRanges(); sel?.addRange(r)
    }
    update(el.id, { text: v } as Partial<CardElement>, { history: false })
  }, [el.id, el.maxLen, update, beginChange])

  const empty = !el.text.trim()

  return (
    <div
      ref={ref}
      className="c-text-body c-text-edit"
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-label={el.label ?? 'Card text'}
      data-ph={el.placeholder}
      data-empty={empty || undefined}
      onInput={onInput}
      onKeyDown={e => {
        e.stopPropagation()
        if (e.key === 'Escape') { (e.target as HTMLElement).blur(); useCard.getState().setEditing(null) }
      }}
      style={{
        fontFamily: f.stack,
        fontWeight: el.weight ?? f.weight,
        fontSize: `calc(var(--u) * ${el.size})`,
        lineHeight: el.lh ?? f.lh,
        letterSpacing: el.ls ? `calc(var(--u) * ${el.ls})` : undefined,
        color: el.color,
        textAlign: el.align,
        fontStyle: el.italic ? 'italic' : undefined,
        textTransform: el.upper ? 'uppercase' : undefined,
        textShadow: el.shadow,
        transform: el.scaleX ? `scaleX(${el.scaleX})` : undefined,
        transformOrigin: 'center center',
        ...(el.gradient ? {
          backgroundImage: el.gradient,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        } : null),
      }}
    />
  )
}

/* ------------------------------------------------------------------ */

function DecoView({ el }: { el: DecoElement }) {
  return (
    <div className="c-deco-inner" style={{ transform: el.flip ? 'scaleX(-1)' : undefined }}>
      <Decoration deco={el.deco} color={el.color} />
    </div>
  )
}

/* ------------------------------------------------------------------ */

export function CardCanvas({ doc, template, mode = 'view', className, style }: Props) {
  const selectedId = useCard(s => s.selectedId)
  const editingId = useCard(s => s.editingId)
  const select = useCard(s => s.select)
  const setEditing = useCard(s => s.setEditing)
  const justAdded = useCard(s => s.photoJustAdded)
  const freshId = useCard(s => s.freshId)
  const edit = mode === 'edit'

  const items = doc.elements

  return (
    <div
      className={`c-card c-card--${template.id} ${className ?? ''}`}
      style={{ ...style, aspectRatio: String(template.aspect), ['--card-ar' as string]: String(template.aspect) }}
      data-mode={mode}
    >
      <div className="c-design">
        <TemplateArt art={template.art} />

        {items.map(el => {
          const isSel = edit && selectedId === el.id
          const isEditing = edit && editingId === el.id
          const common = {
            className: `c-el c-el--${el.kind}${isSel ? ' is-selected' : ''}${isEditing ? ' is-editing' : ''}`,
            style: { ...elStyle(el), ...(isSel ? handleVars(el) : null) },
            'data-id': el.id,
            'data-fresh': freshId === el.id ? '' : undefined,
          }

          if (el.kind === 'text') {
            if (!edit && !el.text.trim()) return null
            return (
              <div key={el.id} {...common}>
                <TextPlate kind={el.plate ?? 'none'} />
                <div className="c-text-inner">
                  {isEditing ? <EditableText el={el} /> : <TextView el={el} />}
                </div>
                {edit && (
                  <ElementChrome
                    el={el}
                    active={isSel}
                    onActivate={() => select(el.id)}
                    onEnter={() => setEditing(el.id)}
                  />
                )}
              </div>
            )
          }

          if (el.kind === 'photo') {
            /* By default a photo fitted to the frame printed on the artwork
               tucks under it and any other frame lays on top — but `lift`
               overrides that either way once the user has chosen. */
            const framed = el.frame === 'slot' || el.frame === 'arch-slot'
            const fitted = el.lift === undefined ? framed : !el.lift
            return (
              <div key={el.id} {...common}
                data-slot={fitted ? '' : undefined}
                data-fresh={justAdded || freshId === el.id ? '' : undefined}>
                <PhotoFrame el={el as PhotoElement} src={doc.photo} mode={mode}
                  photoAr={doc.photoAr} cardAr={template.aspect} />
                {edit && (
                  <ElementChrome
                    el={el}
                    active={isSel}
                    onActivate={() => select(el.id)}
                    onEnter={() => select(el.id)}
                  />
                )}
              </div>
            )
          }

          const aspect = DECO_ASPECT[(el as DecoElement).deco] ?? 1
          return (
            <div
              key={el.id}
              {...common}
              style={{
                ...elStyle(el),
                ...(isSel ? handleVars(el) : null),
                height: 'auto',
                aspectRatio: String(aspect),
              }}
            >
              <DecoView el={el as DecoElement} />
              {edit && (
                <ElementChrome
                  el={el}
                  active={isSel}
                  onActivate={() => select(el.id)}
                  onEnter={() => select(el.id)}
                />
              )}
            </div>
          )
        })}

        <TemplateArt art={template.art} layer="over" />
      </div>
    </div>
  )
}
