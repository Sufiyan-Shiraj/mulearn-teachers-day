import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../components/shell/TopNav'
import { StepBar } from '../components/shell/StepBar'
import { CardCanvas } from '../components/card/CardCanvas'
import { Button, ArrowRight } from '../components/ui/Button'
import { Burst, StarDoodle } from '../components/art/Doodles'
import { AaIcon, AlignIcon, DotsIcon, MoveIcon, SizeIcon, ToolIcons, TrashIcon } from '../components/editor/EditorBits'
import { ColorPanel, DecoPanel, FontGrid, HandwritePanel, PhotoPanel, SWATCHES, TemplatePanel, TextControls } from '../components/editor/Panels'
import { getTemplate } from '../lib/templates'
import { scrollIntoView } from '../lib/useReveal'
import { useCard } from '../lib/store'
import { useIsMobile } from '../lib/useIsMobile'
import { useAuth } from '../context/AuthContext'
import type { CardElement, DecoKey, FontKey } from '../lib/types'
import './editor.css'

type Tool = 'card' | 'text' | 'handwrite' | 'decorate' | 'stickers' | 'colors' | 'photo'
type Sheet = null | 'card' | 'font' | 'size' | 'color' | 'align' | 'more'

const TOOLS: { key: Tool; label: string }[] = [
  { key: 'card', label: 'Card' },
  { key: 'text', label: 'Text' },
  { key: 'handwrite', label: 'Handwrite' },
  { key: 'decorate', label: 'Decorate' },
  { key: 'stickers', label: 'Stickers' },
  { key: 'colors', label: 'Colors' },
  { key: 'photo', label: 'Photo' },
]

