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
