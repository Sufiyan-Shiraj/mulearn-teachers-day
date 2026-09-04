import { useCallback, useEffect, useRef, useState } from 'react'
import { grabFrame, normalizePhoto } from '../../lib/image'
import './camera.css'

type Facing = 'user' | 'environment'
type Status = 'idle' | 'starting' | 'live' | 'denied' | 'error' | 'review'

interface Props {
  onUse: (dataUrl: string) => void
  onClose?: () => void
  lastPhoto?: string
}

const isCoarse = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches

export function Camera({ onUse, onClose, lastPhoto }: Props) {
  const video = useRef<HTMLVideoElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const [facing, setFacing] = useState<Facing>(isCoarse() ? 'user' : 'user')
  const [status, setStatus] = useState<Status>('idle')
  const [shot, setShot] = useState<string | null>(null)
  const [torch, setTorch] = useState(false)
  const [hasTorch, setHasTorch] = useState(false)
  const [multi, setMulti] = useState(false)
  const [flash, setFlash] = useState(false)
  const [count, setCount] = useState<number | null>(null)
  const [timerOn, setTimerOn] = useState(false)
  const [grid, setGrid] = useState(false)
  const [settings, setSettings] = useState(false)
  const [msg, setMsg] = useState('')

  const stop = useCallback(() => {
    stream.current?.getTracks().forEach(t => t.stop())
    stream.current = null
  }, [])

  const start = useCallback(async (f: Facing) => {
    stop()
    setStatus('starting')
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: f }, width: { ideal: 1920 }, height: { ideal: 1440 } },
        audio: false,
      })
      stream.current = s
      if (video.current) {
        video.current.srcObject = s
        await video.current.play().catch(() => {})
      }
      const track = s.getVideoTracks()[0]
      const caps = (track.getCapabilities?.() ?? {}) as MediaTrackCapabilities & { torch?: boolean }
      setHasTorch(!!caps.torch)
      setMulti((await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput').length > 1)
      setStatus('live')
    } catch (e) {
      const err = e as DOMException
      if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') setStatus('denied')
      else { setStatus('error'); setMsg(err?.message || 'Camera unavailable') }
    }
  }, [stop])

  useEffect(() => { start(facing); return stop }, [facing, start, stop])

  useEffect(() => {
    const track = stream.current?.getVideoTracks()[0]
    if (!track || !hasTorch) return
    track.applyConstraints({ advanced: [{ torch } as never] }).catch(() => {})
  }, [torch, hasTorch])

  const capture = useCallback(async () => {
    const v = video.current
    if (!v || status !== 'live') return
    setFlash(true)
    setTimeout(() => setFlash(false), 260)
    const raw = grabFrame(v, facing === 'user')
    setShot(await normalizePhoto(raw, 1400, 0.92))
    setStatus('review')
  }, [facing, status])

  const runTimer = useCallback(() => {
    let n = 3
    setCount(n)
    const id = setInterval(() => {
      n -= 1
      if (n === 0) { clearInterval(id); setCount(null); capture() }
      else setCount(n)
    }, 900)
  }, [capture])

  const retake = () => { setShot(null); setStatus('idle'); start(facing) }

  return (
    <div className="cam">
      <div className="cam-stage">
        {status === 'review' && shot ? (
          <img className="cam-shot" src={shot} alt="Captured photo" />
        ) : (
          <>
            <video
              ref={video} className="cam-video" playsInline muted autoPlay
              data-mirror={facing === 'user' ? '' : undefined}
            />
            {grid && <div className="cam-grid" aria-hidden />}
            {status !== 'live' && (
              <div className="cam-state">
                {status === 'starting' && <><Spinner /><p>Waking the camera…</p></>}
                {status === 'denied' && (
                  <>
                    <CamOff />
                    <p className="cam-state-t">Camera access is blocked</p>
                    <p className="cam-state-s">Allow camera in your browser settings, then try again — or upload a photo instead.</p>
                    <button className="cam-retry" onClick={() => start(facing)}>Try again</button>
                  </>
                )}
                {status === 'error' && (
                  <>
                    <CamOff />
                    <p className="cam-state-t">We couldn&rsquo;t open the camera</p>
                    <p className="cam-state-s">{msg}</p>
                    <button className="cam-retry" onClick={() => start(facing)}>Try again</button>
                  </>
                )}
              </div>
            )}
            {count !== null && <div className="cam-count" aria-live="polite">{count}</div>}
          </>
        )}

        {flash && <div className="cam-flash" aria-hidden />}

        {/* top chrome */}
        <div className="cam-top">
          <button
            className="cam-round" data-on={torch ? '' : undefined}
            disabled={!hasTorch || status !== 'live'}
            onClick={() => setTorch(v => !v)}
            aria-label={hasTorch ? 'Toggle flash' : 'Flash not available on this camera'}
            title={hasTorch ? 'Flash' : 'Flash not available'}
          >
            <svg viewBox="0 0 20 20" aria-hidden><path d="M11.6 1.6 4.4 11h4.2l-.6 7.4 7.6-9.8h-4.4Z" fill="currentColor" /></svg>
          </button>

          <span className="cam-chip">
            <svg viewBox="0 0 20 18" aria-hidden fill="none">
              <rect x="1.4" y="4.2" width="17.2" height="12.4" rx="3" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="10" cy="10.4" r="3.4" stroke="currentColor" strokeWidth="1.4" />
              <path d="M6.6 4.2 8 1.6h4l1.4 2.6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            {facing === 'user' ? 'Front Camera' : 'Rear Camera'}
          </span>

          <button className="cam-round" onClick={() => setSettings(v => !v)} aria-label="Camera settings" aria-expanded={settings}>
            <svg viewBox="0 0 22 22" aria-hidden fill="none">
              <path d="M11 14.1a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M17.6 13.4a1.4 1.4 0 0 0 .3 1.6l.1.1a1.7 1.7 0 1 1-2.4 2.4l-.1-.1a1.4 1.4 0 0 0-1.6-.3 1.4 1.4 0 0 0-.9 1.3v.2a1.7 1.7 0 1 1-3.4 0v-.1a1.4 1.4 0 0 0-.9-1.3 1.4 1.4 0 0 0-1.6.3l-.1.1a1.7 1.7 0 1 1-2.4-2.4l.1-.1a1.4 1.4 0 0 0 .3-1.6 1.4 1.4 0 0 0-1.3-.9h-.2a1.7 1.7 0 1 1 0-3.4h.1a1.4 1.4 0 0 0 1.3-.9 1.4 1.4 0 0 0-.3-1.6l-.1-.1a1.7 1.7 0 1 1 2.4-2.4l.1.1a1.4 1.4 0 0 0 1.6.3h.1a1.4 1.4 0 0 0 .9-1.3v-.2a1.7 1.7 0 1 1 3.4 0v.1a1.4 1.4 0 0 0 .9 1.3 1.4 1.4 0 0 0 1.6-.3l.1-.1a1.7 1.7 0 1 1 2.4 2.4l-.1.1a1.4 1.4 0 0 0-.3 1.6v.1a1.4 1.4 0 0 0 1.3.9h.2a1.7 1.7 0 1 1 0 3.4h-.1a1.4 1.4 0 0 0-1.3.9Z"
                stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
            </svg>
          </button>

          {settings && (
            <div className="cam-menu" role="menu">
              <button role="menuitemcheckbox" aria-checked={grid} onClick={() => setGrid(v => !v)}>
                <span>Grid lines</span><Toggle on={grid} />
              </button>
              <button role="menuitemcheckbox" aria-checked={timerOn} onClick={() => setTimerOn(v => !v)}>
                <span>3-second timer</span><Toggle on={timerOn} />
              </button>
              <button role="menuitem" onClick={() => setFacing(f => (f === 'user' ? 'environment' : 'user'))} disabled={!multi}>
                <span>Switch camera</span>
              </button>
            </div>
          )}
        </div>

        {onClose && (
          <button className="cam-close" onClick={() => { stop(); onClose() }} aria-label="Close camera">
            <svg viewBox="0 0 20 20" aria-hidden><path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>
          </button>
        )}
      </div>

      {/* control deck */}
      <div className="cam-deck">
        {status === 'review' ? (
          <>
            <button className="cam-deck-side" onClick={retake}>
              <span className="cam-deck-ico">
                <svg viewBox="0 0 22 22" fill="none" aria-hidden>
                  <path d="M3.6 11a7.4 7.4 0 1 1 2.3 5.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  <path d="M3 6.2v4.6h4.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Retake
            </button>
            <button className="cam-use" onClick={() => { stop(); onUse(shot!) }}>
              Use this photo
              <svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden>
                <path d="M3.6 10.4 8 14.8l8.4-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <div className="cam-deck-side cam-deck-side--last">
              <span className="cam-thumb">
                {lastPhoto ? <img src={lastPhoto} alt="" /> : <span className="cam-thumb-empty" />}
              </span>
              Last photo
            </div>

            <button
              className="cam-shutter" onClick={() => (timerOn ? runTimer() : capture())}
              disabled={status !== 'live'} aria-label="Take photo"
            >
              <span className="cam-shutter-ring">
                <svg viewBox="0 0 24 22" aria-hidden fill="none">
                  <rect x="1.6" y="5" width="20.8" height="15.4" rx="3.4" stroke="currentColor" strokeWidth="1.7" />
                  <circle cx="12" cy="12.7" r="4.4" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M7.6 5 9.3 1.8h5.4L16.4 5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="cam-shutter-spark" aria-hidden>
                <svg viewBox="0 0 26 22"><path d="M3 4 8 8M1.4 11H7M4 18l4.4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" /></svg>
              </span>
              <span className="cam-deck-label">Tap to capture</span>
            </button>

            <button className="cam-deck-side" onClick={() => setFacing(f => (f === 'user' ? 'environment' : 'user'))} disabled={!multi}>
              <span className="cam-deck-ico">
                <svg viewBox="0 0 22 22" fill="none" aria-hidden>
                  <rect x="1.6" y="5" width="18.8" height="13.4" rx="3.2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M7.4 11.6a3.6 3.6 0 0 1 6.2-2.4M14.6 11.6a3.6 3.6 0 0 1-6.2 2.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M13.6 7.2h-1.8v1.8M8.4 16h1.8v-1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Flip camera
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function Toggle({ on }: { on: boolean }) {
  return <span className="cam-toggle" data-on={on ? '' : undefined}><span /></span>
}
function Spinner() {
  return <span className="cam-spin" aria-hidden />
}
function CamOff() {
  return (
    <svg className="cam-off" viewBox="0 0 48 40" fill="none" aria-hidden>
      <rect x="2.4" y="8" width="43.2" height="29" rx="6" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="24" cy="22.5" r="8" stroke="currentColor" strokeWidth="2.2" />
      <path d="M15 8l3-5.6h12L33 8M5 3 44 38" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
