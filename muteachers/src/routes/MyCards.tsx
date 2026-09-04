import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TopNav } from '../components/shell/TopNav'
import { useReveal } from '../lib/useReveal'
import { TabBar } from '../components/shell/TabBar'
import { CardCanvas } from '../components/card/CardCanvas'
import { Button, ButtonLink, SparkIcon } from '../components/ui/Button'
import { HeartDoodle, Sparkle } from '../components/art/Doodles'
import { getTemplate } from '../lib/templates'
import { removeFromLibrary, useCard, type SavedCard } from '../lib/store'
import { copy, loadFromLink } from '../lib/share'
import { useAuth } from '../context/AuthContext'
import { fetchCardFromDb, fetchUserCardsFromDb } from '../lib/storage'
import type { CardDoc } from '../lib/types'
import './mycards.css'

export default function MyCards() {
  const page = useReveal<HTMLDivElement>()
  const [items, setItems] = useState<SavedCard[]>([])
  const [docs, setDocs] = useState<Record<string, CardDoc>>({})
  const [copiedId, setCopiedId] = useState('')
  const loadDoc = useCard(s => s.loadDoc)
  const nav = useNavigate()
  const { user, openAuthModal } = useAuth()

  useEffect(() => {
    let live = true

    fetchUserCardsFromDb(user).then(async (list) => {
      if (!live) return
      setItems(list)

      const pairs = await Promise.all(
        list.map(async i => {
          // 1. Try DB
          const rec = await fetchCardFromDb(i.id)
          if (rec) return [i.id, rec.doc] as const
          // 2. Try link
          const linkDoc = await loadFromLink(i.link)
          return [i.id, linkDoc] as const
        })
      )

      if (live) {
        const m: Record<string, CardDoc> = {}
        for (const [id, d] of pairs) if (d) m[id] = d
        setDocs(m)
      }
    })

    return () => { live = false }
  }, [user])

  return (
    <div className="page mc" ref={page}>
      <TopNav back={{ to: '/', label: 'Back' }} />

      <main className="shell mc-main">
        <header className="mc-head">
          <h1 className="mc-title">My Cards <HeartDoodle size={22} className="mc-title-heart" /></h1>
          <p className="mc-sub">Every card you&rsquo;ve made lives here — reopen it, copy the link, or start a new one.</p>

          {!user && (
            <div className="mc-auth-callout">
              <Sparkle size={18} color="var(--gold)" />
              <p>
                <strong>Want these on your profile?</strong> Add your name and your cards show up on your public profile and the leaderboard.
              </p>
              <button type="button" onClick={openAuthModal} className="mc-auth-btn">
                Add your name
              </button>
            </div>
          )}
        </header>

        {items.length === 0 ? (
          <div className="mc-empty">
            <div className="mc-empty-art">
              <HeartDoodle size={44} color="var(--muted-2)" />
            </div>
            <h2>No cards yet</h2>
            <p>Pick a design, add a photo of you and your teacher, and write something true.</p>
            <ButtonLink to="/photo" variant="dark" size="lg" icon={<SparkIcon />}>Create a Card</ButtonLink>
          </div>
        ) : (
          <ul className="mc-grid stagger">
            {items.map(i => {
              const tpl = getTemplate(i.templateId)
              const doc = docs[i.id]
              return (
                <li key={i.id} className="mc-cell">
                  <button className="mc-card" disabled={!doc} onClick={() => { if (doc) { loadDoc(doc); nav('/preview') } }}>
                    <span className="mc-card-crop">
                      {doc
                        ? <CardCanvas doc={doc} template={tpl} face="front" mode="thumb" />
                        : <span className="mc-card-missing">Loading card…</span>}
                    </span>
                  </button>
                  <div className="mc-meta">
                    <strong>{i.to || tpl.name}</strong>
                    <em>{new Date(i.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</em>
                  </div>
                  <div className="mc-actions">
                    <Link className="mc-act" to={`/c/${i.id}`}>Open</Link>
                    <button className="mc-act" onClick={async () => { if (await copy(i.link)) { setCopiedId(i.id); setTimeout(() => setCopiedId(''), 2000) } }}>
                      {copiedId === i.id ? 'Copied!' : 'Copy link'}
                    </button>
                    <button
                      className="mc-act mc-act--del"
                      onClick={() => {
                        removeFromLibrary(i.id)
                        fetchUserCardsFromDb(user).then(setItems)
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {items.length > 0 && (
          <div className="mc-new">
            <Button variant="dark" size="lg" icon={<SparkIcon />} onClick={() => nav('/photo')}>Make another card</Button>
          </div>
        )}
      </main>

      <TabBar />
    </div>
  )
}
