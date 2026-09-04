import { toJpeg, toPng } from 'html-to-image'

export interface Shot { dataUrl: string; blob: Blob }

/**
 * The shapes a selfie gets posted in.
 *
 * A story is 9:16 and a feed post is square; the card's own 5×7 is neither,
 * so it gets painted onto a canvas of the right shape with the picture's own
 * colours carried out to the edges. `card` keeps the untouched frame for
 * anyone printing it.
 */
export const FORMATS = {
  story: { label: 'Story', w: 1080, h: 1920 },
  square: { label: 'Post', w: 1080, h: 1080 },
  card: { label: 'Full frame', w: 0, h: 0 },
} as const

export type FormatKey = keyof typeof FORMATS

/* 2× a 1000-unit design gives 2000px across — about 400dpi at 5×7in */
const EXPORT_SCALE = 2

/**
 * The one place the saved format is decided.
 *
 * PNG is lossless and is what the card promises, at roughly 8-9MB a side —
 * the templates are photographs, so there is little for it to compress.
 * Switching FORMAT to 'jpeg' takes the same card to well under a megabyte
 * at a quality nobody will see the difference in on a phone; the only cost
 * is printing, where the 5×7 comes out very slightly softer.
 */
const FORMAT: 'png' | 'jpeg' = 'png'
const JPEG_QUALITY = 0.94

/** the attribute <Share/> puts on each side it wants rendered */
export const EXPORT_ATTR = 'data-export'

const EXT = FORMAT === 'png' ? 'png' : 'jpg'
const MIME = FORMAT === 'png' ? 'image/png' : 'image/jpeg'

/**
 * Wait until there is actually something to photograph.
 *
 * html-to-image snapshots whatever has loaded at that instant, so anything
 * still in flight comes out as a blank box. The old warm-up pass was a guess
 * at how long that takes; this waits on the real thing.
 */
async function readyToRender(node: HTMLElement) {
  const imgs = Array.from(node.querySelectorAll('img'))

  /* `complete` means the browser is finished with it either way — a picture
     that failed is complete with no pixels. Waiting on a load event for one
     of those waits for an event that already fired, forever, which is worse
     than a bad export: it is a button that never comes back. */
  const settled = (img: HTMLImageElement) => {
    if (img.complete) return img.naturalWidth > 0 ? img.decode().catch(() => undefined) : undefined
    return new Promise<void>(res => {
      const done = () => res()
      img.addEventListener('load', done, { once: true })
      img.addEventListener('error', done, { once: true })
      setTimeout(done, 8000)
    })
  }

  await Promise.all<unknown>([document.fonts?.ready, ...imgs.map(settled)])

  /* A selfie without its frame is not worth posting, and it is exactly what
     a blank export looks like. Say so, so the button can offer another go. */
  const lost = imgs.filter(i => i.naturalWidth < 1)
  if (lost.length) throw new Error(`${lost.length} picture(s) did not load`)
}

/* ------------------------------------------------------------------
   Freezing the pictures before the snapshot.

   html-to-image does not photograph the images on screen — it re-fetches
   every one of them over the network and inlines the bytes it gets back.
   When one of those fetches fails it swallows the error and leaves the
   original `/templates/disco.jpg` in place, which resolves against nothing
   inside the snapshot and renders as an empty box. That is the blank export:
   the paper and the teacher's name come out fine, and every picture is gone.

   So the pictures are taken from the copies the browser has already decoded
   and is showing on screen. No network, nothing to fail. It also caps the
   long edge, which matters on a phone: a camera photo arrives as a several
   megabyte data URL, and the whole card has to fit in one data URL that
   Safari is willing to load.
   ------------------------------------------------------------------ */

/** no export is wider than this, so nothing needs more pixels than this */
const MAX_INLINE_PX = 2400

const frozen = new Map<string, string>()

