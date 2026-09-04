import { isSupabaseConfigured, supabase, type UserProfile } from './supabase'
import type { CardDoc } from './types'
import { library, saveToLibrary, type SavedCard } from './store'
import { decodeCard } from './share'

export interface CardRecord {
  doc: CardDoc
  creator?: {
    name: string
    username: string
    avatarUrl?: string
  }
  likeCount: number
  slug: string
}

export interface LeaderboardUser {
  rank: number
  name: string
  handle: string
  hearts: number
  avatarUrl?: string
  note?: string
  tint?: string
  isCurrentUser?: boolean
}



export interface SaveResult {
  slug: string
  /**
   * true once the card is readable by anyone else. Only then can a link be
   * just the slug — until it is, the whole card has to travel in the URL,
   * and the share sheet has to know the difference.
   */
  stored: boolean
}

/**
 * Save a card to Supabase (and local storage library).
 *
 * postgrest reports failures in `error` rather than throwing, so the result
 * is checked explicitly — silently returning a slug for a row that was never
 * written hands the recipient a dead link.
 */
export async function saveCardToDb(doc: CardDoc, user?: UserProfile | null): Promise<SaveResult> {
  // Always save locally first
  const shareLink = `${window.location.origin}/c/${doc.id}`
  saveToLibrary({
    id: doc.id,
    templateId: doc.templateId,
    link: shareLink,
    to: doc.to,
    createdAt: doc.createdAt,
  })

  if (!isSupabaseConfigured) return { slug: doc.id, stored: false }

  try {
    const payload: any = {
      teacher_name: doc.to || 'My Teacher',
      message: doc.from ? `From ${doc.from}` : 'Happy Teachers Day',
      photo_url: doc.photo || '',
      share_slug: doc.id,
      custom_config: { doc },
      updated_at: new Date().toISOString(),
    }

    if (user?.id && !user.id.startsWith('demo-')) {
      payload.owner_id = user.id
    }

    const { error } = await supabase.from('cards').upsert(payload, { onConflict: 'share_slug' })
    if (error) {
      console.warn('Supabase card save failed:', error.message)
      return { slug: doc.id, stored: false }
    }
    return { slug: doc.id, stored: true }
  } catch (e) {
    console.warn('Supabase card save warning:', e)
    return { slug: doc.id, stored: false }
  }
}

/**
 * Fetch a card by ID / slug from Supabase (fallback to hash token or local storage)
 */
export async function fetchCardFromDb(idOrSlug: string): Promise<CardRecord | null> {
  // 1. Try Supabase
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select(`
          id,
          share_slug,
          teacher_name,
          message,
          photo_url,
          like_count,
          custom_config,
          created_at,
          users (display_name, username, avatar_url)
        `)
        .eq('share_slug', idOrSlug)
        .single()

      if (!error && data) {
        const storedDoc = (data.custom_config as any)?.doc as CardDoc | undefined
        const doc: CardDoc = storedDoc || {
          id: data.share_slug,
          templateId: 'velvet',
          elements: [],
          to: data.teacher_name,
          from: data.message.replace(/^From /, ''),
          photo: data.photo_url,
          createdAt: new Date(data.created_at).getTime(),
          updatedAt: new Date(data.created_at).getTime(),
        }

        const creator = data.users
          ? {
              name: (data.users as any).display_name || 'mulearn Student',
              username: (data.users as any).username || 'student',
              avatarUrl: (data.users as any).avatar_url,
            }
          : undefined

        return {
          doc,
          creator,
          likeCount: data.like_count || 0,
          slug: data.share_slug,
        }
      }
    } catch (e) {
      console.warn('Supabase fetch card error:', e)
    }
  }

  // 2. Try hash token if present in location
  if (typeof window !== 'undefined' && window.location.hash) {
    const hash = window.location.hash.slice(1)
    const d = await decodeCard(hash)
    if (d) {
      return {
        doc: d,
        likeCount: 0,
        slug: d.id,
      }
    }
  }

  return null
}

/**
 * Increment the like count of a card
 */
export async function likeCardInDb(slug: string): Promise<number> {
  let newCount = 1

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('increment_card_likes', { target_slug: slug })
      if (!error && typeof data === 'number') {
        newCount = data
      } else {
        // Fallback direct update
        const { data: current } = await supabase.from('cards').select('like_count').eq('share_slug', slug).single()
        const count = (current?.like_count || 0) + 1
        await supabase.from('cards').update({ like_count: count }).eq('share_slug', slug)
        newCount = count
      }
    } catch {
      // Offline fallback
    }
  }

  return newCount
}

/**
 * Fetch all cards for the logged-in user
 */
export async function fetchUserCardsFromDb(user?: UserProfile | null): Promise<SavedCard[]> {
  const localList = library()

  if (!isSupabaseConfigured || !user?.id || user.id.startsWith('demo-')) {
    return localList
  }

  try {
    const { data, error } = await supabase
      .from('cards')
      .select('id, share_slug, teacher_name, created_at, custom_config')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const cloudCards: SavedCard[] = data.map(row => ({
        id: row.share_slug || row.id,
        templateId: (row.custom_config as any)?.doc?.templateId || 'velvet',
        link: `${window.location.origin}/c/${row.share_slug || row.id}`,
        to: row.teacher_name || '',
        createdAt: new Date(row.created_at).getTime(),
      }))

      // Merge cloud and local, avoiding duplicates
      const seen = new Set<string>()
      const merged: SavedCard[] = []

      for (const c of [...cloudCards, ...localList]) {
        if (!seen.has(c.id)) {
          seen.add(c.id)
          merged.push(c)
        }
      }

      return merged
    }
  } catch (e) {
    console.warn('Error fetching user cards:', e)
  }

  return localList
}

