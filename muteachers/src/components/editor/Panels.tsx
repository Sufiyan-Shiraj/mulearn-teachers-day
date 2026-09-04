import { useRef } from 'react'
import type { CardElement } from '../../lib/types'
import { newDoc, useCard } from '../../lib/store'
import { getTemplate, TEMPLATES } from '../../lib/templates'
import { SLOTS } from '../../lib/slots'
import { CardCanvas } from '../card/CardCanvas'
import { PhotoFrame } from '../card/PhotoFrame'
import { clampPan, coverRatios, normalizePhoto, panLimit } from '../../lib/image'

const pct = (v: number, min: number, max: number) => `${((v - min) / (max - min)) * 100}%`

/* sliders snapshot once when grabbed, so one drag is one undo step */
const grab = () => useCard.getState().beginChange()

/* ---------------- the teacher's name ---------------- */

/**
 * Asked for on the screen itself, not behind a tool.
 *
 * This is the only thing the app really needs from anyone, and it is what the
 * leaderboard counts — so it sits above the picture where it cannot be
 * missed, rather than inside a panel you have to know to open.
 */
export function TeacherField() {
  const doc = useCard(s => s.doc)
  const update = useCard(s => s.update)
  const select = useCard(s => s.select)
  const el = doc.elements.find(e => e.kind === 'text') as Extract<CardElement, { kind: 'text' }> | undefined
  if (!el) return null

  return (
    <label className="ed-teacher" data-empty={el.text.trim() ? undefined : ''}>
      <span className="ed-teacher-label">Who&rsquo;s in the photo with you?</span>
      <input
        id="teacher-name"
        type="text" value={el.text} maxLength={40}
        placeholder="Your teacher&rsquo;s name"
        autoComplete="off" enterKeyHint="done"
        onFocus={() => select(el.id)}
        onPointerDown={grab}
        onChange={e => update(el.id, { text: e.target.value } as Partial<CardElement>, { history: false })}
      />
    </label>
  )
}

/**
 * The only text on a selfie.
 *
 * It already sits in the writing area the template was drawn with, so there is
 * nothing to place and nothing to style — just what it says and how big. It can
 * still be dragged anywhere on the picture if someone wants it somewhere else.
 */
export function NamePanel() {
  const doc = useCard(s => s.doc)
  const update = useCard(s => s.update)
  const templateId = doc.templateId
  const el = doc.elements.find(e => e.kind === 'text') as Extract<CardElement, { kind: 'text' }> | undefined
  if (!el) return null

  const home = SLOTS[getTemplate(templateId).art]
  const [hx, hy, hw, hh] = home.name
  const moved = Math.abs(el.box.x - hx) > 1 || Math.abs(el.box.y - hy) > 1

  return (
    <div className="ep-photo">
      <p className="ep-hint ep-hint--tight">
        Drag the name around the picture to move it. This changes how big it sits.
      </p>

      <div className="ep-row">
        <span className="ep-row-label">Size</span>
        <input className="ep-range" type="range" min={16} max={90} step={1} value={el.size}
          style={{ ['--fill' as string]: pct(el.size, 16, 90) }}
          aria-label="Name size"
          onPointerDown={grab}
          onChange={e => update(el.id, { size: Number(e.target.value) } as Partial<CardElement>, { history: false })} />
        <span className="ep-row-value">{Math.round(el.size)}</span>
      </div>

      {moved && (
        <button className="ep-reset"
          onClick={() => update(el.id, {
            box: { x: hx, y: hy, w: hw, h: hh }, rot: 0, size: home.nameSize,
          } as Partial<CardElement>)}>
          Put it back where it belongs
        </button>
      )}
    </div>
  )
}

/* ---------------- the frame ---------------- */

/**
 * Swapping the template rearranges the whole card, so it lives in the editor
 * rather than in a step before it — you can see your own photo and words in
 * each one instead of choosing a layout blind.
 */
