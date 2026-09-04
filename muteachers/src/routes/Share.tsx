import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TopNav } from '../components/shell/TopNav'
import { StepBar } from '../components/shell/StepBar'
import { CardFlip } from '../components/card/CardFlip'
import { CardCanvas } from '../components/card/CardCanvas'
import { Button } from '../components/ui/Button'
import { Burst, HeartDoodle, Sparkle } from '../components/art/Doodles'
import { getTemplate } from '../lib/templates'
import { saveToLibrary, useCard } from '../lib/store'
import { buildCardLink, canNativeShare, copy, nativeShare, whatsappUrl } from '../lib/share'
import { defaultNote, imageShareText, imageShareTitle, mailto, shareTitle } from '../lib/message'
import { renderCard, saveBlob, saveCardImages, shotFile, type Shot } from '../lib/exportCard'
import { useReveal } from '../lib/useReveal'
import { useAuth } from '../context/AuthContext'
import { saveCardToDb } from '../lib/storage'
import './share.css'

export default function Share() {
  const doc = useCard(s => s.doc)
  const setMeta = useCard(s => s.setMeta)
  const { user, openAuthModal } = useAuth()
  const [flipped, setFlipped] = useState(false)
  const [link, setLink] = useState('')
  const [linkOk, setLinkOk] = useState(true)
  const [note, setNote] = useState(() => defaultNote(doc))
  const [open, setOpen] = useState<null | 'share' | 'print'>(null)
  const [copied, setCopied] = useState(false)
  const [shots, setShots] = useState<Shot[] | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<'' | 'shared' | 'downloaded'>('')
  const [saveErr, setSaveErr] = useState(false)
  const nav = useNavigate()
  const tpl = useMemo(() => getTemplate(doc.templateId), [doc.templateId])
  const exportRef = useRef<HTMLDivElement>(null)
  const page = useReveal<HTMLDivElement>([open])

  /* Save the card, then work out the link to hand out. A stored card only
     needs its slug; if the save failed the whole card has to ride in the
     fragment, which is usually too long to share — `linkOk` says which. */
  useEffect(() => {
    let live = true

    saveCardToDb(doc, user).then(async ({ stored }) => {
      if (!live) return
      const { url, complete } = await buildCardLink(doc, stored)
      if (!live) return
      setLink(url)
      setLinkOk(complete)
      saveToLibrary({
        id: doc.id,
        templateId: doc.templateId,
        link: url,
        to: doc.to,
        createdAt: doc.createdAt,
      })
    }).catch(() => { if (live) setLinkOk(false) })

    return () => { live = false }
  }, [doc, user])

  /* render both sides in the background as soon as the card is final, so
     saving is instant when it is asked for */
  useEffect(() => {
    let live = true
    const id = setTimeout(async () => {
      const root = exportRef.current
      if (!root) return
      try {
        const s = await renderCard(root)
        if (live) setShots(s)
      } catch { /* saving falls back to rendering on demand */ }
    }, 400)
    return () => { live = false; clearTimeout(id) }
  }, [doc])

  /* The suggested message follows the names as they are typed, and stops the
     moment the student makes it their own — nothing they wrote is ever
     overwritten by a later keystroke in the "to" field. */
  const [ownNote, setOwnNote] = useState(false)
  useEffect(() => {
    if (!ownNote) setNote(defaultNote(doc))
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [doc.id, doc.to, doc.from, ownNote])

  const resetNote = useCallback(() => {
    setOwnNote(false)
    setNote(defaultNote(doc))
  }, [doc])

  /* the link exists at all / the link is short enough to send somewhere */
  const ready = !!link
  const sendable = ready && linkOk

  const doCopy = async () => {
    if (!ready) return
    if (await copy(link)) { setCopied(true); setTimeout(() => setCopied(false), 2200) }
  }

  const ensureShots = async () => {
    if (shots) return shots
    const root = exportRef.current
    if (!root) throw new Error('nothing to render')
    const s = await renderCard(root)
    setShots(s)
    return s
  }

  const saveImages = async () => {
    setSaving(true)
    setSaveErr(false)
    try {
      const s = await ensureShots()
      const how = await saveCardImages(s, {
        title: imageShareTitle(doc),
        text: imageShareText(doc, note),
      })
      if (how !== 'cancelled') {
        setSaved(how)
        setTimeout(() => setSaved(''), 3200)
      }
    } catch (e) {
      console.error('Saving the card image failed:', e)
      setSaveErr(true)
      setTimeout(() => setSaveErr(false), 4000)
    } finally { setSaving(false) }
  }

  const saveOne = async (face: 'front' | 'back') => {
    setSaving(true)
    setSaveErr(false)
    try {
      const s = await ensureShots()
      const one = s.find(x => x.face === face)
      if (!one) throw new Error(`no ${face} to save`)
      const f = shotFile(one)
      saveBlob(f, f.name)
    } catch (e) {
      console.error('Saving the card image failed:', e)
      setSaveErr(true)
      setTimeout(() => setSaveErr(false), 4000)
    } finally { setSaving(false) }
  }

  const savedLabel = saved === 'shared' ? 'Sent to your files' : 'Saved to your files'

  return (
    <div className="page sh" ref={page}>
      <TopNav back={{ to: '/preview', label: 'Back' }} />
      <div className="shell sh-steps"><StepBar current="share" /></div>

      <main className="sh-main">
        <aside className="sh-side">
          <h1 className="sh-title">
            It&rsquo;s ready<br />
            <span className="sh-title-2">to make someone</span><br />
            <em>smile!</em>
            <Burst className="sh-title-burst" size={22} />
            <HeartDoodle className="sh-title-heart" size={20} />
          </h1>
          <p className="sh-sub">
            Your card is all set.<br />
            Share it digitally or print it out<br />
            for a more personal touch. <HeartDoodle size={15} className="sh-sub-heart" />
          </p>

          {/* User Sign-in / Attribution Banner */}
          <div className="sh-auth-box">
            {user ? (
              <p className="sh-auth-msg">
                <span className="sh-auth-badge">Published by @{user.username}</span>
                <Link to={`/u/${user.username}`} className="sh-auth-link">View profile &rarr;</Link>
              </p>
            ) : (
              <div className="sh-auth-prompt">
                <p>
                  <strong>Sign in with Google</strong> to track this card on your profile and climb the leaderboard!
                </p>
                <button type="button" onClick={openAuthModal} className="sh-auth-login-btn">
                  <Sparkle size={14} color="var(--gold)" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>

          <div className="sh-next reveal">
            <h2>What&rsquo;s next?</h2>
            <button className="sh-opt" onClick={() => setOpen(o => o === 'share' ? null : 'share')} aria-expanded={open === 'share'}>
              <span className="sh-opt-ico">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M3.4 12a8.6 8.6 0 1 1 4.2 7.4L3.2 20.8l1.4-4.4A8.5 8.5 0 0 1 3.4 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <circle cx="8.6" cy="12" r="1.05" fill="currentColor" /><circle cx="12" cy="12" r="1.05" fill="currentColor" /><circle cx="15.4" cy="12" r="1.05" fill="currentColor" />
                </svg>
              </span>
              <span className="sh-opt-t">Share Digitally<em>Send it instantly to your teacher.</em></span>
              <Chev />
            </button>
            <button className="sh-opt sh-opt--save" onClick={saveImages} disabled={saving}>
              <span className="sh-opt-ico">
                {saved ? (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path className="sh-tick" d="M4.6 12.4 9.8 17.6 19.4 7.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 3.4v11.4M8.2 11l3.8 3.8L15.8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4.4 16.6v2.6a1.4 1.4 0 0 0 1.4 1.4h12.4a1.4 1.4 0 0 0 1.4-1.4v-2.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </span>
              <span className="sh-opt-t">
                {saveErr ? 'Could not save the image'
                  : saved ? savedLabel
                  : saving ? 'Saving the image…'
                  : 'Save the Picture'}
                <em>{saveErr ? 'Something went wrong — try again.'
                  : saved ? 'Both sides, full resolution.'
                  : shots ? 'Both sides as PNGs, straight to your files.'
                  : 'Preparing the image…'}</em>
              </span>
              {saving ? <span className="sh-spin" aria-hidden /> : <Chev />}
            </button>

            <button className="sh-opt" onClick={() => setOpen(o => o === 'print' ? null : 'print')} aria-expanded={open === 'print'}>
              <span className="sh-opt-ico">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M7 9V3.4h10V9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <rect x="3" y="9" width="18" height="8" rx="2.4" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 14h10v6.6H7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="sh-opt-t">Print Your Card<em>Send it to a printer at 5×7&Prime;.</em></span>
              <Chev />
            </button>

            {open === 'share' && (
              <div className="sh-drawer">
                <label className="sh-field">
                  <span>Who is it for?</span>
                  <input value={doc.to} placeholder="Ms. Nair" onChange={e => setMeta({ to: e.target.value })} />
                </label>
                <label className="sh-field">
                  <span>From</span>
                  <input value={doc.from} placeholder="Ananya" onChange={e => setMeta({ from: e.target.value })} />
                </label>
                <label className="sh-field">
                  <span className="sh-note-label">
                    Your message
                    {ownNote && (
                      <button type="button" className="sh-note-reset" onClick={resetNote}>
                        Use the suggested one
                      </button>
                    )}
                  </span>
                  <textarea
                    className="sh-note-input" rows={3} maxLength={300} value={note}
                    aria-label="The message that goes with your card"
                    onChange={e => { setOwnNote(true); setNote(e.target.value) }}
                  />
                  <span className="sh-note-hint">This is what your teacher will read, with the card link underneath.</span>
                </label>

                <div className="sh-link">
                  <input readOnly value={link} aria-label="Card link"
                    placeholder="Preparing your link…"
                    onFocus={e => e.currentTarget.select()} />
                  <button onClick={doCopy} disabled={!ready} className={copied ? 'is-copied' : undefined}>{copied ? 'Copied!' : 'Copy'}</button>
                </div>
                {ready && !linkOk && (
                  <p className="sh-link-warn" role="status">
                    This card could not be saved online, so its link has to carry the whole
                    card and is too long for WhatsApp or email. Use <strong>Save the Picture</strong> and
                    send the images instead.
                  </p>
                )}
                <div className="sh-share-row" data-waiting={ready ? undefined : ''}>
                  <a className="sh-chan sh-chan--wa" data-off={sendable ? undefined : ''}
                    href={sendable ? whatsappUrl(link, note) : undefined}
                    aria-disabled={sendable ? undefined : true}
                    target="_blank" rel="noreferrer">
                    <svg viewBox="0 0 24 24" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.4-1.1-2.7s.7-1.9 1-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4-.1.7.5l.9 2.1c.1.2.1.4 0 .6l-.4.5-.3.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.7-.1l1-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.3.1.2.1.7-.1 1.3Z" fill="currentColor" /></svg>
                    WhatsApp
                  </a>
                  {canNativeShare() && (
                    <button className="sh-chan" disabled={!ready} onClick={() => nativeShare(link, note, shareTitle(doc))}>
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M12 15.4V3.6M8.2 7.2 12 3.4l3.8 3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5.6 11.4v8a1.4 1.4 0 0 0 1.4 1.4h10a1.4 1.4 0 0 0 1.4-1.4v-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                      More apps
                    </button>
                  )}
                  <a className="sh-chan" data-off={sendable ? undefined : ''}
                    aria-disabled={sendable ? undefined : true}
                    href={sendable ? mailto(doc, note, link) : undefined}>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                      <rect x="2.8" y="5" width="18.4" height="14" rx="2.6" stroke="currentColor" strokeWidth="1.6" />
                      <path d="m3.6 7 8.4 6 8.4-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Email
                  </a>
                </div>
              </div>
            )}

            {open === 'print' && (
              <div className="sh-drawer">
                <p className="sh-print-note">
                  Save both sides as high-res images, then print them back-to-back
                  on a 5×7&Prime; piece of cardstock.
                </p>
                <div className="sh-print-actions">
                  <Button variant="dark" size="sm" onClick={() => saveOne('front')} disabled={saving}>Download front</Button>
                  <Button variant="ghost" size="sm" onClick={() => saveOne('back')} disabled={saving}>Download inside</Button>
                </div>
              </div>
            )}
          </div>

          <div className="sh-start-new">
            <button className="sh-new-btn" onClick={() => nav('/pick')}>
              Make another card &rarr;
            </button>
          </div>
        </aside>

        <section className="sh-stage">
          <div className="sh-card-box">
            <CardFlip
              doc={doc}
              template={tpl}
              flipped={flipped}
              onFlip={setFlipped}
              style={{ ['--card-ar' as string]: String(tpl.aspect) }}
            />
            <button className="sh-flip-hint" onClick={() => setFlipped(f => !f)}>
              {flipped ? 'See front' : 'See inside'}
            </button>
          </div>

          <div className="sh-hidden-render" ref={exportRef} aria-hidden>
            <div className="sh-render-side" data-export="front">
              <CardCanvas doc={doc} template={tpl} face="front" mode="view" />
            </div>
            <div className="sh-render-side" data-export="back">
              <CardCanvas doc={doc} template={tpl} face="back" mode="view" />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function Chev() {
  return (
    <svg className="sh-opt-chev" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