function freeze(img: HTMLImageElement): string | null {
  const src = img.currentSrc || img.src
  if (!src) return null
  const cached = frozen.get(src)
  if (cached) return cached
  if (img.naturalWidth < 1) return null

  const k = Math.min(1, MAX_INLINE_PX / Math.max(img.naturalWidth, img.naturalHeight))
  const c = document.createElement('canvas')
  c.width = Math.round(img.naturalWidth * k)
  c.height = Math.round(img.naturalHeight * k)
  const ctx = c.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(img, 0, 0, c.width, c.height)

  /* the punched overlay and vector logos are transparent, so they
     have to stay PNG; the artwork and the photo are photographs, and JPEG
     keeps the payload small enough to survive a phone */
  const alpha = /\.(png|webp|svg)(\?|$)/i.test(src) || src.startsWith('data:image/png') || src.startsWith('data:image/svg')
  let out: string
  try {
    out = alpha ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.92)
  } catch {
    /* a cross-origin picture taints the canvas — leave it to html-to-image */
    return null
  }
  frozen.set(src, out)
  return out
}

/** Swap in the frozen copies for the length of the snapshot, then put the
 *  live ones back so the card on screen is untouched. */
function freezeImages(node: HTMLElement) {
  const undo: Array<[HTMLImageElement, string]> = []
  let missed = 0
  for (const img of Array.from(node.querySelectorAll('img'))) {
    const src = img.currentSrc || img.src
    if (!src || src.startsWith('data:image/jpeg') || src.startsWith('data:image/png')) continue
    const url = freeze(img)
    if (!url) { missed += 1; continue }
    undo.push([img, img.getAttribute('src') ?? ''])
    img.setAttribute('src', url)
  }
  if (missed) console.warn(`export: ${missed} image(s) could not be frozen; falling back to a re-fetch`)
  return () => undo.forEach(([img, src]) => img.setAttribute('src', src))
}

/**
 * Is this a picture, or is it an empty rectangle?
 *
 * Safari in particular will hand back a canvas drawn before the snapshot
 * finished loading, and the result is the paper with nothing on it. Rather
 * than trust the render, look at what came out: a real selfie has hundreds
 * of colours in it, and a blank one has about three.
 */
async function looksBlank(dataUrl: string) {
  const img = new Image()
  img.src = dataUrl
  try { await img.decode() } catch { return true }
  const c = document.createElement('canvas')
  c.width = 32; c.height = 32
  const ctx = c.getContext('2d', { willReadFrequently: true })
  if (!ctx) return false
  ctx.drawImage(img, 0, 0, 32, 32)
  const { data } = ctx.getImageData(0, 0, 32, 32)
  const seen = new Set<number>()
  for (let i = 0; i < data.length; i += 4) {
    /* coarse buckets, so film grain in one flat colour is still one colour */
    seen.add(((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4))
    if (seen.size > 6) return false
  }
  return true
}

async function shoot(node: HTMLElement) {
  const thaw = freezeImages(node)
  const opts = { pixelRatio: EXPORT_SCALE, backgroundColor: '#faf5f1' }
  try {
    return FORMAT === 'png'
      ? await toPng(node, opts)
      : await toJpeg(node, { ...opts, quality: JPEG_QUALITY })
  } finally { thaw() }
}

async function render(node: HTMLElement): Promise<{ dataUrl: string; blob: Blob }> {
  await readyToRender(node)

  /* Two more goes before giving up. A first render that comes back empty is
     usually a browser that had not finished with the snapshot yet, and the
     next one lands — which is why this used to do a throwaway pass every
     time. Now it only pays for that when something actually went wrong, and
     when nothing works it says so instead of handing over a blank page. */
  let dataUrl = ''
  for (let attempt = 0; attempt < 3; attempt += 1) {
    dataUrl = await shoot(node)
    if (!(await looksBlank(dataUrl))) break
    if (attempt === 2) throw new Error('the selfie rendered blank')
    await new Promise(r => setTimeout(r, 120 * (attempt + 1)))
  }

  const blob = await (await fetch(dataUrl)).blob()
  return { dataUrl, blob }
}

/**
 * Render both sides of the card sitting in `root`.
 * Throws when neither side is there rather than returning nothing, so a
 * broken export surfaces instead of looking like a save that did nothing.
 */
/** Render the selfie sitting in `root`. Throws rather than returning nothing,
 *  so a broken export surfaces instead of looking like a save that did little. */
export async function renderCard(root: HTMLElement): Promise<Shot> {
  const node = root.querySelector<HTMLElement>(`[${EXPORT_ATTR}]`)
  if (!node) throw new Error(`no [${EXPORT_ATTR}] node to render`)
  return render(node)
}

/**
 * Lay the rendered selfie onto a canvas of the shape a platform wants.
 *
 * The picture is centred and scaled to fit, and the background is taken from
 * its own top-left pixel and darkened slightly — a blurred bleed would be
 * prettier, but this reads as deliberate at story size and costs nothing.
 */
export async function reframe(shot: Shot, format: FormatKey): Promise<Shot> {
  const f = FORMATS[format]
  if (!f.w || !f.h) return shot

  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = () => rej(new Error('could not read the rendered card'))
    i.src = shot.dataUrl
  })

  const c = document.createElement('canvas')
  c.width = f.w; c.height = f.h
  const ctx = c.getContext('2d')!

  /* a ground taken from the picture itself, so the padding never looks like
     a mistake whatever frame was chosen */
  const probe = document.createElement('canvas')
  probe.width = probe.height = 1
  probe.getContext('2d')!.drawImage(img, 4, 4, 1, 1, 0, 0, 1, 1)
  const [r, g, b] = probe.getContext('2d')!.getImageData(0, 0, 1, 1).data
  ctx.fillStyle = `rgb(${Math.round(r * 0.82)}, ${Math.round(g * 0.82)}, ${Math.round(b * 0.82)})`
  ctx.fillRect(0, 0, f.w, f.h)

  const pad = format === 'story' ? 0.88 : 0.94
  const k = Math.min((f.w * pad) / img.width, (f.h * pad) / img.height)
  const w = img.width * k, h = img.height * k
  ctx.drawImage(img, (f.w - w) / 2, (f.h - h) / 2, w, h)

  const dataUrl = c.toDataURL(MIME, FORMAT === 'png' ? undefined : JPEG_QUALITY)
  const blob = await (await fetch(dataUrl)).blob()
  return { dataUrl, blob }
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export function shotFile(s: Shot, stem = 'teachers-day-selfie') {
  return new File([s.blob], `${stem}.${EXT}`, { type: MIME, lastModified: Date.now() })
}

