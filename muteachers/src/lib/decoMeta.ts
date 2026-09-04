import type { DecoKey } from './types'

/** natural width / height of each sticker, used to size it on the card */
export const DECO_ASPECT: Record<DecoKey, number> = {
  'heart-red': 120 / 106, 'heart-doodle': 120 / 108, 'heart-outline': 120 / 108,
  'star-gold': 120 / 116, 'star-silver': 124 / 120, 'star-doodle': 120 / 118,
  sparkle: 1, 'sparkle-4': 1,
  daisy: 1, cosmos: 1, rose: 1, leaf: 90 / 120, sprig: 80 / 140,
  'tape-dots': 200 / 56, 'tape-kraft': 200 / 56, 'tape-red': 200 / 56, 'tape-washi': 200 / 56,
  paperclip: 24 / 46, pin: 60 / 70, stamp: 110 / 130, 'grid-patch': 120 / 150,
  smiley: 1, squiggle: 180 / 30, arrow: 120 / 66, burst: 90 / 74, underline: 200 / 16,
  disco: 1, vinyl: 1, gradcap: 140 / 110, pencil: 160 / 46, apple: 110 / 120, ribbon: 120 / 130,
  'sticker-thanks': 220 / 92, 'sticker-best': 220 / 92, 'sticker-star': 220 / 92,
}

export interface DecoGroup { key: string; label: string; items: DecoKey[] }

export const DECO_GROUPS: DecoGroup[] = [
  { key: 'hearts', label: 'Hearts', items: ['heart-red', 'heart-doodle', 'heart-outline', 'ribbon'] },
  { key: 'stars', label: 'Stars', items: ['star-gold', 'star-silver', 'star-doodle', 'sparkle', 'sparkle-4'] },
  { key: 'flowers', label: 'Flowers', items: ['daisy', 'cosmos', 'rose', 'sprig', 'leaf'] },
  { key: 'doodles', label: 'Doodles', items: ['smiley', 'squiggle', 'arrow', 'burst', 'underline'] },
  { key: 'tape', label: 'Tape', items: ['tape-dots', 'tape-kraft', 'tape-red', 'tape-washi', 'grid-patch'] },
  { key: 'stationery', label: 'Stationery', items: ['paperclip', 'pin', 'stamp', 'pencil', 'gradcap', 'apple'] },
  { key: 'retro', label: 'Retro', items: ['disco', 'vinyl'] },
  { key: 'stickers', label: 'Stickers', items: ['sticker-thanks', 'sticker-best', 'sticker-star'] },
]

export const DECO_LABEL: Partial<Record<DecoKey, string>> = {
  'heart-red': 'Glossy heart', 'heart-doodle': 'Drawn heart', 'heart-outline': 'Outline heart',
  'star-gold': 'Gold star', 'star-silver': 'Foil star', 'star-doodle': 'Drawn star',
  sparkle: 'Sparkle', 'sparkle-4': 'Twinkle', daisy: 'Daisy', cosmos: 'Cosmos', rose: 'Rose',
  sprig: 'Sprig', leaf: 'Leaf', 'tape-dots': 'Dotted tape', 'tape-kraft': 'Kraft tape',
  'tape-red': 'Red tape', 'tape-washi': 'Washi tape', 'grid-patch': 'Grid patch',
  paperclip: 'Paperclip', pin: 'Push pin', stamp: 'Stamp', smiley: 'Smiley', squiggle: 'Squiggle',
  arrow: 'Arrow', burst: 'Burst', underline: 'Underline', disco: 'Disco ball', vinyl: 'Vinyl',
  gradcap: 'Grad cap', pencil: 'Pencil', apple: 'Apple', ribbon: 'Rosette',
  'sticker-thanks': 'thank you!', 'sticker-best': 'best teacher', 'sticker-star': "you're a star",
}
