/** Downscale + re-encode an image so a card link stays shareable. */
export async function normalizePhoto(src: Blob | string, max = 1000, quality = 0.78): Promise<string> {
  const url = typeof src === 'string' ? src : URL.createObjectURL(src)
  try {
    const img = await loadImage(url)
    const scale = Math.min(1, max / Math.max(img.width, img.height))
    const w = Math.round(img.width * scale)
    const h = Math.round(img.height * scale)
    const c = document.createElement('canvas')
    c.width = w; c.height = h
    const ctx = c.getContext('2d')!
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, w, h)
    return c.toDataURL('image/jpeg', quality)
  } finally {
    if (typeof src !== 'string') URL.revokeObjectURL(url)
  }
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image()
    i.crossOrigin = 'anonymous'
    i.onload = () => res(i)
    i.onerror = () => rej(new Error('image failed to load'))
    i.src = url
  })
}

/** Capture a frame from a <video> into a mirrored-or-not data URL. */
export function grabFrame(video: HTMLVideoElement, mirror: boolean, quality = 0.9): string {
  const w = video.videoWidth || 1280
  const h = video.videoHeight || 720
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')!
  if (mirror) { ctx.translate(w, 0); ctx.scale(-1, 1) }
  ctx.drawImage(video, 0, 0, w, h)
  return c.toDataURL('image/jpeg', quality)
}

export function approxDataUrlBytes(d: string) {
  const i = d.indexOf(',')
  return Math.round((d.length - i - 1) * 0.75)
}

/**
 * How far a photo may be panned inside its window before it stops covering it.
 *
 * The image fills the window with object-fit: cover, so whichever axis is the
 * looser fit already overflows before any zoom is applied — a tall photo in a
 * wide slot has plenty of room to slide up and down at zoom 1. `scale(zoom)`
 * then grows both axes. `translate` runs before that scale, so a pan of p%
 * shifts the picture by p% * zoom, which is where the divide comes from.
 *
 * `ratio` is how much longer the image is than the window on this axis once
 * cover has done its work: max(imageAspect / slotAspect, 1) across, and the
 * reciprocal down. Pass 1 when the photo's shape is not known yet and the
 * limit falls back to what the zoom alone provides.
 */
export function panLimit(zoom: number, ratio = 1) {
  return Math.max(0, (50 * (zoom * Math.max(ratio, 1) - 1)) / zoom)
}

export function clampPan(v: number, zoom: number, ratio = 1) {
  const l = panLimit(zoom, ratio)
  return Math.min(l, Math.max(-l, v))
}

/**
 * The two ratios for a photo of aspect `photoAr` sitting in a window of
 * aspect `slotAr` — horizontal first, then vertical. One of them is always 1:
 * cover matches one axis exactly and lets the other spill.
 */
export function coverRatios(photoAr?: number, slotAr?: number): [number, number] {
  if (!photoAr || !slotAr || !isFinite(photoAr) || !isFinite(slotAr)) return [1, 1]
  return photoAr > slotAr ? [photoAr / slotAr, 1] : [1, slotAr / photoAr]
}
