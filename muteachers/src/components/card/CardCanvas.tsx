import { memo, useCallback, useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { CardDoc, CardElement, DecoElement, Face, PhotoElement, Template, TextElement } from '../../lib/types'
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
  face: Face
  mode?: CanvasMode
  className?: string
  style?: CSSProperties
}

/* ------------------------------------------------------------------ */

function elStyle(el: CardElement): CSSProperties {
  const h = el.kind === 'text' ? undefined : `${el.box.h}%`
  return {
    left: `${el.box.x}%`,
    top: `${el.box.y}%`,
    width: `${el.box.w}%`,
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
  const commit = useCard(s => s.commit)
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

  const onInput = useCallback(() => {
    const n = ref.current
    if (!n) return
    let v = n.innerText.replace(/\n$/, '')
    if (el.maxLen && v.length > el.maxLen) {
      v = v.slice(0, el.maxLen)
      n.innerText = v
      const r = document.createRange(); r.selectNodeContents(n); r.collapse(false)
      const sel = getSelection(); sel?.removeAllRanges(); sel?.addRange(r)
    }
    update(el.id, { text: v } as Partial<CardElement>, { history: false })
  }, [el.id, el.maxLen, update])

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
      onBlur={commit}
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

export function CardCanvas({ doc, template, face, mode = 'view', className, style }: Props) {
  const selectedId = useCard(s => s.selectedId)
  const editingId = useCard(s => s.editingId)
  const select = useCard(s => s.select)
  const setEditing = useCard(s => s.setEditing)
  const justAdded = useCard(s => s.photoJustAdded)
  const freshId = useCard(s => s.freshId)
  const edit = mode === 'edit'

  const items = doc.elements.filter(e => e.face === face)

  return (
    <div
      className={`c-card c-card--${template.id} ${className ?? ''}`}
      style={{ ...style, aspectRatio: String(template.aspect), ['--card-ar' as string]: String(template.aspect) }}
      data-mode={mode}
    >
      <div className="c-design">
        <TemplateArt art={template.art} face={face} />

        {items.map(el => {
          const isSel = edit && selectedId === el.id
          const isEditing = edit && editingId === el.id
          const common = {
            className: `c-el c-el--${el.kind}${isSel ? ' is-selected' : ''}${isEditing ? ' is-editing' : ''}`,
            style: elStyle(el),
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
            /* a photo fitted to the frame printed on the artwork tucks under
               it; any other frame is a photo laid on top of the card */
            const fitted = el.frame === 'slot' || el.frame === 'arch-slot'
            return (
              <div key={el.id} {...common}
                data-slot={fitted ? '' : undefined}
                data-fresh={justAdded || freshId === el.id ? '' : undefined}>
                <PhotoFrame el={el as PhotoElement} src={doc.photo} mode={mode} />
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

        <TemplateArt art={template.art} face={face} layer="front" />
      </div>
    </div>
  )
}
