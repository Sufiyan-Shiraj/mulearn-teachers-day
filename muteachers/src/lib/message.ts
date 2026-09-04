/* ============================================================
   The words that travel with a card.

   A card is sent by a student, from their own phone, to their
   own teacher — so the message is written in their voice, not
   the site's. It greets the teacher by name and signs off with
   the student's, both of which are already on the card.

   The student can rewrite any of it before sending; this is
   only the opening offer.
   ============================================================ */
import type { CardDoc } from './types'

/**
 * Endings for the greeting. One is chosen from the card's id, so a card
 * always says the same thing every time it is opened, while two students
 * in the same room almost certainly send different words — the point of
 * a handmade card is rather lost if a teacher gets forty identical texts.
 */
const TAILS = [
  '💐 I made you a card — it’s all yours.',
  '🌼 I made you something small. I hope it makes you smile.',
  '✨ I made you a card, to say thank you for everything.',
  '💛 A little something I made, just for you.',
  '🎈 I made you a card. Thank you for everything this year.',
]

function pick(seed: string, n: number) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h % n
}

const clean = (v: string | undefined) => (v ?? '').trim().replace(/\s+/g, ' ')

function getTeacherName(doc: CardDoc): string {
  if (doc.to && doc.to.trim()) return doc.to.trim()
  const teacherEl = doc.elements?.find(e => e.kind === 'text') as { text?: string } | undefined
  return (teacherEl?.text ?? '').trim()
}

/** "Happy Teacher's Day, Ms. Nair!" — or just the wish, when nobody is named */
function greeting(to: string) {
  return to ? `Happy Teacher’s Day, ${to}!` : 'Happy Teacher’s Day!'
}

/**
 * The message the student sends. Everything downstream — WhatsApp, mail,
 * the share sheet — carries this exact text, so what they read in the box
 * is what their teacher receives.
 */
export function defaultNote(doc: CardDoc): string {
  const to = clean(getTeacherName(doc))
  const from = clean(doc.from)
  const line = `${greeting(to)} ${TAILS[pick(doc.id, TAILS.length)]}`
  return from ? `${line}\n— ${from}` : line
}

/** subject line for mail, and the heading the OS share sheet shows */
export function shareTitle(doc: CardDoc): string {
  const to = clean(getTeacherName(doc))
  return to ? `Happy Teacher’s Day, ${to}!` : 'A Teacher’s Day card for you'
}

export function mailto(doc: CardDoc, note: string, url: string): string {
  const subject = encodeURIComponent(shareTitle(doc))
  const body = encodeURIComponent(`${note}\n\n${url}`)
  return `mailto:?subject=${subject}&body=${body}`
}

/* ---------------- sharing the pictures rather than the link ---------------- */

/**
 * When the images themselves are attached there is no link to introduce, and
 * the card is the message — so this stays a caption rather than an invitation.
 */
export function imageShareTitle(doc: CardDoc): string {
  const to = clean(doc.to)
  return to ? `A Teacher’s Day card for ${to}` : 'A Teacher’s Day card'
}

export function imageShareText(doc: CardDoc, note: string): string {
  return note.trim() || imageShareTitle(doc)
}