export function TemplatePanel() {
  const templateId = useCard(s => s.doc.templateId)
  const photo = useCard(s => s.doc.photo)
  const setTemplate = useCard(s => s.setTemplate)

  return (
    <div className="ep-templates">
      <p className="ep-hint">Your photo and words carry across.</p>
      <div className="ep-tpl-grid">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            className="ep-tpl"
            data-on={templateId === t.id ? '' : undefined}
            onClick={() => setTemplate(t.id)}
            aria-pressed={templateId === t.id}
            aria-label={`Use the ${t.name} card`}
          >
            <span className="ep-tpl-crop">
              <CardCanvas doc={{ ...newDoc(t.id), photo }} template={t} mode="thumb" />
            </span>
            <span className="ep-tpl-name">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------------- photo ---------------- */

/**
 * "Fit" keeps the photo in the frame printed on the template artwork, which
 * is what every template starts with — the artwork does the framing and the
 * photo tucks in behind it. The rest lift the photo out onto the card with a
 * frame of its own, so they are offered separately rather than as peers.
 */
const FRAMES = [
  { key: 'slot', label: 'Fit' },
  { key: 'polaroid', label: 'Polaroid' },
  { key: 'plain', label: 'Plain' },
  { key: 'arch', label: 'Arch' },
  { key: 'circle', label: 'Circle' },
] as const

export function PhotoPanel() {
  const doc = useCard(s => s.doc)
  const setPhoto = useCard(s => s.setPhoto)
  const update = useCard(s => s.update)
  const templateAr = useCard(s => getTemplate(s.doc.templateId).aspect)
  const file = useRef<HTMLInputElement>(null)
  const slot = doc.elements.find(e => e.kind === 'photo') as Extract<CardElement, { kind: 'photo' }> | undefined

  /* How much room there is to pan depends on the photo's own shape against
     the slot's, not on the zoom alone — a tall photo in a wide frame can be
     slid up and down at zoom 1, which the old flat limit refused to allow. */
  const slotAr = slot && slot.box.h > 0 ? (slot.box.w / slot.box.h) * templateAr : undefined
  const [rx, ry] = coverRatios(doc.photoAr, slotAr)
  const limX = slot ? panLimit(slot.zoom, rx) : 0
  const limY = slot ? panLimit(slot.zoom, ry) : 0

  /* zooming back out has to pull the pan in with it, or the photo would
     uncover a corner of its window the moment the slider is released */
  const setZoom = (zoom: number) => {
    if (!slot) return
    update(slot.id, {
      zoom,
      ox: clampPan(slot.ox, zoom, rx),
      oy: clampPan(slot.oy, zoom, ry),
    } as Partial<CardElement>, { history: false })
  }

  /* the same rule the card uses, so the buttons show where it really is */
  const framed = slot ? (slot.frame === 'slot' || slot.frame === 'arch-slot') : false
  const under = slot ? (slot.lift === undefined ? framed : !slot.lift) : true

  return (
    <div className="ep-photo">
      {/* The preview renders the same component the card does, in a box the
          shape of the slot — so zoom, panning and the frame all show here
          before you go looking for them on the card. */}
      {doc.photo && slot
        ? (
          <div className="ep-photo-prev" style={{ aspectRatio: String(slotAr ?? 1) }}>
            <PhotoFrame el={slot} src={doc.photo} mode="view"
              photoAr={doc.photoAr} cardAr={templateAr} />
          </div>
        )
        : <div className="ep-photo-prev ep-photo-prev--empty">No photo yet</div>}

      <button className="ep-note-btn" onClick={() => file.current?.click()}>
        {doc.photo ? 'Replace photo' : 'Add a photo'}
      </button>
      <input ref={file} type="file" accept="image/*" className="sr-only"
        onChange={async e => {
          const f = e.target.files?.[0]
          if (f) setPhoto(await normalizePhoto(f))
        }} />

      {slot && doc.photo && (
        <>
          <div className="ep-row">
            <span className="ep-row-label">Zoom</span>
            <input className="ep-range" type="range" min={1} max={2.6} step={.02} value={slot.zoom}
              style={{ ['--fill' as string]: pct(slot.zoom, 1, 2.6) }}
              aria-label="Photo zoom"
              onPointerDown={grab}
              onChange={e => setZoom(Number(e.target.value))} />
            <span className="ep-row-value">{Math.round(slot.zoom * 100)}%</span>
          </div>

          <PanRow label="Left / right" axis="ox" limit={limX} slot={slot} ratio={rx} />
          <PanRow label="Up / down" axis="oy" limit={limY} slot={slot} ratio={ry} />

          {limX < 0.5 && limY < 0.5 && (
            <p className="ep-hint ep-hint--tight">Zoom in to move the photo inside its frame.</p>
          )}

          <div className="ep-row">
            <span className="ep-row-label">Frame</span>
            <div className="ep-frames">
              {FRAMES.map(f => (
                <button key={f.key} className="ep-frame"
                  data-on={slot.frame === f.key || (f.key === 'slot' && slot.frame === 'arch-slot') ? '' : undefined}
                  onClick={() => update(slot.id, { frame: f.key } as Partial<CardElement>)}>{f.label}</button>
              ))}
            </div>
          </div>

          {/* Any frame can go either side of the artwork — a polaroid tucked
              under it shows its white border through the printed slot. */}
          <div className="ep-row">
            <span className="ep-row-label">Layer</span>
            <div className="ep-frames">
              <button className="ep-frame" data-on={under ? '' : undefined}
                onClick={() => update(slot.id, { lift: false } as Partial<CardElement>)}>Behind art</button>
              <button className="ep-frame" data-on={under ? undefined : ''}
                onClick={() => update(slot.id, { lift: true } as Partial<CardElement>)}>In front</button>
            </div>
          </div>

          <button className="ep-reset" onClick={() => update(slot.id, { zoom: 1, ox: 0, oy: 0 } as Partial<CardElement>)}>
            Reset framing
          </button>
        </>
      )}
    </div>
  )
}

/** one pan axis, dead when the photo has no room to move on it */
function PanRow({ label, axis, limit, slot, ratio }: {
  label: string
  axis: 'ox' | 'oy'
  limit: number
  ratio: number
  slot: Extract<CardElement, { kind: 'photo' }>
}) {
  const update = useCard(s => s.update)
  const can = limit > 0.5
  const value = clampPan(slot[axis], slot.zoom, ratio)
  const min = can ? -limit : -1
  const max = can ? limit : 1

  return (
    <div className="ep-row" data-disabled={can ? undefined : ''}>
      <span className="ep-row-label">{label}</span>
      <input className="ep-range" type="range" min={min} max={max} step={.5}
        value={value} disabled={!can}
        style={{ ['--fill' as string]: pct(value, min, max) }}
        aria-label={`Photo ${axis === 'ox' ? 'horizontal' : 'vertical'} position`}
        onPointerDown={grab}
        onChange={e => update(slot.id, { [axis]: Number(e.target.value) } as Partial<CardElement>, { history: false })} />
      <span className="ep-row-value">{Math.round(value)}</span>
    </div>
  )
}
