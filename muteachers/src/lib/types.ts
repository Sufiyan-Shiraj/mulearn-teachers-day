/* ============================================================
   Card data model
   ------------------------------------------------------------
   A card is authored inside a fixed "design space" that is
   DESIGN_W units wide and DESIGN_W / aspect units tall.
   Every element position is stored in PERCENT of that box, so a
   card renders identically at any pixel size on any device.
   ============================================================ */

export const DESIGN_W = 1000

export type Face = 'front' | 'back'

export type FontKey =
  | 'playful' | 'elegant' | 'typewriter'
  | 'handwritten' | 'classic' | 'bold'

export type TagKey =
  | 'bold' | 'soft' | 'floral' | 'minimal' | 'vintage' | 'playful' | 'retro'

export interface Box { x: number; y: number; w: number; h: number }

interface Base {
  id: string
  face: Face
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
  from: string
  to: string
  createdAt: number
  updatedAt: number
}
