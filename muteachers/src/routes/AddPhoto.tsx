import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../components/shell/TopNav'
import { StepBar } from '../components/shell/StepBar'
import { Camera } from '../components/camera/Camera'
import { NoteScrap } from '../components/ui/Torn'
import { HeartDoodle, SmileyDoodle, Underline } from '../components/art/Doodles'
import { Decoration } from '../components/art/Decorations'
import { normalizePhoto } from '../lib/image'
import { useCard } from '../lib/store'
import { uploadPhoto } from '../lib/cloudinary'
import { useAuth } from '../context/AuthContext'
import './photo.css'

export default function AddPhoto() {
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
        title: 'First — what’s your name?',
        subtitle: 'It goes on the photo so your teacher knows who it’s from.',
        redirectTo: '/photo',
      })
      nav('/', { replace: true })
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
      <TopNav back={{ to: '/', label: 'Back' }} />
      <div className="shell ph-steps"><StepBar current="photo" /></div>

      <main className="shell ph-cam-main">
        <div className="ph-cam-copy">
          <h1 className="ph-cam-title">
            Take a <em>selfie</em><br />with your teacher
            <HeartDoodle size={24} className="ph-cam-heart" />
            <Underline className="ph-cam-ul" width={170} />
          </h1>
          <NoteScrap className="ph-cam-tips" rotate={-2} clip>
            <strong>Tips</strong>
            <span>&#10003; Find good light</span>
            <span>&#10003; Hold your smile</span>
            <span>&#10003; One for the memory</span>
            <SmileyDoodle size={16} className="ph-cam-tips-smiley" />
          </NoteScrap>
          <span className="ph-cam-washi"><Decoration deco="tape-red" /></span>
        </div>

        <div className="ph-cam-stage">
          <Camera onUse={accept} lastPhoto={photo} />

          {/* the quieter way in, for anyone who already has the photo */}
          <div className="ph-upload">
            <button type="button" className="ph-upload-link" onClick={() => file.current?.click()} disabled={busy}>
              {busy ? 'Adding your photo…' : 'or upload an image'}
            </button>
            <input
              ref={file} type="file" accept="image/*" className="sr-only"
              onChange={e => onFile(e.target.files?.[0])}
            />
            {err && <p className="ph-err" role="alert">{err}</p>}
            {photo && (
              <button className="ph-keep" onClick={() => nav('/create')}>
                <img src={photo} alt="" />
                <span>Keep the photo you already added <Underline width={200} className="ph-keep-ul" /></span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
