import { isSupabaseConfigured, supabase, type UserProfile } from './supabase'

const suffix = () => Math.random().toString(36).slice(2, 6)

/**
 * Write a profile row for whoever is at the keyboard.
 *
 * Cards carry a foreign key to this row, so it has to exist before a card can
 * be saved. It is shared between claiming a name and saving a card because a
 * profile can go missing after the fact — claimed while offline, claimed
 * before the database was ready, or written from another device — and a card
 * should heal that rather than fail.
 *
 * The unique index on the handle is what decides collisions, so a clash comes
 * back as an error and we try once more with a suffix rather than trusting a
 * lookup that could be stale by the time we write.
 */
export async function pushProfile(p: UserProfile): Promise<UserProfile> {
  if (!isSupabaseConfigured) return p

  for (const username of [p.username, `${p.username}_${suffix()}`]) {
    const { error } = await supabase.from('users').upsert({
      id: p.id,
      display_name: p.displayName,
      username,
    }, { onConflict: 'id' })

    if (!error) return { ...p, username }
    if (error.code !== '23505') {
      console.warn('Profile save failed:', error.message)
      return p
    }
  }
  return p
}
