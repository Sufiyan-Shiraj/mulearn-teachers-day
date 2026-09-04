import { toJpeg, toPng } from 'html-to-image'

export interface Shot { face: 'front' | 'back'; dataUrl: string; blob: Blob }

/* 2× a 1000-unit design gives 2000px across — about 400dpi at 5×7in */
const EXPORT_SCALE = 2
const QUALITY = 0.94

async function render(node: HTMLElement): Promise<{ dataUrl: string; blob: Blob }> {
  /* first pass warms webfonts and images so the second is faithful */
  await toPng(node, { pixelRatio: 0.4, cacheBust: true })
  /* JPEG, not PNG: the paper grain is noise, which PNG cannot compress —
     the same card is ~700KB here against ~9MB as a PNG, and JPEG is what a
     phone's photo library wants anyway */
  const dataUrl = await toJpeg(node, {
    pixelRatio: EXPORT_SCALE,
    quality: QUALITY,
    cacheBust: true,
    backgroundColor: '#faf5f1',
  })
  const blob = await (await fetch(dataUrl)).blob()
  return { dataUrl, blob }
}

/** render both sides of the card sitting in `root` */
export async function renderCard(root: HTMLElement): Promise<Shot[]> {
  const out: Shot[] = []
  for (const face of ['front', 'back'] as const) {
    const node = root.querySelector<HTMLElement>(`[data-export='${face}']`)
    if (!node) continue
    out.push({ face, ...(await render(node)) })
  }
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
  return new File([s.blob], `${stem}-${s.face === 'front' ? 'front' : 'inside'}.jpg`,
    { type: 'image/jpeg', lastModified: Date.now() })
}

/** true when the browser can hand image files to the OS share sheet */
export function canShareFiles(files: File[]) {
  return typeof navigator !== 'undefined'
    && typeof navigator.canShare === 'function'
    && navigator.canShare({ files })
}

/**
 * Put the card in the person's files.
 * On phones that support it this opens the share sheet with the real PNGs
 * attached, so "Save to Photos" is one tap. Everywhere else the files land
 * in Downloads straight away.
 */
export async function saveCardImages(shots: Shot[], opts: { title?: string; text?: string } = {}) {
  const files = shots.map(s => shotFile(s))
  if (files.length && canShareFiles(files)) {
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