export default function Editor() {
  const doc = useCard(s => s.doc)
  const face = useCard(s => s.face)
  const setFace = useCard(s => s.setFace)
  const selectedId = useCard(s => s.selectedId)
  const editingId = useCard(s => s.editingId)
  const select = useCard(s => s.select)
  const setEditing = useCard(s => s.setEditing)
  const update = useCard(s => s.update)
  const remove = useCard(s => s.remove)
  const addDeco = useCard(s => s.addDeco)
  const addText = useCard(s => s.addText)
  const undo = useCard(s => s.undo)
  const redo = useCard(s => s.redo)
  const canUndo = useCard(s => s.past.length > 0)
  const canRedo = useCard(s => s.future.length > 0)
  const clearJustAdded = useCard(s => s.clearJustAdded)
  const clearFresh = useCard(s => s.clearFresh)
  const ensurePhotoAspect = useCard(s => s.ensurePhotoAspect)
  const freshId = useCard(s => s.freshId)

  const [tool, setTool] = useState<Tool>('text')
  const [sheet, setSheet] = useState<Sheet>(null)
  const isMobile = useIsMobile()
  /* anything at all having been changed — a sticker, a photo nudge, a
     word — not only a text box having been opened */
  const touched = canUndo
  const nextRef = useRef<HTMLDivElement>(null)
  const nav = useNavigate()
  const { user, loading, openAuthModal } = useAuth()
  const tpl = useMemo(() => getTemplate(doc.templateId), [doc.templateId])

  useEffect(() => {
    if (!loading && !user) {
      openAuthModal({
        title: 'First — what’s your name?',
        subtitle: 'It goes on your card so your teacher knows who it’s from.',
        redirectTo: '/create',
      })
      nav('/', { replace: true })
    }
  }, [user, loading, nav, openAuthModal])

  const selected = doc.elements.find(e => e.id === selectedId) ?? null
  const selectedText = selected?.kind === 'text' ? selected : null

  /* a card restored from storage may predate the photo being measured */
  useEffect(() => { ensurePhotoAspect() }, [ensurePhotoAspect, doc.photo])

  useEffect(() => { const t = setTimeout(clearJustAdded, 900); return () => clearTimeout(t) }, [clearJustAdded])
  useEffect(() => {
    if (!freshId) return
    const t = setTimeout(clearFresh, 800)
    return () => clearTimeout(t)
  }, [freshId, clearFresh])

  /* the moment an edit finishes, bring the way forward back into view */
  const wasEditing = useRef(false)
  useEffect(() => {
    if (editingId) { wasEditing.current = true; return }
    if (!wasEditing.current) return
    wasEditing.current = false
    const t = setTimeout(() => scrollIntoView(nextRef.current, 'nearest'), 260)
    return () => clearTimeout(t)
  }, [editingId])

  const goNext = useCallback(() => {
    setEditing(null)
    select(null)
    nav('/preview')
  }, [nav, select, setEditing])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.isContentEditable || /INPUT|TEXTAREA/.test((e.target as HTMLElement)?.tagName ?? '')
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo(); else undo()
        return
      }
      if (typing) return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) { e.preventDefault(); remove(selectedId) }
      if (e.key === 'Escape') { select(null); setSheet(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [redo, remove, select, selectedId, undo])

  /* A wide screen has the panels open in the sidebar already; only a narrow
     one needs the bottom sheet. Sending every button to the sheet meant a
     phone-shaped dialog sliding up over the desktop editor. */
  const SIDEBAR_FOR: Record<Exclude<Sheet, null>, Tool> = {
    card: 'card', font: 'text', size: 'text', color: 'colors', align: 'text', more: 'text',
  }
  const openPanel = (which: Exclude<Sheet, null>) => {
    if (isMobile) setSheet(s => (s === which ? null : which))
    else setTool(SIDEBAR_FOR[which])
  }

  const addDecoHere = (d: DecoKey) => { addDeco(d, face); setSheet(null) }
  const addNote = (text: string, font: FontKey) => {
    const id = addText(face)
    update(id, { text, font, size: 46 } as Partial<CardElement>, { history: false })
    if (!text) setEditing(id)
  }

  const hint = editingId ? 'Type your words — they land straight on the card.'
    : selected ? 'Drag to move · corner handles to resize & rotate · pinch on touch.'
    : 'Click on any text to edit. Drag to move. Pinch to resize.'

  return (
    <div className="page ed">
      <TopNav back={{ to: '/photo', label: 'Back' }} />
      <div className="shell ed-steps"><StepBar current="create" /></div>

      <main className="ed-main">
        {/* -------- tool rail -------- */}
        <nav className="ed-rail" aria-label="Editor tools">
          {TOOLS.map(t => (
            <button key={t.key} className="ed-rail-btn" data-on={tool === t.key ? '' : undefined}
              onClick={() => setTool(t.key)} aria-pressed={tool === t.key}>
              <span className="ed-rail-ico">{ToolIcons[t.key]}</span>
              <span className="ed-rail-label">{t.label}</span>
            </button>
          ))}
        </nav>

        {/* -------- left panel -------- */}
        <aside className="ed-panel">
          <header className="ed-panel-head">
            <h1 className="ed-panel-title">Make it <em>yours</em><Burst className="ed-panel-burst" size={20} /></h1>
            <StarDoodle className="ed-panel-star" size={22} color="var(--ink-soft)" />
          </header>

          <div className="ed-panel-body">
            {tool === 'card' && <TemplatePanel />}
            {tool === 'text' && (
              <>
                <FontGrid value={selectedText?.font} onPick={f => selectedText && update(selectedText.id, { font: f } as Partial<CardElement>)} />
                <TextControls el={selectedText} />
                <button className="ed-note-cta" onClick={() => addNote('', 'playful')}>
                  Add a hand-drawn note
                  <svg viewBox="0 0 22 22" fill="none" aria-hidden>
                    <path d="M3.6 18.4 4.5 15 14.9 4.6a2.1 2.1 0 0 1 3 3L7.5 18l-3.9.4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                  <svg className="ed-note-cta-arrow" viewBox="0 0 40 16" fill="none" aria-hidden>
                    <path d="M2 3c8 8 22 10 35 8" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M31 7.4 37.6 11l-4.4 4" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}
            {tool === 'handwrite' && <HandwritePanel onAdd={addNote} />}
            {tool === 'decorate' && <DecoPanel only={['hearts', 'stars', 'flowers', 'doodles', 'tape', 'retro']} onAdd={addDecoHere} />}
            {tool === 'stickers' && <DecoPanel only={['stickers', 'stationery']} onAdd={addDecoHere} />}
            {tool === 'colors' && <ColorPanel el={selected} />}
            {tool === 'photo' && <PhotoPanel />}
          </div>
        </aside>

        {/* -------- stage -------- */}
        <section className="ed-stage">
          <div className="ed-face-switch" role="tablist" aria-label="Card side">
            <button role="tab" aria-selected={face === 'front'} data-on={face === 'front' ? '' : undefined} onClick={() => setFace('front')}>Front</button>
            <button role="tab" aria-selected={face === 'back'} data-on={face === 'back' ? '' : undefined} onClick={() => setFace('back')}>Inside</button>
          </div>

          <div className="ed-card-wrap" style={{ ['--card-ar' as string]: String(tpl.aspect) }} onPointerDown={e => { if (e.target === e.currentTarget) { select(null); setEditing(null) } }}>
            <CardCanvas doc={doc} template={tpl} face={face} mode="edit" className="ed-card" />
          </div>

          <p className="ed-hint">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden><path d="M7 9.4V4.6a1.5 1.5 0 0 1 3 0v4M10 8.4V3.6a1.5 1.5 0 0 1 3 0v5M13 8.6V5.8a1.5 1.5 0 0 1 3 0v6.6c0 3.4-2.4 5.6-5.6 5.6-2.6 0-4-1-5.2-2.8L3 12.2a1.5 1.5 0 0 1 2.4-1.8L7 12.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {hint}
          </p>
          <div className="ed-dock">
          {/* -------- contextual toolbar -------- */}
          <div className="ed-toolbar" data-active={selected ? '' : undefined}>
            <ToolbarBtn label="Edit Text" active accent
              icon={<span className="ed-tb-aa">Aa</span>}
              onClick={() => { if (selectedText) setEditing(selectedText.id); else openPanel('more') }} />
            <ToolbarBtn label="Card" icon={ToolIcons.card} onClick={() => openPanel('card')} />
            <ToolbarBtn label="Font" icon={<AaIcon small />} onClick={() => openPanel('font')} />
            <ToolbarBtn label="Size" icon={<SizeIcon />} onClick={() => openPanel('size')} />
            <ToolbarBtn label="Color" icon={<span className="ed-tb-dot" style={{ background: (selected && 'color' in selected && selected.color) || '#1a1a1a' }} />}
              onClick={() => openPanel('color')} />
            <ToolbarBtn label="Align" icon={<AlignIcon v={(selectedText?.align ?? 'center') as 'left'} />} onClick={() => openPanel('align')} />
            <ToolbarBtn label="Move" className="ed-tb-desk" icon={<MoveIcon />}
              onClick={() => selected && update(selected.id, { box: { ...selected.box, x: 50 - selected.box.w / 2 } } as Partial<CardElement>)} />
            <ToolbarBtn label="Delete" className="ed-tb-desk" icon={<TrashIcon />} onClick={() => selectedId && remove(selectedId)} />
            <ToolbarBtn label="More" className="ed-tb-mob" icon={<DotsIcon />} onClick={() => openPanel('more')} />
          </div>

          {/* undo / redo used to live in the sidebar, which is hidden on a
              phone — so on the screen where a misplaced sticker is easiest
              to make, there was no way to take it back */}
          <div className="ed-dock-row">
            <div className="ed-history">
              <button className="ed-hist-btn" onClick={undo} disabled={!canUndo} aria-label="Undo" title="Undo">
                <svg viewBox="0 0 22 22" fill="none" aria-hidden>
                  <path d="M4 11a7.4 7.4 0 1 0 2.3-5.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  <path d="M3.4 3.4V8h4.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Undo</span>
              </button>
              <button className="ed-hist-btn" onClick={redo} disabled={!canRedo} aria-label="Redo" title="Redo">
                <svg viewBox="0 0 22 22" fill="none" aria-hidden>
                  <path d="M18 11a7.4 7.4 0 1 1-2.3-5.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  <path d="M18.6 3.4V8H14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Redo</span>
              </button>
            </div>

            <div className="ed-next" ref={nextRef} data-nudge={touched && !editingId ? '' : undefined}>
              <Button variant="dark" size="lg" trailing={<ArrowRight />} onClick={goNext}
                className={touched && !editingId ? 'm-attention' : undefined}>
                Next
              </Button>
            </div>
          </div>
          </div>
        </section>

      </main>

      {/* -------- mobile sheets -------- */}
      {isMobile && sheet && (
        <>
          <button className="ed-scrim" onClick={() => setSheet(null)} aria-label="Close panel" />
          <div className="ed-sheet" role="dialog" aria-modal="true">
            <span className="ed-sheet-grip" />
            {sheet === 'card' && (
              <>
                <h3>Pick a card</h3>
                <TemplatePanel />
              </>
            )}
            {sheet === 'font' && (
              <>
                <h3>Font</h3>
                <FontGrid value={selectedText?.font} onPick={f => selectedText && update(selectedText.id, { font: f } as Partial<CardElement>)} />
              </>
            )}
            {sheet === 'size' && (
              <>
                <h3>Size</h3>
                <TextControls el={selectedText} />
              </>
            )}
            {sheet === 'color' && (
              <>
                <h3>Colour</h3>
                <div className="ep-swatch-grid">
                  {SWATCHES.map(c => (
                    <button key={c} className="ep-sw ep-sw--lg" style={{ background: c }} disabled={!selected}
                      aria-label={`Colour ${c}`}
                      onClick={() => selected && update(selected.id, { color: c } as Partial<CardElement>)} />
                  ))}
                </div>
              </>
            )}
            {sheet === 'align' && (
              <>
                <h3>Align</h3>
                <div className="ep-aligns ep-aligns--lg">
                  {(['left', 'center', 'right'] as const).map(a => (
                    <button key={a} className="ep-align" data-on={selectedText?.align === a ? '' : undefined} disabled={!selectedText}
                      aria-label={`Align ${a}`}
                      onClick={() => selectedText && update(selectedText.id, { align: a } as Partial<CardElement>)}>
                      <AlignIcon v={a} />
                    </button>
                  ))}
                </div>
              </>
            )}
            {sheet === 'more' && (
              <>
                <h3>Add to your card</h3>
                <div className="ed-sheet-tools">
                  {TOOLS.map(t => (
                    <button key={t.key} className="ed-sheet-tool" data-on={tool === t.key ? '' : undefined} onClick={() => setTool(t.key)}>
                      <span>{ToolIcons[t.key]}</span>{t.label}
                    </button>
                  ))}
                </div>
                <div className="ed-sheet-body">
                  {tool === 'card' && <TemplatePanel />}
                  {tool === 'text' && <FontGrid value={selectedText?.font} onPick={f => selectedText && update(selectedText.id, { font: f } as Partial<CardElement>)} />}
                  {tool === 'handwrite' && <HandwritePanel onAdd={(t, f) => { addNote(t, f); setSheet(null) }} />}
                  {tool === 'decorate' && <DecoPanel only={['hearts', 'stars', 'flowers', 'doodles', 'tape', 'retro']} onAdd={addDecoHere} />}
                  {tool === 'stickers' && <DecoPanel only={['stickers', 'stationery']} onAdd={addDecoHere} />}
                  {tool === 'colors' && <ColorPanel el={selected} />}
                  {tool === 'photo' && <PhotoPanel />}
                </div>
                {selectedId && (
                  <button className="ed-sheet-del" onClick={() => { remove(selectedId); setSheet(null) }}>
                    <TrashIcon /> Delete selection
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function ToolbarBtn({ label, icon, onClick, active, accent, className = '' }:
  { label: string; icon: React.ReactNode; onClick?: () => void; active?: boolean; accent?: boolean; className?: string }) {
  return (
    <button className={`ed-tb ${className}`} data-on={active ? '' : undefined} data-accent={accent ? '' : undefined} onClick={onClick}>
      <span className="ed-tb-ico">{icon}</span>
      <span className="ed-tb-label">{label}</span>
    </button>
  )
}