/**
 * Fetch real leaderboard rankings from Supabase (aggregated by real card likes)
 */
export async function fetchLeaderboardsFromDb(
  range: 'week' | 'month' | 'all',
  currentUser?: UserProfile | null,
): Promise<{ rows: LeaderboardUser[]; userRank?: LeaderboardUser }> {
  if (!isSupabaseConfigured) {
    return { rows: [] }
  }

  try {
    let query = supabase
      .from('cards')
      .select(`
        id,
        owner_id,
        like_count,
        created_at,
        users (id, display_name, username, avatar_url)
      `)

    if (range === 'week') {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('created_at', oneWeekAgo)
    } else if (range === 'month') {
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('created_at', oneMonthAgo)
    }

    const { data, error } = await query

    if (!error && data && data.length > 0) {
      // Group by registered user
      const userMap = new Map<string, {
        userId: string
        name: string
        handle: string
        avatarUrl?: string
        hearts: number
        cardCount: number
      }>()

      for (const row of data) {
        const u = row.users as any
        const uid = row.owner_id || u?.id
        if (!uid) continue

        const likes = Number(row.like_count) || 0
        const existing = userMap.get(uid)

        if (existing) {
          existing.hearts += likes
          existing.cardCount += 1
        } else {
          userMap.set(uid, {
            userId: uid,
            name: u?.display_name || u?.username || 'Creator',
            handle: `@${u?.username || 'creator'}`,
            avatarUrl: u?.avatar_url || undefined,
            hearts: likes,
            cardCount: 1,
          })
        }
      }

      // Rank by hearts descending, then cardCount descending
      const sorted = Array.from(userMap.values()).sort((a, b) => {
        if (b.hearts !== a.hearts) return b.hearts - a.hearts
        return b.cardCount - a.cardCount
      })

      // Map to LeaderboardUser (100% real data)
      const rows: LeaderboardUser[] = sorted.map((entry, idx) => ({
        rank: idx + 1,
        name: entry.name,
        handle: entry.handle,
        hearts: entry.hearts,
        avatarUrl: entry.avatarUrl,
        isCurrentUser: currentUser?.id === entry.userId,
      }))

      // Real user rank for current user
      let userRank: LeaderboardUser | undefined
      if (currentUser) {
        const found = rows.find(r => r.isCurrentUser || r.handle.toLowerCase() === `@${currentUser.username.toLowerCase()}`)
        if (found) {
          userRank = found
        } else {
          userRank = {
            rank: 0,
            name: currentUser.displayName || currentUser.username,
            handle: `@${currentUser.username}`,
            avatarUrl: currentUser.avatarUrl,
            hearts: 0,
            isCurrentUser: true,
            note: 'Create a card to join the board!',
            tint: '#d8c8ea',
          }
        }
      }

      return { rows, userRank }
    }
  } catch (e) {
    console.warn('Leaderboard fetch error:', e)
  }

  // If no rows found in this timeframe
  let userRank: LeaderboardUser | undefined
  if (currentUser) {
    userRank = {
      rank: 0,
      name: currentUser.displayName || currentUser.username,
      handle: `@${currentUser.username}`,
      avatarUrl: currentUser.avatarUrl,
      hearts: 0,
      isCurrentUser: true,
      note: 'Create a card to claim the #1 spot!',
      tint: '#d8c8ea',
    }
  }

  return { rows: [], userRank }
}

/**
 * Fetch creator public profile and their cards
 */
export async function fetchUserProfileFromDb(username: string): Promise<{
  user: UserProfile
  cards: CardDoc[]
  totalHearts: number
} | null> {
  if (isSupabaseConfigured) {
    try {
      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (!userError && userRow) {
        const { data: cardRows } = await supabase
          .from('cards')
          .select('custom_config, like_count')
          .eq('owner_id', userRow.id)

        const cards: CardDoc[] = []
        let totalHearts = 0

        for (const c of cardRows || []) {
          totalHearts += c.like_count || 0
          if ((c.custom_config as any)?.doc) {
            cards.push((c.custom_config as any).doc)
          }
        }

        return {
          user: {
            id: userRow.id,
            email: userRow.email,
            displayName: userRow.display_name || 'Student',
            username: userRow.username,
            avatarUrl: userRow.avatar_url,
            createdAt: userRow.created_at,
          },
          cards,
          totalHearts,
        }
      }
    } catch (e) {
      console.warn('Error loading user profile:', e)
    }
  }

  // Fallback for demo user
  if (username === 'mulearn_student') {
    return {
      user: {
        id: 'demo-user-123',
        email: 'student.mulearn@gmail.com',
        displayName: 'mulearn Student',
        username: 'mulearn_student',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      cards: [],
      totalHearts: 340,
    }
  }

  return null
}
