/* ============================================================
   Card data model
   ------------------------------------------------------------
   A card is authored inside a fixed "design space" that is
   DESIGN_W units wide and DESIGN_W / aspect units tall.
   Every element position is stored in PERCENT of that box, so a
   card renders identically at any pixel size on any device.
   ============================================================ */

export const DESIGN_W = 1000

export type FontKey =
  | 'playful' | 'elegant' | 'typewriter'
  | 'handwritten' | 'classic' | 'bold'

export type TagKey =
  | 'bold' | 'soft' | 'floral' | 'minimal' | 'vintage' | 'playful' | 'retro'

export interface Box { x: number; y: number; w: number; h: number }

interface Base {
  id: string
  box: Box
  rot: number
  /** element cannot be moved / deleted by the user */
  fixed?: boolean
  z?: number
}

export interface TextElement extends Base {
  kind: 'text'
  text: string
  placeholder: string
  font: FontKey
  /** font-size in design units */
  size: number
  color: string
  align: 'left' | 'center' | 'right'
  lh: number
  ls?: number
  weight?: number
  italic?: boolean
  upper?: boolean
  maxLen?: number
  /** paper/tape backing drawn behind the text */
  plate?: 'none' | 'paper' | 'torn' | 'tape' | 'line'
  shadow?: string
  /** optional gradient fill (clipped to the glyphs) */
  gradient?: string
  /** label shown in the "what am I editing" hint */
  label?: string
}

export interface PhotoElement extends Base {
  kind: 'photo'
  frame: 'polaroid' | 'plain' | 'torn' | 'arch' | 'circle' | 'slot' | 'arch-slot'
  /** 1 = fit, >1 zoomed in */
  zoom: number
  /** pan offsets, -50..50 (% of slot) */
  ox: number
  oy: number
  tape?: 'none' | 'dots' | 'kraft' | 'red' | 'washi'
  caption?: string
  /**
   * Where the photo sits against the template artwork.
   * Left unset it follows the frame — a fitted photo tucks under the art, a
   * photo given its own polaroid or arch sits on top — and once the user
   * says otherwise, their choice sticks through any later frame change.
   */
  lift?: boolean
}

export type DecoKey =
  | 'heart-red' | 'heart-doodle' | 'heart-outline'
  | 'star-gold' | 'star-silver' | 'star-doodle' | 'sparkle' | 'sparkle-4'
  | 'daisy' | 'cosmos' | 'rose' | 'leaf' | 'sprig'
  | 'tape-dots' | 'tape-kraft' | 'tape-red' | 'tape-washi'
  | 'paperclip' | 'pin' | 'stamp' | 'grid-patch'
  | 'smiley' | 'squiggle' | 'arrow' | 'burst' | 'underline'
  | 'disco' | 'vinyl' | 'gradcap' | 'pencil' | 'apple' | 'ribbon'
  | 'sticker-thanks' | 'sticker-best' | 'sticker-star'

export interface DecoElement extends Base {
  kind: 'deco'
  deco: DecoKey
  color?: string
  flip?: boolean
}

export type CardElement = TextElement | PhotoElement | DecoElement

/* ---------------- template ---------------- */

export type ArtKey =
  | 'velvet' | 'disco' | 'scrapbook' | 'pressed'
  | 'grateful' | 'lilac' | 'thankyou'

export interface Template {
  id: string
  name: string
  blurb: string
  tags: TagKey[]
  /** width / height */
  aspect: number
  art: ArtKey
  isNew?: boolean
  /** default elements cloned into a new card */
  elements: CardElement[]
  /** ring / chrome colour when this template is selected */
  accent: string
  /** true when the artwork is dark (affects selection chrome) */
  dark?: boolean
  /** how the card is cropped inside a fixed-ratio grid tile */
  thumbAlign?: 'top' | 'center'
}

/* ---------------- document ---------------- */

export interface CardDoc {
  id: string
  templateId: string
  elements: CardElement[]
  /** data URL of the user photo */
  photo?: string
  /** the photo's own width / height, measured when it is added */
  photoAr?: number
  from: string
  to: string
  createdAt: number
  updatedAt: number
}

/* ------------------------------------------------------------------
   Nothing may be pushed entirely off the card.

   The card clips its contents, so an element dragged past the edge has
   no hit area left and cannot be grabbed back — it is simply gone. This
   keeps a strip of every element on the paper, which is enough to catch
   hold of and drag back.
   ------------------------------------------------------------------ */
export const KEEP_ON_CARD = 14

export function clampBox(box: Box): Box {
  const w = Math.max(box.w, 4)
  const h = Math.max(box.h, 4)
  return {
    ...box,
    x: Math.min(100 - KEEP_ON_CARD, Math.max(KEEP_ON_CARD - w, box.x)),
    y: Math.min(100 - KEEP_ON_CARD, Math.max(KEEP_ON_CARD - h, box.y)),
  }
}
