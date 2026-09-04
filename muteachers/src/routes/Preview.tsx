import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../components/shell/TopNav'
import { StepBar } from '../components/shell/StepBar'
import { CardFlip } from '../components/card/CardFlip'
import { Button, ArrowRight } from '../components/ui/Button'
import { Burst, HeartDoodle } from '../components/art/Doodles'
import { Decoration } from '../components/art/Decorations'
import { AaIcon, ToolIcons } from '../components/editor/EditorBits'
import { getTemplate } from '../lib/templates'
import { useCard } from '../lib/store'
import { useReveal } from '../lib/useReveal'
import './preview.css'

export default function Preview() {
  const doc = useCard(s => s.doc)
  const setFace = useCard(s => s.setFace)
  const [flipped, setFlipped] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [rot, setRot] = useState(0)
  const nav = useNavigate()
  const tpl = useMemo(() => getTemplate(doc.templateId), [doc.templateId])
  const page = useReveal<HTMLDivElement>()

  const toEditor = (face: 'front' | 'back') => { setFace(face); nav('/create') }

  return (
    <div className="page pv" ref={page}>
      <TopNav back={{ to: '/create', label: 'Back to editor' }} />
      <div className="shell pv-steps"><StepBar current="preview" /></div>

      <main className="pv-main">
        <aside className="pv-side">
          <h1 className="pv-title">Almost there!<Burst className="pv-title-burst" size={18} /></h1>
          <p className="pv-sub">Take a last look before you send it.</p>

          <div className="pv-faces">
            <button className="pv-face" data-on={!flipped ? '' : undefined} onClick={() => setFlipped(false)}>
              <span className="pv-face-ico">{ToolIcons.photo}</span>Front of card
            </button>
            <button className="pv-face" data-on={flipped ? '' : undefined} onClick={() => setFlipped(true)}>
              <span className="pv-face-ico">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="2.6" y="4.4" width="18.8" height="15.2" rx="3" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M6.6 9.4h10M6.6 13h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>Inside of card
            </button>
          </div>

          <div className="pv-tools">
            <button className="pv-tool" onClick={() => setRot(r => (r + 90) % 360)}>
              <svg viewBox="0 0 22 22" fill="none" aria-hidden>
                <path d="M4 11a7.4 7.4 0 1 0 2.3-5.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M3.4 3.4V8h4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Rotate
            </button>
            <div className="pv-zoom">
              <span className="pv-tool-ico">
                <svg viewBox="0 0 22 22" fill="none" aria-hidden>
                  <circle cx="9.6" cy="9.6" r="6.6" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M14.4 14.4 19 19M7 9.6h5.2M9.6 7v5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <span className="pv-zoom-label">Zoom</span>
              <span className="pv-zoom-val">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.max(60, z - 10))} aria-label="Zoom out">−</button>
              <button onClick={() => setZoom(z => Math.min(140, z + 10))} aria-label="Zoom in">+</button>
            </div>
          </div>

          <button className="pv-nudge" onClick={() => setFlipped(true)}>
            <HeartDoodle size={19} className="pv-nudge-heart" />
            <span className="pv-nudge-t">Looks perfect?</span>
            <span className="pv-nudge-s">Let&rsquo;s add your<br />personal touch inside.</span>
            <ArrowRight size={19} />
          </button>

          <span className="pv-daisy"><Decoration deco="daisy" /></span>
        </aside>

        <section className="pv-stage">
          <div className="pv-card-hold" style={{ width: `${zoom}%`, ['--card-ar' as string]: String(tpl.aspect) }}>
            <CardFlip
              doc={doc} template={tpl} flipped={flipped} onFlip={setFlipped}
              className="pv-card" style={{ transform: `rotate(${rot}deg)` }}
            />
          </div>

          <div className="pv-pager">
            <button onClick={() => setFlipped(false)} disabled={!flipped} aria-label="Front of card">
              <svg viewBox="0 0 14 14" aria-hidden><path d="M9 2 4 7l5 5" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <span>{flipped ? 2 : 1} / 2</span>
            <button onClick={() => setFlipped(true)} disabled={flipped} aria-label="Inside of card">
              <svg viewBox="0 0 14 14" aria-hidden><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </section>

        <aside className="pv-quick">
          <button onClick={() => toEditor(flipped ? 'back' : 'front')}>
            <span>{ToolIcons.handwrite}</span>Edit
          </button>
          <button onClick={() => toEditor(flipped ? 'back' : 'front')}>
            <span><AaIcon /></span>Text
          </button>
          <button onClick={() => toEditor('front')}>
            <span>{ToolIcons.photo}</span>Photo
          </button>
          <button onClick={() => toEditor(flipped ? 'back' : 'front')}>
            <span>{ToolIcons.decorate}</span>Decor
          </button>
        </aside>

        <div className="pv-next">
          <Button
            variant={flipped ? 'crimson' : 'dark'} size="lg" trailing={<ArrowRight />}
            onClick={() => (flipped ? nav('/share') : setFlipped(true))}
          >
            {flipped ? 'Next: Share' : 'Next: Inside'}
          </Button>
        </div>
      </main>
    </div>
  )
}
