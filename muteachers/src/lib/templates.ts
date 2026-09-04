import type { ArtKey, CardElement, Template } from './types'
import { SLOTS } from './slots'

/**
 * The teacher's name — the only text on a selfie.
 *
 * It sits in the writing area the artwork already provides, at a size chosen
 * for that area, so nobody has to place or style it. It can still be dragged
 * and resized on the preview if someone wants it somewhere else.
 */
const name = (id: string, art: ArtKey): CardElement => {
  const [x, y, w, h] = SLOTS[art].name
  return {
    kind: 'text', id, box: { x, y, w, h }, rot: 0,
    text: '', placeholder: 'Your teacher’s name',
    font: 'playful', size: SLOTS[art].nameSize,
    color: NAME_INK[art], align: 'center', lh: 1.2,
    plate: 'none', label: 'Teacher’s name', maxLen: 40,
  }
}

/** ink that reads on whatever the writing area is printed on */
const NAME_INK: Record<ArtKey, string> = {
  disco: '#2c2722', scrapbook: '#2f3a44', velvet: '#3a2b20', thankyou: '#3a231c',
  pressed: '#5b4a43', grateful: '#2e2a26', lilac: '#4b385e',
}

/**
 * The photo slot for a template. Its position, size and angle come straight
 * from lib/slots.ts, measured off the artwork, so the photo lands inside the
 * printed frame instead of near it. `frame: 'slot'` means the artwork already
 * draws the frame — the punched overlay does the clipping, so nothing is
 * painted around the photo here.
 */
const p = (
  id: string, art: ArtKey,
  o: Partial<Extract<CardElement, { kind: 'photo' }>> = {},
): CardElement => {
  const [x, y, w, h] = SLOTS[art].box
  return {
    kind: 'photo', id, box: { x, y, w, h },
    rot: SLOTS[art].rot, frame: 'slot', zoom: 1, ox: 0, oy: 0, tape: 'none', ...o,
  }
}

export const makeDeco = (
  id: string, deco: Extract<CardElement, { kind: 'deco' }>['deco'],
  box: [number, number, number, number], rot = 0, color?: string,
): CardElement => ({
  kind: 'deco', id, deco, box: { x: box[0], y: box[1], w: box[2], h: box[3] }, rot, color })

/* ================================================================== */

export const TEMPLATES: Template[] = [
  /* ---------------------------------------------------------------- */
  {
    id: 'disco',
    name: 'Golden Hour',
    blurb: 'Velvet, gold serif and a polaroid to fill.',
    tags: ['bold', 'vintage'],
    aspect: 941 / 1672,
    art: 'disco',
    accent: '#6b0f0e',
    isNew: true,
    dark: true,
    thumbAlign: 'top',
    elements: [
      p('dc-photo', 'disco'),
      name('dc-name', 'disco'),
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'scrapbook',
    name: 'Scrapbook 2026',
    blurb: 'Cut-paper letters, vinyl, a graduation cap.',
    tags: ['playful', 'retro', 'vintage'],
    aspect: 1054 / 1492,
    art: 'scrapbook',
    accent: '#2c3f4d',
    dark: true,
    isNew: true,
    elements: [
      p('sc-photo', 'scrapbook'),
      name('sc-name', 'scrapbook'),
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'velvet',
    name: 'Red Velvet',
    blurb: 'Deep red velvet, gold foil, polaroid photo frame.',
    tags: ['bold', 'vintage'],
    aspect: 1100 / 1573,
    art: 'velvet',
    accent: '#7b1113',
    dark: true,
    isNew: true,
    elements: [
      p('v-photo', 'velvet'),
      name('v-name', 'velvet'),
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'thankyou',
    name: 'Thank You',
    blurb: 'Big editorial serif on deep crimson with disco sparkles.',
    tags: ['bold', 'minimal'],
    aspect: 1100 / 1667,
    art: 'thankyou',
    accent: '#74100f',
    dark: true,
    isNew: true,
    elements: [
      p('ty-photo', 'thankyou'),
      name('ty-name', 'thankyou'),
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'pressed',
    name: 'Pressed Petals',
    blurb: 'Handmade deckle paper with real dried pressed flowers.',
    tags: ['floral', 'soft'],
    aspect: 1100 / 1570,
    art: 'pressed',
    accent: '#c98f8a',
    elements: [
      p('pr-photo', 'pressed'),
      name('pr-name', 'pressed'),
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'grateful',
    name: 'Grateful',
    blurb: 'Minimalist charcoal fine art paper with botanical bloom.',
    tags: ['minimal', 'floral'],
    aspect: 1100 / 1584,
    art: 'grateful',
    accent: '#1a1a1a',
    dark: true,
    elements: [
      p('gr-photo', 'grateful'),
      name('gr-name', 'grateful'),
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    id: 'lilac',
    name: 'Lilac Note',
    blurb: 'Dreamy pastel lavender watercolor with cosmos flowers.',
    tags: ['playful', 'soft', 'floral'],
    aspect: 1100 / 1593,
    art: 'lilac',
    accent: '#8c63a9',
    elements: [
      p('li-photo', 'lilac'),
      name('li-name', 'lilac'),
    ],
  },
]

export const TAGS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'bold', label: 'Bold' },
  { key: 'soft', label: 'Soft' },
  { key: 'floral', label: 'Floral' },
  { key: 'minimal', label: 'Minimal' },
  { key: 'vintage', label: 'Vintage' },
  { key: 'playful', label: 'Playful' },
  { key: 'retro', label: 'Retro' },
]

export function getTemplate(id: string): Template {
  return TEMPLATES.find(x => x.id === id) ?? TEMPLATES[0]
}
