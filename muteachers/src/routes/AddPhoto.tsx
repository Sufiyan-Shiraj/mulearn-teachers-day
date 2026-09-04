import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../components/shell/TopNav'
import { StepBar } from '../components/shell/StepBar'
import { Camera } from '../components/camera/Camera'
import { Button } from '../components/ui/Button'
import { NoteScrap } from '../components/ui/Torn'
import { Burst, CurvedArrow, HeartDoodle, SmileyDoodle, Underline } from '../components/art/Doodles'
import { Decoration } from '../components/art/Decorations'
import { normalizePhoto } from '../lib/image'
import { useCard } from '../lib/store'
import { uploadPhoto } from '../lib/cloudinary'
import { useAuth } from '../context/AuthContext'
import './photo.css'

export default function AddPhoto() {
  const [mode, setMode] = useState<'choose' | 'camera'>('choose')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const file = useRef<HTMLInputElement>(null)
  const nav = useNavigate()
  const { user, loading, openAuthModal } = useAuth()
  const setPhoto = useCard(s => s.setPhoto)
  const photo = useCard(s => s.doc.photo)

  useEffect(() => {
    if (!loading && !user) {
      openAuthModal({
        mode: 'signup',
        title: 'Sign In to Create a Card',
        subtitle: 'Please sign in or create an account to customize your card ✨',
        redirectTo: '/photo',
      })
      nav('/pick', { replace: true })
    }
  }, [user, loading, nav, openAuthModal])

  const accept = async (dataUrl: string) => {
    setPhoto(dataUrl)
    nav('/create')
    // Asynchronously upload to Cloudinary/storage
    uploadPhoto(dataUrl).then(res => {
      if (res.secureUrl && res.secureUrl.startsWith('http')) {
        setPhoto(res.secureUrl)
      }
    }).catch(() => {})
  }

  const onFile = async (f: File | undefined) => {
    if (!f) return
    if (!/^image\//.test(f.type)) { setErr('That file isn’t an image — try a PNG or JPG.'); return }
    if (f.size > 10 * 1024 * 1024) { setErr('That image is over 10MB. Try a smaller one.'); return }
    setErr(''); setBusy(true)
    try { await accept(await normalizePhoto(f)) }
    catch { setErr('We couldn’t read that image. Try another one.') }
    finally { setBusy(false) }
  }

  return (
    <div className="page ph">
      <TopNav back={{ to: '/pick', label: 'Back' }} />
      <div className="shell ph-steps"><StepBar current="photo" /></div>

      {mode === 'choose' ? (
        <main className="shell ph-main">
          <header className="ph-head">
            <p className="ph-eyebrow">Add your moment<Burst className="ph-eyebrow-burst" size={20} /></p>
            <h1 className="ph-title">Upload or take a photo<br />with <em>your teacher</em> <HeartDoodle className="ph-title-heart" size={26} /></h1>
            <p className="ph-sub">This photo will make your card extra special. <HeartDoodle size={15} className="ph-sub-heart" /></p>
          </header>

          <div className="ph-options">
            <section className="ph-card ph-card--light">
              <span className="ph-tape ph-tape--kraft"><Decoration deco="tape-kraft" /></span>
              <span className="ph-ico ph-ico--light">
                <svg viewBox="0 0 34 30" fill="none" aria-hidden>
                  <path d="M9.4 24.6a6.4 6.4 0 0 1-.5-12.8 8.6 8.6 0 0 1 16.6-1.7 5.9 5.9 0 0 1-1 11.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 27.4V13.6M12.4 18l4.6-4.6 4.6 4.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h2>Upload a photo</h2>
              <p>Choose from your gallery<br />or files.</p>
              <Button variant="dark" onClick={() => file.current?.click()} disabled={busy}>
                {busy ? 'Adding…' : 'Choose Photo'}
              </Button>
              <p className="ph-meta">PNG, JPG up to 10MB</p>
              <input
                ref={file} type="file" accept="image/*" className="sr-only"
                onChange={e => onFile(e.target.files?.[0])}
              />
            </section>

            <div className="ph-or">
              <CurvedArrow className="ph-or-arrow" size={62} />
              <span>or</span>
            </div>

            <section className="ph-card ph-card--dark">
              <span className="ph-tape ph-tape--red"><Decoration deco="tape-red" /></span>
              <span className="ph-ico ph-ico--dark">
                <svg viewBox="0 0 32 28" fill="none" aria-hidden>
                  <rect x="1.4" y="5.6" width="29.2" height="21" rx="4" stroke="currentColor" strokeWidth="1.7" />
                  <circle cx="16" cy="16" r="6.2" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M10.4 5.6 12.6 1.4h6.8l2.2 4.2" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                </svg>
              </span>
              <h2>Take a photo</h2>
              <p>Capture a new photo<br />with your teacher.</p>
              <Button variant="gold" onClick={() => setMode('camera')}
                trailing={<span className="ph-spark"><svg viewBox="0 0 22 18" fill="none" aria-hidden><path d="M3 3l4 4M1.6 9H7M4 15l3.6-3.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg></span>}>
                Open Camera
              </Button>
            </section>
          </div>

          {err && <p className="ph-err" role="alert">{err}</p>}

          <p className="ph-tip">
            <em>Tip:</em> A selfie or a candid photo<br />always looks the best! <SmileyDoodle size={16} className="ph-tip-smiley" />
          </p>

          <NoteScrap className="ph-scrap" rotate={2} clip>
            One photo.<br />A thousand<br />memories. <HeartDoodle size={16} className="ph-scrap-heart" />
          </NoteScrap>

          <span className="ph-cap"><Decoration deco="gradcap" /></span>
          <span className="ph-daisy"><Decoration deco="daisy" /></span>
          <span className="ph-star"><Decoration deco="star-gold" /></span>
          <span className="ph-heart-doodle"><HeartDoodle size={60} color="#b9b1a6" /></span>

          {photo && (
            <button className="ph-keep" onClick={() => nav('/create')}>
              <img src={photo} alt="" />
              <span>Keep the photo you already added <Underline width={200} className="ph-keep-ul" /></span>
            </button>
          )}
        </main>
      ) : (
        <main className="shell ph-cam-main">
          <div className="ph-cam-copy">
            <h1 className="ph-cam-title">
              Let&rsquo;s capture<br /><span>a <em>memory</em></span><br />together <HeartDoodle size={24} className="ph-cam-heart" />
              <Underline className="ph-cam-ul" width={170} />
            </h1>
            <p className="ph-cam-sub">Get your favorite teacher in the frame!</p>
            <NoteScrap className="ph-cam-tips" rotate={-2} clip>
              <strong>Tips</strong>
              <span>✓ Find good light</span>
              <span>✓ Hold your smile</span>
              <span>✓ One for the memory</span>
              <SmileyDoodle size={16} className="ph-cam-tips-smiley" />
            </NoteScrap>
            <span className="ph-cam-washi"><Decoration deco="tape-red" /></span>
          </div>

          <div className="ph-cam-stage">
            <Camera onUse={accept} onClose={() => setMode('choose')} lastPhoto={photo} />
            <NoteScrap className="ph-cam-note" rotate={-3}>
              A great photo<br />makes a great<br />card! <HeartDoodle size={15} className="ph-cam-note-heart" />
            </NoteScrap>
          </div>
        </main>
      )}
    </div>
  )
}
