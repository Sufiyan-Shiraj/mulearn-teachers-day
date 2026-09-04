import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TopNav } from '../components/shell/TopNav'
import { TabBar } from '../components/shell/TabBar'
import { HeartSolid, Paperclip } from '../components/art/Doodles'
import { Decoration } from '../components/art/Decorations'
import { ButtonLink, SparkIcon } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { fetchLeaderboardsFromDb, type LeaderboardUser } from '../lib/storage'
import './leaderboards.css'

type Range = 'week' | 'month' | 'all'

const RANGES: { key: Range; label: string }[] = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
]

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : String(n))

export default function Leaderboards() {
  const [range, setRange] = useState<Range>('week')
  const [rows, setRows] = useState<LeaderboardUser[]>([])
  const [userRank, setUserRank] = useState<LeaderboardUser | undefined>()
  const [loading, setLoading] = useState(true)
  const { user, openAuthModal } = useAuth()

  useEffect(() => {
    let live = true
    setLoading(true)

    fetchLeaderboardsFromDb(range, user).then(res => {
      if (!live) return
      setRows(res.rows)
      setUserRank(res.userRank)
      setLoading(false)
    })

    return () => { live = false }
  }, [range, user])

  // Dynamic podium placement based on real entries count:
  // 3+ entries: 2nd place on left, 1st place in center, 3rd place on right
  // 2 entries: 2nd place on left, 1st place on right
  // 1 entry: 1st place centered
  const podium = rows.length >= 3
    ? [rows[1], rows[0], rows[2]]
    : rows.length === 2
      ? [rows[1], rows[0]]
      : rows.length === 1
        ? [rows[0]]
        : []

  const rest = rows.length > 3 ? rows.slice(3) : []

  return (
    <div className="page lb">
      <TopNav back={{ to: '/', label: 'Back' }} />

      <main className="shell lb-main">
        <header className="lb-head">
          <Confetti />
          <h1 className="lb-title">
            <Crown />
            Leaderboards
          </h1>
          <p className="lb-sub">Create, share and spread smiles! <HeartSolid size={17} color="var(--red)" className="lb-sub-heart" /></p>
          <div className="lb-ranges" role="tablist">
            {RANGES.map(r => (
              <button
                key={r.key}
                role="tab"
                aria-selected={range === r.key}
                className="lb-range"
                data-on={range === r.key ? '' : undefined}
                onClick={() => setRange(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="lb-trophy" aria-hidden>
            <span className="lb-trophy-note">You&rsquo;ve got this!</span>
            <Trophy />
          </div>
        </header>

        {loading && rows.length === 0 ? (
          <div className="lb-loading">
            <span className="lb-spin" />
            <p>Loading leaderboards…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="lb-empty">
            <span className="lb-empty-tape" aria-hidden>
              <Decoration deco="tape-kraft" />
            </span>
            <div className="lb-empty-art">
              <Trophy />
            </div>
            <h2 className="lb-empty-title">No cards ranked yet</h2>
            <p className="lb-empty-desc">
              Be the first to create and share a Teacher&rsquo;s Day tribute card to claim the #1 spot on the leaderboard!
            </p>
            <ButtonLink to="/photo" variant="dark" size="lg" icon={<SparkIcon />}>
              Create a Card
            </ButtonLink>
          </div>
        ) : (
          <>
            <ol className="lb-podium" data-count={rows.length >= 3 ? 3 : rows.length}>
              {podium.map((r, i) => {
                if (!r) return null
                const handleSlug = r.handle.replace(/^@/, '')
                return (
                  <li key={r.handle} className="lb-pod" data-place={r.rank}>
                    <span className="lb-pod-crown" data-place={r.rank}><Crown small /></span>
                    <span className="lb-avatar" data-place={r.rank}>
                      <Avatar name={r.name} avatarUrl={r.avatarUrl} />
                    </span>
                    <span className="lb-pod-plinth" data-place={r.rank}>
                      <span className="lb-pod-num">{r.rank}</span>
                    </span>
                    <Link to={`/u/${handleSlug}`} className="lb-pod-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <strong>{r.name}</strong>
                      <em>{r.handle}</em>
                      <span className="lb-hearts"><HeartSolid size={13} color="var(--red)" />{fmt(r.hearts)}</span>
                    </Link>
                    <span className="sr-only">Rank {r.rank}, position {i + 1}</span>
                  </li>
                )
              })}
            </ol>

            {rest.length > 0 && (
              <div className="lb-list">
                <span className="lb-list-holes" aria-hidden><i /><i /><i /><i /></span>
                {rest.map(r => {
                  const handleSlug = r.handle.replace(/^@/, '')
                  return (
                    <Link
                      key={r.handle}
                      to={`/u/${handleSlug}`}
                      className="lb-row"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <span className="lb-rank">{r.rank}</span>
                      <span className="lb-row-av"><Avatar name={r.name} avatarUrl={r.avatarUrl} /></span>
                      <span className="lb-row-name"><strong>{r.name}</strong><em>{r.handle}</em></span>
                      <span className="lb-row-hearts"><HeartSolid size={16} color="var(--red)" />{r.hearts}</span>
                      {r.note && <span className="lb-note" style={{ background: r.tint }}>{r.note}</span>}
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Your Rank Section */}
        {!user ? (
          <div className="lb-you lb-you--unauth">
            <Paperclip size={16} className="lb-you-clip" />
            <div className="lb-you-unauth-body">
              <span className="lb-you-label">
                Your Rank
                <svg viewBox="0 0 40 16" fill="none" aria-hidden>
                  <path d="M2 3c8 8 22 10 35 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M31 7.4 37.6 11l-4.4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="lb-you-unauth-text">
                Sign in to see your ranking, track appreciation hearts, and climb the leaderboard!
              </p>
              <button
                type="button"
                className="lb-you-signin-btn"
                onClick={() => openAuthModal()}
              >
                Add your name to join
              </button>
            </div>
          </div>
        ) : (
          <div className="lb-you">
            <Paperclip size={16} className="lb-you-clip" />
            <span className="lb-you-label">
              Your Rank
              <svg viewBox="0 0 40 16" fill="none" aria-hidden>
                <path d="M2 3c8 8 22 10 35 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M31 7.4 37.6 11l-4.4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="lb-you-rank">
              {userRank && userRank.hearts > 0 ? `#${userRank.rank}` : '—'}
            </span>
            <span className="lb-row-av">
              <Avatar name={user.displayName || user.username} avatarUrl={user.avatarUrl} />
            </span>
            <span className="lb-row-name">
              <strong>{user.displayName || user.username}</strong>
              <em>@{user.username}</em>
            </span>
            <span className="lb-row-hearts">
              <HeartSolid size={16} color="var(--red)" />
              {userRank?.hearts ?? 0}
            </span>
            <span className="lb-note" style={{ background: userRank?.tint || '#d8c8ea' }}>
              {userRank?.note || (userRank && userRank.hearts > 0 ? 'Keep shining!' : 'Create a card to join the board!')}
            </span>
          </div>
        )}

        <p className="lb-foot">
          <svg viewBox="0 0 22 22" fill="none" aria-hidden><path d="M11 2.4v1.8M4 5.2l1.3 1.3M18 5.2l-1.3 1.3M8.4 15.6h5.2M9 18.4h4M11 5.8a4.8 4.8 0 0 1 2.8 8.7H8.2A4.8 4.8 0 0 1 11 5.8Z" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Keep creating and sharing to climb the leaderboard! <HeartSolid size={14} color="var(--red)" />
        </p>
      </main>

      <TabBar />
    </div>
  )
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="lb-av"
        style={{ objectFit: 'cover' }}
      />
    )
  }

  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('')
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return (
    <span className="lb-av" style={{ background: `linear-gradient(150deg, hsl(${hue} 46% 78%), hsl(${(hue + 40) % 360} 44% 64%))` }}>
      {initials}
    </span>
  )
}

function Crown({ small }: { small?: boolean }) {
  return (
    <svg className={small ? 'lb-crown-s' : 'lb-crown'} viewBox="0 0 40 26" fill="none" aria-hidden>
      <path d="M3 21 5 6l8 7 7-10 7 10 8-7-2 15Z" fill="#f3c64a" stroke="#c99a1e" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="5" cy="5" r="2.4" fill="#f3c64a" /><circle cx="20" cy="2.6" r="2.4" fill="#f3c64a" /><circle cx="35" cy="5" r="2.4" fill="#f3c64a" />
    </svg>
  )
}

function Trophy() {
  return (
    <svg viewBox="0 0 120 130" fill="none" aria-hidden>
      <path d="M32 14h56v34a28 28 0 0 1-56 0Z" fill="#f6c9cb" stroke="#dfa2a6" strokeWidth="2" strokeLinejoin="round" />
      <path d="M32 20H16v8a18 18 0 0 0 16 17M88 20h16v8a18 18 0 0 1-16 17" stroke="#dfa2a6" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 24 65 36l13 .8-10 8.5 3.2 12.7L60 51l-11.2 7 3.2-12.7-10-8.5 13-.8Z" fill="#fff" />
      <path d="M60 76v16M44 100h32l-4-8H48Z" stroke="#dfa2a6" strokeWidth="2" strokeLinejoin="round" fill="#f6c9cb" />
      <rect x="36" y="100" width="48" height="12" rx="3" fill="#f6c9cb" stroke="#dfa2a6" strokeWidth="2" />
    </svg>
  )
}

function Confetti() {
  const bits = Array.from({ length: 22 }, (_, i) => i)
  const colors = ['#f3c64a', '#e88b8f', '#8fc0dd', '#a9d3a1', '#c8a8dd', '#f0a06a']
  return (
    <div className="lb-confetti" aria-hidden>
      {bits.map(i => (
        <span key={i} style={{
          left: `${(i * 37) % 100}%`,
          top: `${(i * 53) % 100}%`,
          background: colors[i % colors.length],
          transform: `rotate(${(i * 47) % 360}deg)`,
          borderRadius: i % 3 === 0 ? '999px' : '2px',
          width: i % 4 === 0 ? 8 : 10,
          height: i % 4 === 0 ? 8 : 6,
        }} />
      ))}
    </div>
  )
}
