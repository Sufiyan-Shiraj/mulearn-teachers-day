import { CardData, CardTemplate, LeaderboardEntry, UserProfile } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';
import { TEMPLATE_REGISTRY } from '@/templates/registry';

const LOCAL_CARDS_KEY = 'mulearn_user_created_cards_v2';

export function getLocalCards(): CardData[] {
  if (typeof window === 'undefined') return [];
  // Purge legacy mock data
  if (localStorage.getItem('mulearn_local_cards')) {
    localStorage.removeItem('mulearn_local_cards');
  }
  const stored = localStorage.getItem(LOCAL_CARDS_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveLocalCard(card: CardData): CardData {
  const cards = getLocalCards();
  const index = cards.findIndex(c => c.id === card.id || c.shareSlug === card.shareSlug);
  if (index >= 0) {
    cards[index] = card;
  } else {
    cards.unshift(card);
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_CARDS_KEY, JSON.stringify(cards));
  }
  return card;
}

export function deleteLocalCard(id: string): boolean {
  const cards = getLocalCards().filter(c => c.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_CARDS_KEY, JSON.stringify(cards));
  }
  return true;
}

/**
 * Fetch all active templates from registry
 */
export async function fetchTemplates(): Promise<CardTemplate[]> {
  return TEMPLATE_REGISTRY.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    previewImageUrl: t.previewImageUrl,
    bgType: 'image' as const,
    bgImageUrl: t.baseImageUrl || t.previewImageUrl,
    badgeText: t.badgeText,
    isNew: t.isNew,
    isPopular: t.isPopular,
    defaultConfig: {
      teacherName: '',
      message: 'Happy Teachers Day!',
      titleText: 'HAPPY TEACHERS DAY',
      fontFamily: t.teacherNamePlacement.defaultFont,
      textColor: t.teacherNamePlacement.defaultColor,
      textSize: t.teacherNamePlacement.defaultSize,
      textAlign: 'center',
      stickers: [],
      insideMessage: '',
      insideBgColor: t.insideBgColor,
      insideTextColor: t.insideTextColor,
      photoPosition: { x: 0, y: 0, scale: 1, rotation: 0 },
    },
  }));
}

/**
 * Fetch single card by share slug
 */
