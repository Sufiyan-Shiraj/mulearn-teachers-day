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
  const [sharingStatus, setSharingStatus] = useState(false)
  const [sharingInsta, setSharingInsta] = useState(false)
  const [sharingSnap, setSharingSnap] = useState(false)
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
    if (!ownNote) setNote(defaultNote(doc))
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [doc.id, doc.to, doc.from, ownNote])

  const resetNote = useCallback(() => {
    setOwnNote(false)
    setNote(defaultNote(doc))
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

  const shareWhatsAppStatus = async () => {
    setSharingStatus(true)
    setSaveErr(false)
    try {
      const storyShot = await reframe(await ensureShot(), 'story')
      const targetName = (doc.to || 'teacher').trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase()
      const file = shotFile(storyShot, `teachers-day-${targetName}-status`)

      if (prefersShareSheet() && canShareFiles([file])) {
        await navigator.share({
          files: [file],
          title: imageShareTitle(doc),
          text: note || imageShareText(doc, note),
        })
        showToast('Choose WhatsApp → My Status!')
      } else {
        saveBlob(file, file.name)
        window.open('https://web.whatsapp.com/', '_blank', 'noreferrer')
        showToast('Status card saved! Upload to WhatsApp Status')
      }
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') {
        console.error('WhatsApp status share failed:', e)
        setSaveErr(true)
        setTimeout(() => setSaveErr(false), 4000)
      }
    } finally {
      setSharingStatus(false)
    }
  }

  const shareInstaStory = async () => {
    setSharingInsta(true)
    setSaveErr(false)
    try {
      const storyShot = await reframe(await ensureShot(), 'story')
      const targetName = (doc.to || 'teacher').trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase()
      const file = shotFile(storyShot, `teachers-day-${targetName}-insta-story`)

      if (prefersShareSheet() && canShareFiles([file])) {
        await navigator.share({
          files: [file],
          title: imageShareTitle(doc),
        })
        showToast('Choose Instagram Stories!')
      } else {
        saveBlob(file, file.name)
        if (activeLink) copy(activeLink)
        window.open('https://www.instagram.com/', '_blank', 'noreferrer')
        showToast('Story image saved! Card link copied')
      }
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') {
        console.error('Instagram story share failed:', e)
        setSaveErr(true)
        setTimeout(() => setSaveErr(false), 4000)
      }
    } finally {
      setSharingInsta(false)
    }
  }

  const shareSnapchat = async () => {
    setSharingSnap(true)
    setSaveErr(false)
    try {
      const storyShot = await reframe(await ensureShot(), 'story')
      const targetName = (doc.to || 'teacher').trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase()
      const file = shotFile(storyShot, `teachers-day-${targetName}-snap`)

      if (prefersShareSheet() && canShareFiles([file])) {
        await navigator.share({
          files: [file],
          title: imageShareTitle(doc),
        })
        showToast('Choose Snapchat!')
      } else {
        saveBlob(file, file.name)
        window.open('https://web.snapchat.com/', '_blank', 'noreferrer')
        showToast('Snap card saved! Open Snapchat to send')
      }
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') {
        console.error('Snapchat share failed:', e)
        setSaveErr(true)
        setTimeout(() => setSaveErr(false), 4000)
      }
    } finally {
      setSharingSnap(false)
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
              <div className="sh-native-grid">
                {/* 1. WhatsApp Message */}
                <a
                  className="sh-native-btn sh-native-btn--wa-msg"
                  href={sendable ? whatsappUrl(activeLink, note) : undefined}
                  data-off={sendable ? undefined : ''}
                  aria-disabled={sendable ? undefined : true}
                  target="_blank"
                  rel="noreferrer"
                  title="Send card and note to WhatsApp chat"
                >
                  <span className="sh-native-btn-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Zm0 3.67c2.2 0 4.26.86 5.82 2.42 1.55 1.56 2.41 3.63 2.41 5.83 0 4.54-3.69 8.23-8.23 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31C4.24 16.9 3.8 15.38 3.8 11.91c.01-4.54 3.7-8.24 8.24-8.24Zm-2.9 3.35c-.19 0-.49.07-.75.35-.25.28-.97.95-.97 2.32 0 1.37 1 2.69 1.14 2.88.14.19 1.94 2.95 4.69 4.14.66.28 1.16.45 1.57.58.66.21 1.26.18 1.73.11.53-.08 1.62-.66 1.85-1.31.23-.65.23-1.2.16-1.32-.07-.12-.26-.19-.54-.33-.28-.14-1.65-.82-1.9-.91-.26-.09-.44-.14-.63.14-.18.28-.71.91-.87 1.1-.16.18-.32.21-.6.07-.28-.14-1.18-.44-2.24-1.39-.83-.74-1.4-1.65-1.56-1.93-.16-.28-.02-.43.12-.57.13-.13.29-.34.43-.5.14-.16.19-.28.28-.46.09-.19.05-.35-.02-.49-.07-.14-.65-1.57-.88-2.13-.23-.55-.46-.47-.63-.48-.16-.01-.35-.01-.38.13Z" />
                    </svg>
                  </span>
                  <span className="sh-native-btn-text">
                    <strong>WhatsApp Msg</strong>
                    <small>Chat &amp; Link</small>
                  </span>
                </a>

                {/* 2. WhatsApp Status */}
                <button
                  type="button"
                  className="sh-native-btn sh-native-btn--wa-status"
                  onClick={shareWhatsAppStatus}
                  disabled={sharingStatus || saving}
                  title="Share 9:16 portrait card to WhatsApp Status"
                >
                  <span className="sh-native-btn-icon">
                    {sharingStatus ? (
                      <span className="sh-spin sh-spin--light" aria-hidden />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="6 3.5" />
                        <path d="M12 6.5c-3 0-5.5 2.5-5.5 5.5 0 1 .3 1.9.8 2.7L6.5 17.5l2.9-.8c.8.5 1.7.8 2.6.8 3 0 5.5-2.5 5.5-5.5S15 6.5 12 6.5Zm2.7 7.7c-.1.3-.6.6-.9.6-.3 0-.6.1-1.8-.4-1.5-.7-2.5-2.2-2.6-2.3-.1-.1-.6-.8-.6-1.5 0-.7.4-1 .6-1.2.1-.1.3-.2.4-.2h.3c.1 0 .2 0 .4.3.1.3.5 1.1.5 1.2 0 .1 0 .2 0 .3l-.2.3-.2.2c-.1.1-.1.2 0 .3.1.2.5.7 1 1.1.7.6 1.1.8 1.3.9.2.1.3 0 .4-.1l.6-.6c.1-.2.2-.1.4-.1l1 .5c.2.1.3.1.3.2 0 .1 0 .3-.1.6Z" fill="currentColor" />
                      </svg>
                    )}
                  </span>
                  <span className="sh-native-btn-text">
                    <strong>WhatsApp Status</strong>
                    <small>{sharingStatus ? 'Preparing…' : '9:16 Story'}</small>
                  </span>
                </button>

                {/* 3. Instagram Story */}
                <button
                  type="button"
                  className="sh-native-btn sh-native-btn--insta"
                  onClick={shareInstaStory}
                  disabled={sharingInsta || saving}
                  title="Share full 9:16 card to Instagram Stories"
                >
                  <span className="sh-native-btn-icon">
                    {sharingInsta ? (
                      <span className="sh-spin sh-spin--light" aria-hidden />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
                      </svg>
                    )}
                  </span>
                  <span className="sh-native-btn-text">
                    <strong>Insta Story</strong>
                    <small>{sharingInsta ? 'Preparing…' : '9:16 Story'}</small>
                  </span>
                </button>

                {/* 4. Snapchat */}
                <button
                  type="button"
                  className="sh-native-btn sh-native-btn--snap"
                  onClick={shareSnapchat}
                  disabled={sharingSnap || saving}
                  title="Share 9:16 card to Snapchat Snap or Story"
                >
                  <span className="sh-native-btn-icon">
                    {sharingSnap ? (
                      <span className="sh-spin sh-spin--dark" aria-hidden />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.002 2c-3.8 0-6.2 2.7-6.2 6.5 0 .9.2 2.1.6 2.9.1.2.1.3 0 .4-.1.1-.3.2-.6.3-.7.3-1.6.7-1.7 1.6-.1.6.3 1.1 1.1 1.4.8.4 1.9.5 2.4.2.2-.1.4-.1.6 0 .3.2.8.6 1.7.7.8.1 1.4-.2 2-.5.6.3 1.2.6 2 .5.9-.1 1.4-.5 1.7-.7.2-.1.4-.1.6 0 .5.3 1.6.2 2.4-.2.8-.3 1.2-.8 1.1-1.4-.1-.9-1-1.3-1.7-1.6-.3-.1-.5-.2-.6-.3-.1-.1-.1-.2 0-.4.4-.8.6-2 .6-2.9 0-3.8-2.4-6.5-6.2-6.5Z" />
                      </svg>
                    )}
                  </span>
                  <span className="sh-native-btn-text">
                    <strong>Snapchat</strong>
                    <small>{sharingSnap ? 'Preparing…' : 'Snap &amp; Story'}</small>
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
                      nativeShare(activeLink, note, shareTitle(doc))
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
