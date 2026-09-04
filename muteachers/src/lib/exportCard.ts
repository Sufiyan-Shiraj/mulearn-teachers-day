import { toJpeg, toPng } from 'html-to-image'

export interface Shot { face: 'front' | 'back'; dataUrl: string; blob: Blob }

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

/**
 * Put the card in the person's files.
 * On phones that support it this opens the share sheet with the real PNGs
 * attached, so "Save to Photos" is one tap. Everywhere else the files land
 * in Downloads straight away.
 */
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