export async function fetchCardBySlug(slug: string): Promise<CardData | null> {
  const localCard = getLocalCards().find(c => c.shareSlug === slug);
  if (!isSupabaseConfigured) {
    return localCard || null;
  }

  try {
    const { data, error } = await supabase
      .from('cards')
      .select(`
        *,
        users (display_name, username, avatar_url),
        templates (name)
      `)
      .eq('share_slug', slug)
      .single();

    if (error || !data) {
      return localCard || null;
    }

    return {
      id: data.id,
      ownerId: data.owner_id,
      ownerName: data.users?.display_name || 'mulearn Student',
      ownerUsername: data.users?.username || 'student',
      ownerAvatar: data.users?.avatar_url,
      templateId: data.template_id || 'template-maroon-party',
      templateName: data.templates?.name || 'Party Sparkle Maroon',
      teacherName: data.teacher_name,
      message: data.message,
      photoUrl: data.photo_url,
      photoPublicId: data.photo_public_id,
      shareSlug: data.share_slug,
      likeCount: data.like_count || 0,
      customConfig: data.custom_config || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch {
    return localCard || null;
  }
}

/**
 * Fetch cards by username
 */
export async function fetchCardsByUsername(username: string): Promise<CardData[]> {
  const localCards = getLocalCards().filter(c => c.ownerUsername === username);
  if (!isSupabaseConfigured) {
    return localCards;
  }

  try {
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (!user) return localCards;

    const { data: cards, error } = await supabase
      .from('cards')
      .select(`
        *,
        users (display_name, username, avatar_url),
        templates (name)
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !cards) return localCards;

    return cards.map(data => ({
      id: data.id,
      ownerId: data.owner_id,
      ownerName: data.users?.display_name || 'mulearn Student',
      ownerUsername: data.users?.username || username,
      ownerAvatar: data.users?.avatar_url,
      templateId: data.template_id || 'template-maroon-party',
      templateName: data.templates?.name || 'Party Sparkle Maroon',
      teacherName: data.teacher_name,
      message: data.message,
      photoUrl: data.photo_url,
      photoPublicId: data.photo_public_id,
      shareSlug: data.share_slug,
      likeCount: data.like_count || 0,
      customConfig: data.custom_config || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }));
  } catch {
    return localCards;
  }
}

/**
 * Fetch cards created by the logged in user
 */
export async function fetchUserCards(userId: string): Promise<CardData[]> {
  const localCards = getLocalCards().filter(c => c.ownerId === userId || !c.ownerId || c.ownerId === 'demo-user-123');
  if (!isSupabaseConfigured) {
    return localCards;
  }

  try {
    const { data, error } = await supabase
      .from('cards')
      .select(`
        *,
        users (display_name, username, avatar_url),
        templates (name)
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return localCards;

    return data.map(item => ({
      id: item.id,
      ownerId: item.owner_id,
      ownerName: item.users?.display_name || 'mulearn Student',
      ownerUsername: item.users?.username || 'student',
      ownerAvatar: item.users?.avatar_url,
      templateId: item.template_id || 'template-maroon-party',
      templateName: item.templates?.name || 'Party Sparkle Maroon',
      teacherName: item.teacher_name,
      message: item.message,
      photoUrl: item.photo_url,
      photoPublicId: item.photo_public_id,
      shareSlug: item.share_slug,
      likeCount: item.like_count || 0,
      customConfig: item.custom_config || {},
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch {
    return localCards;
  }
}

/**
 * Save / publish card
 */
export async function saveCard(card: Omit<CardData, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<CardData> {
  const id = card.id || `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const fullCard: CardData = {
    ...card,
    id,
    likeCount: card.likeCount || 0,
    createdAt: now,
    updatedAt: now,
  };

  saveLocalCard(fullCard);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('cards').upsert({
        id: fullCard.id.startsWith('card_') ? undefined : fullCard.id,
        owner_id: fullCard.ownerId,
        teacher_name: fullCard.teacherName,
        message: fullCard.message,
        photo_url: fullCard.photoUrl,
        photo_public_id: fullCard.photoPublicId,
        share_slug: fullCard.shareSlug,
        like_count: fullCard.likeCount,
        custom_config: fullCard.customConfig,
        updated_at: now,
      });
    } catch (e) {
      console.warn('Supabase upsert warning:', e);
    }
  }

  return fullCard;
}

/**
 * Increment like count
 */
export async function incrementCardLike(slug: string): Promise<number> {
  const localCards = getLocalCards();
  const card = localCards.find(c => c.shareSlug === slug);
  let newCount = (card?.likeCount || 0) + 1;
  if (card) {
    card.likeCount = newCount;
    saveLocalCard(card);
  }

  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.rpc('increment_card_likes', { target_slug: slug });
      if (typeof data === 'number') newCount = data;
    } catch {
      // Fallback
    }
  }

  return newCount;
}

/**
 * Fetch real leaderboard aggregated from published cards
 */
export async function fetchLeaderboards(timeframe: 'This Week' | 'This Month' | 'All Time'): Promise<LeaderboardEntry[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select(`
          id,
          owner_id,
          like_count,
          users (display_name, username, avatar_url)
        `)
        .order('like_count', { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        const userMap = new Map<string, { userId: string; displayName: string; username: string; avatarUrl: string; totalLikes: number; cardCount: number; cardId: string }>();

        for (const item of data) {
          const uId = item.owner_id || item.id;
          const current = userMap.get(uId);
          const likes = item.like_count || 0;
          const dName = (item.users as any)?.display_name || 'Student';
          const uName = (item.users as any)?.username || 'student';
          const avatar = (item.users as any)?.avatar_url || '';

          if (current) {
            current.totalLikes += likes;
            current.cardCount += 1;
          } else {
            userMap.set(uId, { userId: uId, displayName: dName, username: uName, avatarUrl: avatar, totalLikes: likes, cardCount: 1, cardId: item.id });
          }
        }

        const sorted = Array.from(userMap.values()).sort((a, b) => b.totalLikes - a.totalLikes);

        return sorted.map((entry, index) => ({
          id: entry.cardId,
          userId: entry.userId,
          rank: index + 1,
          displayName: entry.displayName,
          username: entry.username,
          avatarUrl: entry.avatarUrl,
          cardCount: entry.cardCount,
          likeCount: entry.totalLikes,
        }));
      }
    } catch (e) {
      console.warn('Leaderboard fetch error:', e);
    }
  }

  // Local fallback: aggregate from local storage
  const localCards = getLocalCards();
  if (localCards.length === 0) return [];

  const map = new Map<string, { userId: string; displayName: string; username: string; avatarUrl: string; totalLikes: number; cardCount: number; cardId: string }>();

  for (const c of localCards) {
    const key = c.ownerId || c.ownerUsername || c.id;
    const cur = map.get(key);
    const likes = c.likeCount || 0;
    if (cur) {
      cur.totalLikes += likes;
      cur.cardCount += 1;
    } else {
      map.set(key, {
        userId: key,
        displayName: c.ownerName || 'Student',
        username: c.ownerUsername || 'student',
        avatarUrl: c.ownerAvatar || '',
        totalLikes: likes,
        cardCount: 1,
        cardId: c.id,
      });
    }
  }

  const sorted = Array.from(map.values()).sort((a, b) => b.totalLikes - a.totalLikes);

  return sorted.map((entry, index) => ({
    id: entry.cardId,
    userId: entry.userId,
    rank: index + 1,
    displayName: entry.displayName,
    username: entry.username,
    avatarUrl: entry.avatarUrl,
    cardCount: entry.cardCount,
    likeCount: entry.totalLikes,
  }));
}