/** true when the browser can hand image files to the OS share sheet */
export function canShareFiles(files: File[]) {
  return typeof navigator !== 'undefined'
    && typeof navigator.canShare === 'function'
    && navigator.canShare({ files })
}

/**
 * Whether to go through the OS share sheet rather than straight to a download.
 *
 * On a phone the sheet is the only sane route to the camera roll — "Save to
 * Photos" is one tap from it. Desktop Chrome also reports it can share files,
 * but there the sheet is a detour around the download the button promises,
 * and it may sit open indefinitely, so a pointing device gets the file.
 */
export function prefersShareSheet() {
  return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
}

/** true where "post it" will hand the picture to Instagram, WhatsApp and the
 *  rest — false on a desktop, where it saves the file instead */
export function canOpenShareSheet() {
  return prefersShareSheet() && typeof navigator !== 'undefined' && !!navigator.share
}

/**
 * Put the card in the person's files.
 * On phones that support it this opens the share sheet with the real PNGs
 * attached, so "Save to Photos" is one tap. Everywhere else the files land
 * in Downloads straight away.
 */
/**
 * Hand the picture to whatever the person wants to post it with.
 *
 * On a phone this is the share sheet, which is where Instagram, WhatsApp and
 * Stories actually live — one tap and the image is already attached. A desktop
 * has no such sheet worth opening, so it gets the file.
 */
export async function shareCardImages(shots: Shot[], opts: { title?: string; text?: string } = {}) {
  const files = shots.map(s => shotFile(s))
  if (files.length && prefersShareSheet() && canShareFiles(files)) {
    try {
      await navigator.share({ files, title: opts.title, text: opts.text })
      return 'shared' as const
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return 'cancelled' as const
    }
  }
  files.forEach((f, i) => setTimeout(() => saveBlob(f, f.name), i * 350))
  return 'downloaded' as const
}

export async function saveCardImages(shots: Shot[], opts: { title?: string; text?: string } = {}) {
  const files = shots.map(s => shotFile(s))
  if (files.length && prefersShareSheet() && canShareFiles(files)) {
    try {
      await navigator.share({ files, title: opts.title, text: opts.text })
      return 'shared' as const
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return 'cancelled' as const
      /* otherwise fall through to a plain download */
    }
  }
  files.forEach((f, i) => setTimeout(() => saveBlob(f, f.name), i * 350))
  return 'downloaded' as const
}
