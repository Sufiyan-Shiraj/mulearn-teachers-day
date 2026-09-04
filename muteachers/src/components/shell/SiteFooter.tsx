import { Link } from 'react-router-dom'
import { TornEdge } from '../ui/Torn'
import { HeartSolid, Paperclip } from '../art/Doodles'
import './footer.css'

const POINTS = [
  { icon: <LockIcon />, a: 'Your card is', b: 'private & secure' },
  { icon: <PenIcon />, a: 'Write from', b: 'the heart' },
  { icon: <ShareIcon />, a: 'Share instantly', b: 'with your teacher' },
]

export function SiteFooter() {
  return (
    <footer className="ft">
      <div className="shell ft-note-row">
        <div className="ft-scrap">
          <HeartSolid size={22} className="ft-scrap-heart" />
          <p>Can&rsquo;t find what you&rsquo;re looking for?</p>
          <p className="ft-scrap-sub">More styles coming soon! <span className="ft-smiley">☺</span></p>
        </div>
      </div>

      <div className="ft-dark">
        <TornEdge className="ft-tear" fill="#1f1f1f" flip height={54} />
        <div className="shell ft-dark-in">
          <div>
            <p className="ft-made">
              Made with <HeartSolid size={19} color="var(--red-bright)" className="ft-made-heart" /><br />
              by μlearn ASI
            </p>
            <button
              type="button"
              className="ft-replay-btn"
              onClick={() => {
                try { sessionStorage.removeItem('mulearn_intro_seen') } catch {}
                window.dispatchEvent(new Event('mulearn_replay_preloader'))
              }}
              title="Watch the handcrafted stationery studio intro"
            >
              ✨ Replay Studio Intro
            </button>
          </div>
          <ul className="ft-points">
            {POINTS.map(p => (
              <li key={p.b}>
                <span className="ft-point-icon">{p.icon}</span>
                <span className="ft-point-text">{p.a}<br />{p.b}</span>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/pick" className="ft-card-scrap">
          <Paperclip size={18} className="ft-card-clip" />
          <span>One card.<br />A thousand<br />memories. <HeartSolid size={16} color="var(--red)" /></span>
        </Link>
      </div>
    </footer>
  )
}

function LockIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="4.5" y="10.5" width="15" height="10.5" rx="2.4" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8 10.5V7.6a4 4 0 0 1 8 0v2.9" stroke="currentColor" strokeWidth="1.4" />
  </svg>
}
function PenIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 20l1.2-4.4L16 4.8a2.4 2.4 0 0 1 3.4 3.4L8.6 18.9 4 20Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
}
function ShareIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 15V8h11M11.5 4 16 8l-4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 9v11H8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}
