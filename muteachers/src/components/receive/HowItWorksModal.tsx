import { Logo } from '../shell/Logo'
import { Sparkle } from '../art/Doodles'
import { Decoration } from '../art/Decorations'
import './howItWorksModal.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
}

export function HowItWorksModal({ isOpen, onClose, onContinue }: Props) {
  if (!isOpen) return null

  return (
    <div
      className="hiw-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="hiw-modal">
        {/* Washi Tape Header Accent */}
        <span className="hiw-tape" aria-hidden>
          <Decoration deco="tape-washi" />
        </span>

        <button
          type="button"
          className="hiw-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
            <path
              d="M5 5l10 10M15 5 5 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="hiw-head">
          <Logo height={24} />
          <h2 className="hiw-title">
            Make One For Your Teacher
            <Sparkle size={18} color="var(--gold)" />
          </h2>
          <p className="hiw-desc">
            Surprise your favorite teacher with a personalized vintage selfie card for Teachers’ Day.
          </p>
        </div>

        <div className="hiw-steps">
          <div className="hiw-step">
            <div className="hiw-step-num">1</div>
            <div className="hiw-step-content">
              <h3>Snap or upload a selfie</h3>
              <p>Take a quick photo with your teacher or pick a favorite memory together.</p>
            </div>
          </div>

          <div className="hiw-step">
            <div className="hiw-step-num">2</div>
            <div className="hiw-step-content">
              <h3>Pick a frame & share</h3>
              <p>Choose an aesthetic vintage frame, write their name, and share it instantly to your story or chat.</p>
            </div>
          </div>
        </div>

        <div className="hiw-actions">
          <button
            type="button"
            className="hiw-btn hiw-btn--primary"
            onClick={onContinue}
          >
            <span>Continue</span>
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden>
              <path
                d="M4 10h12M11 5l5 5-5 5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
