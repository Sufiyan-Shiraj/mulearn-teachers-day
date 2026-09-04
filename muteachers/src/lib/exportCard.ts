import { toJpeg, toPng } from 'html-to-image'

export interface Shot { face: string; dataUrl: string; blob: Blob }

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

async function render(node: HTMLElement): Promise<{ dataUrl: string; blob: Blob }> {
  /* first pass warms webfonts and images so the second is faithful */
  await toPng(node, { pixelRatio: 0.4, cacheBust: true })
  const opts = { pixelRatio: EXPORT_SCALE, cacheBust: true, backgroundColor: '#faf5f1' }
  const dataUrl = FORMAT === 'png'
    ? await toPng(node, opts)
    : await toJpeg(node, { ...opts, quality: JPEG_QUALITY })
  const blob = await (await fetch(dataUrl)).blob()
  return { dataUrl, blob }
}

/**
 * Render both sides of the card sitting in `root`.
 * Throws when neither side is there rather than returning nothing, so a
 * broken export surfaces instead of looking like a save that did nothing.
 */
export async function renderCard(root: HTMLElement): Promise<Shot[]> {
  const out: Shot[] = []
  for (const face of ['front', 'back'] as const) {
    const node = root.querySelector<HTMLElement>(`[${EXPORT_ATTR}='${face}']`)
    if (!node) continue
    out.push({ face, ...(await render(node)) })
  }
  if (!out.length) throw new Error(`no [${EXPORT_ATTR}] sides found to render`)
  return out
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
  return { face: `${shot.face}-${format}`, dataUrl, blob }
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

export function shotFile(s: Shot, stem = 'teachers-day-card') {
  return new File([s.blob], `${stem}-${s.face === 'front' ? 'front' : 'inside'}.${EXT}`,
    { type: MIME, lastModified: Date.now() })
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
function prefersShareSheet() {
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
