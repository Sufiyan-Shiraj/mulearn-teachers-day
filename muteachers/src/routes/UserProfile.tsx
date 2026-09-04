import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TopNav } from '../components/shell/TopNav'
import { TabBar } from '../components/shell/TabBar'
import { CardCanvas } from '../components/card/CardCanvas'
import { ButtonLink, SparkIcon } from '../components/ui/Button'
import { HeartDoodle, HeartSolid, Sparkle } from '../components/art/Doodles'
import { Decoration } from '../components/art/Decorations'
import { getTemplate } from '../lib/templates'
import { fetchUserProfileFromDb } from '../lib/storage'
import type { UserProfile as UserProfileType } from '../lib/supabase'
import type { CardDoc } from '../lib/types'
import './profile.css'

export default function UserProfile() {
  const { username = '' } = useParams()
  const [profile, setProfile] = useState<UserProfileType | null>(null)
  const [cards, setCards] = useState<CardDoc[]>([])
  const [totalHearts, setTotalHearts] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let live = true
    if (!username) return

    setLoading(true)
    fetchUserProfileFromDb(username).then(res => {
      if (!live) return
      if (res) {
        setProfile(res.user)
        setCards(res.cards)
        setTotalHearts(res.totalHearts)
      }
      setLoading(false)
    })

    return () => { live = false }
  }, [username])

  const displayName = profile?.displayName || username.replace(/_/g, ' ')

  return (
    <div className="page up">
      <TopNav back={{ to: '/', label: 'Back' }} />

      <main className="shell up-main">
        {/* Profile Header Scrapbook Card */}
        <header className="up-card">
          <span className="up-tape" aria-hidden>
            <Decoration deco="tape-kraft" />
          </span>

          <div className="up-user">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt={displayName} className="up-avatar" />
            ) : (
              <span className="up-avatar up-avatar--init">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}

            <div className="up-details">
              <h1 className="up-name">
                {displayName} <Sparkle size={18} color="var(--gold)" />
              </h1>
              <p className="up-handle">@{username}</p>
              <p className="up-tag">mulearn ASI student club member</p>
            </div>
          </div>

          <div className="up-stats">
            <div className="up-stat">
              <strong>{cards.length}</strong>
              <span>Cards</span>
            </div>
            <div className="up-stat">
              <strong className="up-stat-hearts">
                <HeartSolid size={18} color="var(--red)" />
                {totalHearts}
              </strong>
              <span>Hearts</span>
            </div>
          </div>
        </header>

        {/* User's Created Cards Section */}
        <section className="up-cards-section">
          <div className="up-section-head">
            <h2>
              Cards by {displayName} <HeartDoodle size={20} className="up-head-heart" />
            </h2>
            <p>Every appreciation card published by @{username}</p>
          </div>

          {loading ? (
            <div className="up-loading">
              <span className="up-spin" />
              <p>Finding cards…</p>
            </div>
          ) : cards.length === 0 ? (
            <div className="up-empty">
              <div className="up-empty-art">
                <HeartDoodle size={40} color="var(--muted-2)" />
              </div>
              <h3>No cards published yet</h3>
              <p>@{username} hasn&rsquo;t published any cards yet, or they might be private.</p>
              <ButtonLink to="/photo" variant="dark" size="lg" icon={<SparkIcon />}>
                Make a Card
              </ButtonLink>
            </div>
          ) : (
            <ul className="up-grid">
              {cards.map(doc => {
                const tpl = getTemplate(doc.templateId)
                return (
                  <li key={doc.id} className="up-grid-cell">
                    <Link to={`/c/${doc.id}`} className="up-card-link" title={`View card for ${doc.to || 'Teacher'}`}>
                      <span className="up-card-crop">
                        <CardCanvas doc={doc} template={tpl} face="front" mode="thumb" />
                      </span>
                    </Link>
                    <div className="up-card-meta">
                      <strong>{doc.to || tpl.name}</strong>
                      <em>{new Date(doc.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</em>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </main>

      <TabBar />
    </div>
  )
}
