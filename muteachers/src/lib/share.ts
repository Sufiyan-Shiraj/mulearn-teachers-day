import type { CardDoc } from './types'

/* ------------------------------------------------------------------
   A card travels inside its own link. The document is JSON, deflated
   with the platform CompressionStream when available, then base64url
   encoded into the URL fragment so nothing ever leaves the device.
   ------------------------------------------------------------------ */

function b64urlEncode(bytes: Uint8Array) {
  let s = ''
  const CH = 0x8000
  for (let i = 0; i < bytes.length; i += CH) s += String.fromCharCode(...bytes.subarray(i, i + CH))
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(str: string) {
  const s = str.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(s + '==='.slice((s.length + 3) % 4))
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function deflate(data: Uint8Array): Promise<Uint8Array> {
  if (typeof CompressionStream === 'undefined') return data
  const cs = new CompressionStream('deflate-raw')
  const buf = await new Response(new Blob([data as BlobPart]).stream().pipeThrough(cs)).arrayBuffer()
  return new Uint8Array(buf)
}

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') return data
  const ds = new DecompressionStream('deflate-raw')
  const buf = await new Response(new Blob([data as BlobPart]).stream().pipeThrough(ds)).arrayBuffer()
  return new Uint8Array(buf)
}

export async function encodeCard(doc: CardDoc): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(doc))
  const packed = await deflate(json)
  const prefix = packed === json ? 'r' : 'z'
  return prefix + b64urlEncode(packed)
}

export async function decodeCard(token: string): Promise<CardDoc | null> {
  try {
    const prefix = token[0]
    const bytes = b64urlDecode(token.slice(1))
    const raw = prefix === 'z' ? await inflate(bytes) : bytes
    const doc = JSON.parse(new TextDecoder().decode(raw)) as CardDoc
    if (!doc?.templateId || !Array.isArray(doc.elements)) return null
    return doc
  } catch { return null }
}

/** the whole card, packed into a link that needs no server at all */
export async function buildHashLink(doc: CardDoc): Promise<string> {
  return `${location.origin}/c#${await encodeCard(doc)}`
}

/**
 * Past roughly this many characters a link stops being a link. WhatsApp's
 * wa.me endpoint and every mail client drop or truncate the text, and it is
 * useless pasted anywhere. A card carrying a photo encodes to well over
 * 100_000 characters — the photo is already JPEG, so deflate wins nothing —
 * which is why a self-contained link can only ever be a fallback.
 */
export const MAX_SHARE_URL = 2000

export interface CardLink {
  url: string
  /** false when the link had to be truncated away — the card is local-only */
  complete: boolean
}

/**
 * The link to hand out for a card.
 *
 * Once the card is saved server-side its slug is all a link needs, and a
 * short link is the only kind that survives WhatsApp, mail and a paste into
 * a chat. Only when the save failed does the whole card have to ride in the
 * fragment, and then it is likely too long to share at all — `complete` says
 * which case you are in so the UI can be honest about it.
 */
export async function buildCardLink(doc: CardDoc, stored: boolean): Promise<CardLink> {
  if (stored) return { url: `${location.origin}/c/${doc.id}`, complete: true }
  const hash = await buildHashLink(doc)
  return { url: hash, complete: hash.length <= MAX_SHARE_URL }
}

/**
 * Prefer a short link when the companion server is running, and fall
 * back to the self-contained hash link when it isn't.
 */
export async function buildShareLink(doc: CardDoc): Promise<string> {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 4000)
    const r = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(doc),
      signal: ctrl.signal,
    })
    clearTimeout(t)
    if (r.ok) {
      const { id } = await r.json() as { id?: string }
      if (id) return `${location.origin}/c/${id}`
    }
  } catch { /* offline or no server — fall through */ }
  return buildHashLink(doc)
}

export async function fetchCard(id: string): Promise<CardDoc | null> {
  try {
    const r = await fetch(`/api/cards/${encodeURIComponent(id)}`)
    if (!r.ok) return null
    const doc = await r.json() as CardDoc
    return doc?.templateId && Array.isArray(doc.elements) ? doc : null
  } catch { return null }
}

/** rebuild a card from a link of either shape */
export async function loadFromLink(link: string): Promise<CardDoc | null> {
  try {
    const u = new URL(link, location.origin)
    const m = u.pathname.match(/^\/c\/([a-z0-9]+)$/i)
    if (m) return await fetchCard(m[1])
    const token = u.hash.slice(1)
    return token ? await decodeCard(token) : null
  } catch { return null }
}

export function canNativeShare() {
  return typeof navigator !== 'undefined' && !!navigator.share
}

export async function nativeShare(url: string, text: string, title = 'A Teacher’s Day card for you') {
  if (!navigator.share) return false
  try {
    await navigator.share({ title, text, url })
    return true
  } catch { return false }
}

export async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(ta); ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

/* the link goes on its own line so the message reads as a note with a card
   attached, rather than a sentence that trails off into a URL */
export function whatsappUrl(url: string, text: string) {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`
}
