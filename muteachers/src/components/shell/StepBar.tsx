import { Link } from 'react-router-dom'
import './stepbar.css'

export const STEPS = [
  { key: 'photo', label: 'Selfie', to: '/photo' },
  { key: 'preview', label: 'Preview', to: '/create' },
  { key: 'share', label: 'Share', to: '/share' },
] as const

export type StepKey = typeof STEPS[number]['key']

export function StepBar({ current }: { current: StepKey }) {
  const idx = STEPS.findIndex(s => s.key === current)
  return (
    <nav className="sb" aria-label="Progress">
      <ol className="sb-list">
        {STEPS.map((s, i) => {
          const state = i < idx ? 'done' : i === idx ? 'active' : 'todo'
          const inner = (
            <>
              <span className="sb-dot">
                {state === 'done'
                  ? <svg viewBox="0 0 16 16" aria-hidden><path d="M3.6 8.4 6.5 11.4 12.4 5" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  : i + 1}
              </span>
              <span className="sb-label">{s.label}</span>
            </>
          )
          return (
            <li key={s.key} className="sb-item" data-state={state}>
              {i > 0 && <span className="sb-line" data-lit={i <= idx ? '' : undefined} data-half={i === idx + 1 ? '' : undefined} />}
              {i < idx
                ? <Link to={s.to} className="sb-node">{inner}</Link>
                : <div className="sb-node" aria-current={state === 'active' ? 'step' : undefined}>{inner}</div>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
