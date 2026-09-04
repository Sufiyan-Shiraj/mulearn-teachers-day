import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../components/shell/TopNav'
import { StepBar } from '../components/shell/StepBar'
import { CardCanvas } from '../components/card/CardCanvas'
import { Button, ArrowRight } from '../components/ui/Button'
import { Burst, StarDoodle } from '../components/art/Doodles'
import { MoveIcon, ToolIcons } from '../components/editor/EditorBits'
import { NamePanel, PhotoPanel, TeacherField, TemplatePanel } from '../components/editor/Panels'
import { getTemplate } from '../lib/templates'
import { scrollIntoView } from '../lib/useReveal'
import { useCard } from '../lib/store'
import { useIsMobile } from '../lib/useIsMobile'
import { useAuth } from '../context/AuthContext'
import type { CardElement } from '../lib/types'
import './editor.css'

type Tool = 'frame' | 'photo' | 'name'
type Sheet = null | 'frame' | 'photo' | 'name'

/* Three things you can change about a selfie: which frame it sits in, how the
   photo is cropped inside it, and the teacher's name. That is the whole tool
   set — the stickers, fonts, colours and hand-written notes belonged to a card. */
const TOOLS: { key: Tool; label: string }[] = [
  { key: 'frame', label: 'Frame' },
  { key: 'photo', label: 'Photo' },
  { key: 'name', label: 'Name' },
]

export default function Editor() {
  const doc = useCard(s => s.doc)
  const selectedId = useCard(s => s.selectedId)
  const editingId = useCard(s => s.editingId)
  const select = useCard(s => s.select)
  const setEditing = useCard(s => s.setEditing)
  const update = useCard(s => s.update)
  const remove = useCard(s => s.remove)
  const undo = useCard(s => s.undo)
  const redo = useCard(s => s.redo)
  const canUndo = useCard(s => s.past.length > 0)
  const canRedo = useCard(s => s.future.length > 0)
  const clearJustAdded = useCard(s => s.clearJustAdded)
  const clearFresh = useCard(s => s.clearFresh)
  const ensurePhotoAspect = useCard(s => s.ensurePhotoAspect)
  const freshId = useCard(s => s.freshId)

  const [tool, setTool] = useState<Tool>('name')
  const [sheet, setSheet] = useState<Sheet>(null)
  const isMobile = useIsMobile()
  const [nudge, setNudge] = useState(false)
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
        subtitle: 'It goes on your selfies and on the leaderboard.',
        redirectTo: '/create',
      })
      nav('/', { replace: true })
    }
  }, [user, loading, nav, openAuthModal])

  const selected = doc.elements.find(e => e.id === selectedId) ?? null

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

  const teacher = doc.elements.find(e => e.kind === 'text')
  const named = !!(teacher && 'text' in teacher && teacher.text.trim())

  /* A selfie with nobody named can't go on the board, so Next asks for the
     name rather than refusing silently — it puts the cursor in the field
     instead of just sitting there greyed out. */
  const goNext = useCallback(() => {
    if (!named) {
      const field = document.getElementById('teacher-name') as HTMLInputElement | null
      field?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      field?.focus()
      setNudge(true)
      setTimeout(() => setNudge(false), 2200)
      return
    }
    setEditing(null)
    select(null)
    nav('/share')
  }, [named, nav, select, setEditing])

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
    frame: 'frame', photo: 'photo', name: 'name',
  }
  const openPanel = (which: Exclude<Sheet, null>) => {
    if (isMobile) setSheet(s => (s === which ? null : which))
    else setTool(SIDEBAR_FOR[which])
  }


  const hint = editingId ? 'Type away — it lands straight on the picture.'
    : selected ? 'Drag to move · corner handles to resize & rotate · pinch on touch.'
    : 'Tap the name to change it. Drag it anywhere. Pinch to resize.'

  return (
    <div className="page ed">
      <TopNav back={{ to: '/photo', label: 'Back' }} />
      <div className="shell ed-steps"><StepBar current="preview" /></div>

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
            {tool === 'frame' && <TemplatePanel />}
            {tool === 'photo' && <PhotoPanel />}
            {tool === 'name' && <NamePanel />}
          </div>
        </aside>

        {/* -------- stage -------- */}
        <section className="ed-stage">
          <TeacherField />
          {nudge && <p className="ed-teacher-nudge" role="status">Pop their name in first — that&rsquo;s what puts you on the board.</p>}

          <div className="ed-card-wrap" style={{ ['--card-ar' as string]: String(tpl.aspect) }} onPointerDown={e => { if (e.target === e.currentTarget) { select(null); setEditing(null) } }}>
            <CardCanvas doc={doc} template={tpl} mode="edit" className="ed-card" />
          </div>

          <p className="ed-hint">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden><path d="M7 9.4V4.6a1.5 1.5 0 0 1 3 0v4M10 8.4V3.6a1.5 1.5 0 0 1 3 0v5M13 8.6V5.8a1.5 1.5 0 0 1 3 0v6.6c0 3.4-2.4 5.6-5.6 5.6-2.6 0-4-1-5.2-2.8L3 12.2a1.5 1.5 0 0 1 2.4-1.8L7 12.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {hint}
          </p>
          <div className="ed-dock">
          {/* -------- contextual toolbar -------- */}
          <div className="ed-toolbar" data-active={selected ? '' : undefined}>
            <ToolbarBtn label="Frame" icon={ToolIcons.frame} onClick={() => openPanel('frame')} />
            <ToolbarBtn label="Photo" icon={ToolIcons.photo} onClick={() => openPanel('photo')} />
            <ToolbarBtn label="Name" active accent icon={<span className="ed-tb-aa">Aa</span>}
              onClick={() => openPanel('name')} />
            <ToolbarBtn label="Center" className="ed-tb-desk" icon={<MoveIcon />}
              onClick={() => {
                if (!selected) return
                const w = Math.min(selected.box.w, 88)
                const h = Math.min(selected.box.h, 88)
                update(selected.id, { box: { x: 50 - w / 2, y: 50 - h / 2, w, h } } as Partial<CardElement>)
              }} />
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

            <div className="ed-next" ref={nextRef} data-nudge={named && touched && !editingId ? '' : undefined} data-blocked={named ? undefined : ''}>
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
            {sheet === 'frame' && (<><h3>Pick a frame</h3><TemplatePanel /></>)}
            {sheet === 'photo' && (<><h3>Your photo</h3><PhotoPanel /></>)}
            {sheet === 'name' && (<><h3>Teacher’s name</h3><NamePanel /></>)}
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
