import { useRef } from 'react'
import type { CardElement, DecoKey, FontKey, TextElement } from '../../lib/types'
import { FONTS, FONT_ORDER } from '../../lib/fonts'
import { DECO_GROUPS, DECO_LABEL } from '../../lib/decoMeta'
import { Decoration } from '../art/Decorations'
import { AlignIcon } from './EditorBits'
import { useCard } from '../../lib/store'
import { normalizePhoto } from '../../lib/image'

export const SWATCHES = ['#1a1a1a', '#7b0e11', '#c08a52', '#ecd9c0', '#ffffff', '#2f4858', '#7f9166', '#8c63a9', '#d2372f', '#e0a63c']

const pct = (v: number, min: number, max: number) => `${((v - min) / (max - min)) * 100}%`

export const PHRASES = [
  'Thank you for everything',
  'You make learning feel easy',
  'You believed in me first',
  'The best teacher I know',
  'Happy Teacher’s Day!',
  'You inspire me every day',
]

/* ---------------- fonts ---------------- */
export function FontGrid({ value, onPick }: { value?: FontKey; onPick: (f: FontKey) => void }) {
  return (
    <div className="ep-fonts">
      {FONT_ORDER.map(f => (
        <button key={f} className="ep-font" data-on={value === f ? '' : undefined} onClick={() => onPick(f)}>
          <span className="ep-font-aa" style={{ fontFamily: FONTS[f].stack, fontWeight: FONTS[f].weight }}>Aa</span>
          <span className="ep-font-name">{FONTS[f].label}</span>
        </button>
      ))}
    </div>
  )
}

