import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TopNav } from '../components/shell/TopNav'
import { StepBar } from '../components/shell/StepBar'
import { CardCanvas } from '../components/card/CardCanvas'
import { Button } from '../components/ui/Button'
import { Burst, HeartDoodle, Sparkle } from '../components/art/Doodles'
import { getTemplate } from '../lib/templates'
import { saveToLibrary, useCard } from '../lib/store'
import { buildCardLink, canNativeShare, copy, nativeShare, whatsappUrl } from '../lib/share'
import { defaultNote, imageShareText, imageShareTitle, mailto, shareTitle } from '../lib/message'
import { FORMATS, canShareFiles, prefersShareSheet, renderCard, reframe, saveBlob, saveCardImages, shotFile, type FormatKey, type Shot } from '../lib/exportCard'
import { useReveal } from '../lib/useReveal'
import { useAuth } from '../context/AuthContext'
import { saveCardToDb } from '../lib/storage'
import './share.css'

export default function Share() {
  const doc = useCard(s => s.doc)
  const setMeta = useCard(s => s.setMeta)
  const { user, openAuthModal } = useAuth()
  const [link, setLink] = useState('')
  const [linkOk, setLinkOk] = useState(true)
  const [note, setNote] = useState(() => defaultNote(doc))
  const [open, setOpen] = useState<null | 'share' | 'print' | 'download'>(null)
  const [copied, setCopied] = useState(false)
  const [shot, setShot] = useState<Shot | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<'' | 'shared' | 'downloaded'>('')
  const [saveErr, setSaveErr] = useState(false)
  const [format, setFormat] = useState<FormatKey>('story')
  const [waModalOpen, setWaModalOpen] = useState(false)
  const [instaModalOpen, setInstaModalOpen] = useState(false)
  const [waNote, setWaNote] = useState(() => defaultNote(doc))
  const [instaFormat, setInstaFormat] = useState<FormatKey>('story')
  const [sharingWa, setSharingWa] = useState(false)
  const [sharingInsta, setSharingInsta] = useState(false)
  const [instaCopied, setInstaCopied] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const nav = useNavigate()
  const tpl = useMemo(() => getTemplate(doc.templateId), [doc.templateId])
  const exportRef = useRef<HTMLDivElement>(null)
  const page = useReveal<HTMLDivElement>([open])

  /* Save the selfie, then work out the link to hand out. A stored one only
     needs its slug; if the save failed the whole thing has to ride in the
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

  /* render in the background as soon as the selfie is final, so
     saving is instant when it is asked for */
  useEffect(() => {
    let live = true
    const id = setTimeout(async () => {
      const root = exportRef.current
      if (!root) return
      try {
        const s = await renderCard(root)
        if (live) setShot(s)
      } catch { /* saving falls back to rendering on demand */ }
    }, 400)
    return () => { live = false; clearTimeout(id) }
  }, [doc])

  /* The suggested message follows the names as they are typed, and stops the
     moment the student makes it their own — nothing they wrote is ever
     overwritten by a later keystroke in the "to" field. */
  const [ownNote, setOwnNote] = useState(false)
  useEffect(() => {
    if (!ownNote) {
      const d = defaultNote(doc)
      setNote(d)
      setWaNote(d)
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [doc.id, doc.to, doc.from, ownNote])

  const resetNote = useCallback(() => {
    setOwnNote(false)
    const d = defaultNote(doc)
    setNote(d)
    setWaNote(d)
  }, [doc])

  const resetWaNote = useCallback(() => {
    setWaNote(defaultNote(doc))
  }, [doc])

  /* the link exists at all / the link is short enough to send somewhere */
  const fallbackLink = useMemo(() => {
    return typeof window !== 'undefined' ? `${window.location.origin}/c/${doc.id}` : ''
  }, [doc.id])
  const activeLink = link || fallbackLink
  const ready = !!activeLink
  const sendable = ready && linkOk

  const doCopy = async () => {
    if (!ready) return
    if (await copy(activeLink)) { setCopied(true); setTimeout(() => setCopied(false), 2200) }
  }

  const ensureShot = async () => {
    if (shot) return shot
    const root = exportRef.current
    if (!root) throw new Error('nothing to render')
    const s = await renderCard(root)
    setShot(s)
    return s
  }

  const saveImages = async () => {
    setSaving(true)
    setSaveErr(false)
    try {
      const how = await saveCardImages([await reframe(await ensureShot(), format)], {
        title: imageShareTitle(doc),
        text: imageShareText(doc, note),
      })
      if (how !== 'cancelled') {
        setSaved(how)
        setTimeout(() => setSaved(''), 3200)
      }
    } catch (e) {
      console.error('Saving the selfie failed:', e)
      setSaveErr(true)
      setTimeout(() => setSaveErr(false), 4000)
    } finally { setSaving(false) }
  }

  const savePrint = async () => {
    setSaving(true)
    setSaveErr(false)
    try {
      const f = shotFile(await ensureShot())
      saveBlob(f, f.name)
    } catch (e) {
      console.error('Saving the selfie failed:', e)
      setSaveErr(true)
      setTimeout(() => setSaveErr(false), 4000)
    } finally { setSaving(false) }
  }

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setSaved('shared')
    setTimeout(() => {
      setSaved('')
      setToastMsg('')
    }, 3800)
  }

  const shareToWhatsApp = async () => {
    setSharingWa(true)
    setSaveErr(false)
    try {
      const storyShot = await reframe(await ensureShot(), 'story')
      const targetName = (doc.to || 'teacher').trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase()
      const file = shotFile(storyShot, `teachers-day-${targetName}`)
      const messageText = (waNote || note).trim()
      const fullText = activeLink ? `${messageText}\n\n${activeLink}` : messageText

      if (prefersShareSheet() && canShareFiles([file])) {
        await navigator.share({
          files: [file],
          title: imageShareTitle(doc),
          text: fullText,
        })
        setWaModalOpen(false)
        showToast('Shared to WhatsApp!')
      } else {
        saveBlob(file, file.name)
        window.open(whatsappUrl(activeLink, messageText), '_blank', 'noreferrer')
        setWaModalOpen(false)
        showToast('Card saved & WhatsApp opened!')
      }
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') {
        console.error('WhatsApp share failed:', e)
        setSaveErr(true)
        setTimeout(() => setSaveErr(false), 4000)
      }
    } finally {
      setSharingWa(false)
    }
  }

  const shareToInstagram = async () => {
    setSharingInsta(true)
    setSaveErr(false)
    try {
      const storyShot = await reframe(await ensureShot(), instaFormat)
      const targetName = (doc.to || 'teacher').trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase()
      const file = shotFile(storyShot, `teachers-day-${targetName}-instagram`)
      const messageText = (waNote || note).trim()
      const fullText = activeLink ? `${messageText}\n\n${activeLink}` : messageText

      if (activeLink) {
        await copy(fullText)
      } else {
        await copy(messageText)
      }

      if (prefersShareSheet() && canShareFiles([file])) {
        await navigator.share({
          files: [file],
          title: imageShareTitle(doc),
        })
        setInstaModalOpen(false)
        showToast('Caption copied! Choose Stories or Chats in Instagram')
      } else {
        saveBlob(file, file.name)
        window.open('https://www.instagram.com/', '_blank', 'noreferrer')
        setInstaModalOpen(false)
        showToast('Card saved & caption copied! Open Instagram')
      }
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') {
        console.error('Instagram share failed:', e)
        setSaveErr(true)
        setTimeout(() => setSaveErr(false), 4000)
      }
    } finally {
      setSharingInsta(false)
    }
  }

  const copyInstaText = async () => {
    const messageText = (waNote || note).trim()
    const fullText = activeLink ? `${messageText}\n\n${activeLink}` : messageText
    if (await copy(fullText)) {
      setInstaCopied(true)
      setTimeout(() => setInstaCopied(false), 2200)
    }
  }

  const savedLabel = toastMsg || (saved === 'shared' ? 'Opened in your app!' : 'Saved to your files')

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
            Send it, or print it. <HeartDoodle size={15} className="sh-sub-heart" />
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
                  <strong>Add your name</strong> to put this on your profile and climb the leaderboard!
                </p>
                <button type="button" onClick={openAuthModal} className="sh-auth-login-btn">
                  <Sparkle size={14} color="var(--gold)" />
                  <span>Add your name</span>
                </button>
              </div>
            )}
          </div>

          <div className="sh-next reveal">
            <h2>Share with your teacher</h2>

            {/* Direct Instant Native Social Hub */}
            <div className="sh-native-share-hub">
              <div className="sh-native-grid sh-native-grid--duo">
                {/* 1. WhatsApp Button */}
                <button
                  type="button"
                  className="sh-native-btn sh-native-btn--wa"
                  onClick={() => setWaModalOpen(true)}
                  title="Customize message and share to WhatsApp"
                >
                  <span className="sh-native-btn-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Zm0 3.67c2.2 0 4.26.86 5.82 2.42 1.55 1.56 2.41 3.63 2.41 5.83 0 4.54-3.69 8.23-8.23 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31C4.24 16.9 3.8 15.38 3.8 11.91c.01-4.54 3.7-8.24 8.24-8.24Zm-2.9 3.35c-.19 0-.49.07-.75.35-.25.28-.97.95-.97 2.32 0 1.37 1 2.69 1.14 2.88.14.19 1.94 2.95 4.69 4.14.66.28 1.16.45 1.57.58.66.21 1.26.18 1.73.11.53-.08 1.62-.66 1.85-1.31.23-.65.23-1.2.16-1.32-.07-.12-.26-.19-.54-.33-.28-.14-1.65-.82-1.9-.91-.26-.09-.44-.14-.63.14-.18.28-.71.91-.87 1.1-.16.18-.32.21-.6.07-.28-.14-1.18-.44-2.24-1.39-.83-.74-1.4-1.65-1.56-1.93-.16-.28-.02-.43.12-.57.13-.13.29-.34.43-.5.14-.16.19-.28.28-.46.09-.19.05-.35-.02-.49-.07-.14-.65-1.57-.88-2.13-.23-.55-.46-.47-.63-.48-.16-.01-.35-.01-.38.13Z" />
                    </svg>
                  </span>
                  <span className="sh-native-btn-text">
                    <strong>WhatsApp</strong>
                    <small>Chats &amp; Status</small>
                  </span>
                </button>

                {/* 2. Instagram Button */}
                <button
                  type="button"
                  className="sh-native-btn sh-native-btn--insta"
                  onClick={() => setInstaModalOpen(true)}
                  title="Share card to Instagram Stories or Direct"
                >
                  <span className="sh-native-btn-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </span>
                  <span className="sh-native-btn-text">
                    <strong>Instagram</strong>
                    <small>Stories &amp; DMs</small>
                  </span>
                </button>
              </div>

              {/* Quick utility actions */}
              <div className="sh-quick-actions">
                <button
                  type="button"
                  className={`sh-btn-quick ${copied ? 'is-copied' : ''}`}
                  onClick={doCopy}
                  disabled={!ready}
                >
                  {copied ? (
                    <svg viewBox="0 0 24 24" fill="none" className="sh-btn-ico" aria-hidden>
                      <path d="M4.6 12.4 9.8 17.6 19.4 7.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="sh-btn-ico" aria-hidden>
                      <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  )}
                  <span>{copied ? 'Link Copied!' : 'Copy Card Link'}</span>
                </button>

                <button
                  type="button"
                  className="sh-btn-quick"
                  disabled={!ready}
                  onClick={() => {
                    if (canNativeShare()) {
                      nativeShare(activeLink, waNote || note, shareTitle(doc))
                    } else {
                      doCopy()
                    }
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="sh-btn-ico" aria-hidden>
                    <path d="M12 15.4V3.6M8.2 7.2 12 3.4l3.8 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5.6 11.4v8a1.4 1.4 0 0 0 1.4 1.4h10a1.4 1.4 0 0 0 1.4-1.4v-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <span>{canNativeShare() ? 'More Apps…' : 'Share Options'}</span>
                </button>
              </div>

              {/* Toast Feedback */}
              {(saved || saveErr) && (
                <div className={`sh-toast ${saveErr ? 'sh-toast--err' : ''}`} role="status">
                  {saveErr ? (
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16 }} aria-hidden>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 8v5M12 16v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16 }} aria-hidden>
                      <path d="M4.6 12.4 9.8 17.6 19.4 7.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <span>{saveErr ? 'Could not prepare picture — please try again.' : savedLabel}</span>
                </div>
              )}
            </div>

            <button className="sh-opt" onClick={() => setOpen(o => o === 'share' ? null : 'share')} aria-expanded={open === 'share'}>
              <span className="sh-opt-ico">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M3.4 12a8.6 8.6 0 1 1 4.2 7.4L3.2 20.8l1.4-4.4A8.5 8.5 0 0 1 3.4 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <circle cx="8.6" cy="12" r="1.05" fill="currentColor" /><circle cx="12" cy="12" r="1.05" fill="currentColor" /><circle cx="15.4" cy="12" r="1.05" fill="currentColor" />
                </svg>
              </span>
              <span className="sh-opt-t">Personalize Message &amp; Details<em>Customize what your teacher reads.</em></span>
              <Chev />
            </button>

            <button className="sh-opt" onClick={() => setOpen(o => o === 'download' ? null : 'download')} aria-expanded={open === 'download'}>
              <span className="sh-opt-ico">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 3.4v11.4M8.2 11l3.8 3.8L15.8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.4 16.6v2.6a1.4 1.4 0 0 0 1.4 1.4h12.4a1.4 1.4 0 0 0 1.4-1.4v-2.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <span className="sh-opt-t">Save Image to Device<em>Download high-res image in Story, Post, or Card size.</em></span>
              <Chev />
            </button>

            <button className="sh-opt" onClick={() => setOpen(o => o === 'print' ? null : 'print')} aria-expanded={open === 'print'}>
              <span className="sh-opt-ico">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M7 9V3.4h10V9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <rect x="3" y="9" width="18" height="8" rx="2.4" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 14h10v6.6H7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="sh-opt-t">Print it<em>Give your teacher a real copy.</em></span>
              <Chev />
            </button>

            {open === 'share' && (
              <div className="sh-drawer">
                <label className="sh-field">
                  <span>Who is it for?</span>
                  <input value={doc.to} placeholder="Your teacher’s name" onChange={e => setMeta({ to: e.target.value })} />
                </label>
                <label className="sh-field">
                  <span>From</span>
                  <input value={doc.from} placeholder="Your name" onChange={e => setMeta({ from: e.target.value })} />
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
                    aria-label="The message that goes with your selfie"
                    onChange={e => { setOwnNote(true); setNote(e.target.value) }}
                  />
                  <span className="sh-note-hint">This is what your teacher will read, with the link underneath.</span>
                </label>

                <div className="sh-link">
                  <input readOnly value={link} aria-label="Link to this selfie"
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

            {open === 'download' && (
              <div className="sh-drawer">
                <p className="sh-print-note">
                  Choose a crop format and download the picture to your files:
                </p>
                <div className="sh-formats" role="group" aria-label="Shape to save in">
                  {(Object.keys(FORMATS) as FormatKey[]).map(k => (
                    <button key={k} className="sh-format" data-on={format === k ? '' : undefined}
                      onClick={() => setFormat(k)} aria-pressed={format === k}>
                      <span className="sh-format-box" data-shape={k} aria-hidden />
                      {FORMATS[k].label}
                    </button>
                  ))}
                </div>
                <button className="sh-post-btn" onClick={saveImages} disabled={saving}>
                  {saving ? (
                    <>
                      <span className="sh-spin sh-spin--light" aria-hidden />
                      <span>Saving image…</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" className="sh-btn-ico" aria-hidden>
                        <path d="M12 3.4v11.4M8.2 11l3.8 3.8L15.8 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4.4 16.6v2.6a1.4 1.4 0 0 0 1.4 1.4h12.4a1.4 1.4 0 0 0 1.4-1.4v-2.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                      <span>Download {FORMATS[format].label} PNG</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {open === 'print' && (
              <div className="sh-drawer">
                <p className="sh-print-note">
                  Download it at full resolution and print it as a 4×6&Prime; photo —
                  the kind that ends up taped inside a staffroom cupboard.
                </p>
                <div className="sh-print-actions">
                  <Button variant="dark" size="sm" onClick={savePrint} disabled={saving}>Download the photo</Button>
                </div>
              </div>
            )}
          </div>

          <div className="sh-start-new">
            <button className="sh-new-btn" onClick={() => nav('/photo')}>
              Go get another &rarr;
            </button>
          </div>
        </aside>

        <section className="sh-stage">
          <div className="sh-stage-badge">
            <span>Your Card Preview</span>
          </div>
          <div className="sh-card-box">
            <CardCanvas doc={doc} template={tpl} mode="view" className="sh-card" />
          </div>
        </section>
      </main>

      {/* Kept outside the animated stage on purpose. It is position: fixed so
          it costs no layout — but a transform anywhere above it turns that
          into position: absolute, and its two full-size card faces then add
          thousands of pixels of empty scroll to the page. */}
      <div className="sh-hidden-render" ref={exportRef} aria-hidden>
        <div className="sh-render-side" data-export>
          <CardCanvas doc={doc} template={tpl} mode="view" />
        </div>
      </div>

      {/* ---------------- WhatsApp Customization Modal ---------------- */}
      {waModalOpen && (
        <div className="sh-modal-portal" role="dialog" aria-modal="true" aria-labelledby="wa-modal-title">
          <div className="sh-modal-backdrop" onClick={() => !sharingWa && setWaModalOpen(false)} />
          <div className="sh-bottom-sheet">
            <div className="sh-sheet-handle" aria-hidden />
            <div className="sh-sheet-head">
              <div className="sh-sheet-head-info">
                <span className="sh-sheet-badge sh-sheet-badge--wa">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Zm0 3.67c2.2 0 4.26.86 5.82 2.42 1.55 1.56 2.41 3.63 2.41 5.83 0 4.54-3.69 8.23-8.23 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31C4.24 16.9 3.8 15.38 3.8 11.91c.01-4.54 3.7-8.24 8.24-8.24Z" />
                  </svg>
                  WhatsApp
                </span>
                <h3 id="wa-modal-title" className="sh-sheet-title">Share with your teacher</h3>
              </div>
              <button
                type="button"
                className="sh-sheet-close"
                onClick={() => setWaModalOpen(false)}
                disabled={sharingWa}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="sh-sheet-body">
              {/* Card recipient info banner */}
              <div className="sh-sheet-card-tag">
                <div className="sh-sheet-card-mini">
                  <CardCanvas doc={doc} template={tpl} mode="thumb" />
                </div>
                <div className="sh-sheet-card-info">
                  <strong>{doc.to ? `Card for ${doc.to}` : 'Teacher’s Day Card'}</strong>
                  <span>High-res card image included</span>
                </div>
                <span className="sh-sheet-attach-check">✓ Image Attached</span>
              </div>

              {/* Message customization */}
              <div className="sh-sheet-field">
                <div className="sh-sheet-field-head">
                  <label htmlFor="wa-custom-note">Personalize message caption</label>
                  <button type="button" className="sh-sheet-reset-btn" onClick={resetWaNote}>
                    Reset to default
                  </button>
                </div>
                <textarea
                  id="wa-custom-note"
                  className="sh-sheet-textarea"
                  rows={4}
                  value={waNote}
                  onChange={e => setWaNote(e.target.value)}
                  placeholder="Write a sweet note..."
                />
                <p className="sh-sheet-hint">
                  This note will travel with the card image as its caption in chats or on your Status.
                </p>
              </div>
            </div>

            <div className="sh-sheet-foot">
              <button
                type="button"
                className="sh-sheet-action-btn sh-sheet-action-btn--wa"
                onClick={shareToWhatsApp}
                disabled={sharingWa}
              >
                {sharingWa ? (
                  <>
                    <span className="sh-spin sh-spin--light" aria-hidden />
                    <span>Preparing card…</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z" />
                    </svg>
                    <span>Send to WhatsApp</span>
                  </>
                )}
              </button>
              <p className="sh-sheet-subtip">You can select <strong>My Status</strong> or any <strong>Chat</strong> in WhatsApp</p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Instagram Share Modal ---------------- */}
      {instaModalOpen && (
        <div className="sh-modal-portal" role="dialog" aria-modal="true" aria-labelledby="insta-modal-title">
          <div className="sh-modal-backdrop" onClick={() => !sharingInsta && setInstaModalOpen(false)} />
          <div className="sh-bottom-sheet">
            <div className="sh-sheet-handle" aria-hidden />
            <div className="sh-sheet-head">
              <div className="sh-sheet-head-info">
                <span className="sh-sheet-badge sh-sheet-badge--insta">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  Instagram
                </span>
                <h3 id="insta-modal-title" className="sh-sheet-title">Post to Instagram</h3>
              </div>
              <button
                type="button"
                className="sh-sheet-close"
                onClick={() => setInstaModalOpen(false)}
                disabled={sharingInsta}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="sh-sheet-body">
              {/* Format selection */}
              <div className="sh-format-picker">
                <button
                  type="button"
                  className={`sh-format-pill ${instaFormat === 'story' ? 'is-active' : ''}`}
                  onClick={() => setInstaFormat('story')}
                >
                  <span className="sh-format-pill-ratio">9:16</span>
                  <span className="sh-format-pill-label">Story / Status</span>
                </button>
                <button
                  type="button"
                  className={`sh-format-pill ${instaFormat === 'square' ? 'is-active' : ''}`}
                  onClick={() => setInstaFormat('square')}
                >
                  <span className="sh-format-pill-ratio">1:1</span>
                  <span className="sh-format-pill-label">Feed Post / DM</span>
                </button>
              </div>

              {/* Caption preview & copy box */}
              <div className="sh-caption-box">
                <div className="sh-caption-box-head">
                  <span>Card Link &amp; Caption</span>
                  <button type="button" className="sh-caption-copy-btn" onClick={copyInstaText}>
                    {instaCopied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="sh-caption-snippet">{waNote || note}</p>
                {activeLink && <span className="sh-caption-link">{activeLink}</span>}
              </div>

              <div className="sh-sheet-tip-box">
                <Sparkle size={15} color="#e1306c" />
                <span>
                  When Instagram opens, choose <strong>Stories</strong> or <strong>Chats</strong>. Your link is already copied to paste in the story link sticker or DM!
                </span>
              </div>
            </div>

            <div className="sh-sheet-foot">
              <button
                type="button"
                className="sh-sheet-action-btn sh-sheet-action-btn--insta"
                onClick={shareToInstagram}
                disabled={sharingInsta}
              >
                {sharingInsta ? (
                  <>
                    <span className="sh-spin sh-spin--light" aria-hidden />
                    <span>Preparing image…</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                    <span>Open in Instagram</span>
                  </>
                )}
              </button>
              <p className="sh-sheet-subtip">Card image will be loaded directly into Instagram</p>
            </div>
          </div>
        </div>
      )}
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