/* ---------------- size / colour / align ---------------- */
export function TextControls({ el }: { el: TextElement | null }) {
  const update = useCard(s => s.update)
  const commit = useCard(s => s.commit)
  const disabled = !el

  return (
    <div className="ep-controls" data-disabled={disabled ? '' : undefined}>
      <div className="ep-row">
        <span className="ep-row-label">Size</span>
        <input
          className="ep-range" type="range" min={12} max={160} step={1}
          style={{ ['--fill' as string]: pct(el?.size ?? 48, 12, 160) }}
          value={el?.size ?? 48} disabled={disabled}
          aria-label="Text size"
          onChange={e => el && update(el.id, { size: Number(e.target.value) } as Partial<CardElement>, { history: false })}
          onPointerUp={commit}
        />
        <span className="ep-row-value">{Math.round(el?.size ?? 48)}</span>
      </div>

      <div className="ep-row">
        <span className="ep-row-label">Color</span>
        <div className="ep-swatches">
          {SWATCHES.slice(0, 4).map(c => (
            <button key={c} className="ep-sw" style={{ background: c }} disabled={disabled}
              data-on={el?.color?.toLowerCase() === c ? '' : undefined}
              aria-label={`Colour ${c}`}
              onClick={() => el && update(el.id, { color: c } as Partial<CardElement>)} />
          ))}
          <label className="ep-sw ep-sw--wheel" title="Custom colour">
            <input type="color" value={el?.color ?? '#1a1a1a'} disabled={disabled}
              onChange={e => el && update(el.id, { color: e.target.value } as Partial<CardElement>, { history: false })}
              onBlur={commit} aria-label="Custom text colour" />
          </label>
        </div>
      </div>

      <div className="ep-row">
        <span className="ep-row-label">Align</span>
        <div className="ep-aligns">
          {(['left', 'center', 'right'] as const).map(a => (
            <button key={a} className="ep-align" data-on={el?.align === a ? '' : undefined} disabled={disabled}
              aria-label={`Align ${a}`}
              onClick={() => el && update(el.id, { align: a } as Partial<CardElement>)}>
              <AlignIcon v={a} />
            </button>
          ))}
          <button className="ep-align" disabled={disabled} aria-label="Justify"
            onClick={() => el && update(el.id, { align: 'left' } as Partial<CardElement>)}>
            <AlignIcon v="justify" />
          </button>
          <button className="ep-align ep-align--plus" disabled={disabled} aria-label="Reset rotation"
            onClick={() => el && update(el.id, { rot: 0 } as Partial<CardElement>)}>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------------- decorations ---------------- */
export function DecoPanel({ only, onAdd }: { only?: string[]; onAdd: (d: DecoKey) => void }) {
  const groups = only ? DECO_GROUPS.filter(g => only.includes(g.key)) : DECO_GROUPS
  return (
    <div className="ep-decos">
      {groups.map(g => (
        <section key={g.key}>
          <h4 className="ep-deco-title">{g.label}</h4>
          <div className="ep-deco-grid">
            {g.items.map(d => (
              <button key={d} className="ep-deco" onClick={() => onAdd(d)} title={DECO_LABEL[d] ?? d} aria-label={`Add ${DECO_LABEL[d] ?? d}`}>
                <span className="ep-deco-art"><Decoration deco={d} /></span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

/* ---------------- handwriting ---------------- */
export function HandwritePanel({ onAdd }: { onAdd: (text: string, font: FontKey) => void }) {
  return (
    <div className="ep-hand">
      <p className="ep-hint">Drop a note onto the card in your own hand.</p>
      <div className="ep-phrases">
        {PHRASES.map(p => (
          <button key={p} className="ep-phrase" onClick={() => onAdd(p, 'playful')}>{p}</button>
        ))}
      </div>
      <button className="ep-note-btn" onClick={() => onAdd('', 'playful')}>
        Add a hand-drawn note
        <svg viewBox="0 0 22 22" fill="none" aria-hidden>
          <path d="M3.6 18.4 4.5 15 14.9 4.6a2.1 2.1 0 0 1 3 3L7.5 18l-3.9.4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}

/* ---------------- colours ---------------- */
export function ColorPanel({ el }: { el: CardElement | null }) {
  const update = useCard(s => s.update)
  const commit = useCard(s => s.commit)
  const can = el && (el.kind === 'text' || el.kind === 'deco')
  return (
    <div className="ep-colors">
      <p className="ep-hint">{can ? 'Colour the selected piece.' : 'Select a piece of the card first.'}</p>
      <div className="ep-swatch-grid">
        {SWATCHES.map(c => (
          <button key={c} className="ep-sw ep-sw--lg" style={{ background: c }} disabled={!can}
            aria-label={`Colour ${c}`}
            onClick={() => el && update(el.id, { color: c } as Partial<CardElement>)} />
        ))}
        <label className="ep-sw ep-sw--lg ep-sw--wheel" title="Custom colour">
          <input type="color" disabled={!can} defaultValue="#7b0e11"
            onChange={e => el && update(el.id, { color: e.target.value } as Partial<CardElement>, { history: false })}
            onBlur={commit} aria-label="Custom colour" />
        </label>
      </div>
    </div>
  )
}

/* ---------------- photo ---------------- */
export function PhotoPanel() {
  const doc = useCard(s => s.doc)
  const setPhoto = useCard(s => s.setPhoto)
  const update = useCard(s => s.update)
  const commit = useCard(s => s.commit)
  const file = useRef<HTMLInputElement>(null)
  const slot = doc.elements.find(e => e.kind === 'photo') as Extract<CardElement, { kind: 'photo' }> | undefined

  return (
    <div className="ep-photo">
      {doc.photo
        ? <img className="ep-photo-prev" src={doc.photo} alt="Your photo" />
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
              onChange={e => update(slot.id, { zoom: Number(e.target.value) } as Partial<CardElement>, { history: false })}
              onPointerUp={commit} />
            <span className="ep-row-value">{Math.round(slot.zoom * 100)}%</span>
          </div>
          <div className="ep-row">
            <span className="ep-row-label">Up / down</span>
            <input className="ep-range" type="range" min={-30} max={30} step={1} value={slot.oy}
              style={{ ['--fill' as string]: pct(slot.oy, -30, 30) }}
              aria-label="Photo vertical position"
              onChange={e => update(slot.id, { oy: Number(e.target.value) } as Partial<CardElement>, { history: false })}
              onPointerUp={commit} />
            <span className="ep-row-value">{slot.oy}</span>
          </div>
          <div className="ep-row">
            <span className="ep-row-label">Frame</span>
            <div className="ep-frames">
              {(['polaroid', 'plain', 'arch', 'circle'] as const).map(f => (
                <button key={f} className="ep-frame" data-on={slot.frame === f ? '' : undefined}
                  onClick={() => update(slot.id, { frame: f } as Partial<CardElement>)}>{f}</button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
