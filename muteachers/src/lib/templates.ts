import type { ArtKey, CardElement, Template } from './types'
import { SLOTS } from './slots'

/* helpers keep the template table readable */
const t = (
  id: string, face: 'front' | 'back', box: [number, number, number, number],
  o: Partial<Extract<CardElement, { kind: 'text' }>> = {},
): CardElement => ({
  kind: 'text', id, face, box: { x: box[0], y: box[1], w: box[2], h: box[3] },
  rot: 0, text: '', placeholder: 'Tap to write…', font: 'playful', size: 46,
  color: '#1a1a1a', align: 'center', lh: 1.25, plate: 'none', ...o,
})

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
    kind: 'photo', id, face: 'front', box: { x, y, w, h },
    rot: SLOTS[art].rot, frame: 'slot', zoom: 1, ox: 0, oy: 0, tape: 'none', ...o,
  }
}

export const makeDeco = (
  id: string, face: 'front' | 'back', deco: Extract<CardElement, { kind: 'deco' }>['deco'],
  box: [number, number, number, number], rot = 0, color?: string,
): CardElement => ({
  kind: 'deco', id, face, deco, box: { x: box[0], y: box[1], w: box[2], h: box[3] }, rot, color })

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
      t('dc-msg', 'front', [14, 29.5, 72, 8], {
        text: 'Thank you for being more than a teacher — you are a guide, an inspiration, and a reason I believe in myself.',
        font: 'classic', size: 27, color: '#fdf7ec', align: 'center', lh: 1.45, label: 'Message', maxLen: 220,
      }),
      t('dc-bt', 'back', [12, 13, 76, 6], {
        text: 'A note for you', font: 'elegant', size: 50, color: '#e8c88a', align: 'center', label: 'Title', maxLen: 40,
      }),
      t('dc-bnote', 'back', [12, 22, 76, 54], {
        text: '', placeholder: 'Write your personal note here…', font: 'playful', size: 44,
        color: '#f6ece0', align: 'left', lh: 1.55, label: 'Personal note', maxLen: 600,
      }),
      t('dc-bsign', 'back', [12, 80, 76, 6], {
        text: '', placeholder: '— your name', font: 'playful', size: 34, color: '#e8c88a', align: 'right', label: 'Signature', maxLen: 40,
      }),
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
      t('sc-msg', 'front', [17, 86.5, 66, 5], {
        text: '', placeholder: 'write here…', font: 'playful', size: 38,
        color: '#33302b', align: 'center', rot: 3.2, label: 'Message', maxLen: 60,
      }),
      t('sc-bt', 'back', [14, 14, 72, 7], {
        text: 'Dear Teacher', font: 'playful', size: 56, color: '#2f3a44', align: 'center', label: 'Title', maxLen: 40,
      }),
      t('sc-bnote', 'back', [14, 24, 72, 50], {
        text: '', placeholder: 'Write your personal note here…', font: 'playful', size: 50,
        color: '#3a3630', align: 'left', lh: 1.55, label: 'Personal note', maxLen: 600,
      }),
      t('sc-bsign', 'back', [14, 78, 72, 7], {
        text: '', placeholder: '— your name', font: 'playful', size: 38, color: '#7a4a10', align: 'right', label: 'Signature', maxLen: 40,
      }),
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
      t('v-msg', 'front', [13, 71, 74, 16], {
        text: 'Thank you for inspiring me every day!', font: 'playful', size: 40,
        color: '#3a2b20', align: 'center', lh: 1.35, label: 'Message', maxLen: 140,
      }),
      /* back */
      t('v-bt', 'back', [12, 12, 76, 7], {
        text: 'A note for you', font: 'elegant', size: 62, color: '#e8c88a', align: 'center', label: 'Title', maxLen: 40,
      }),
      t('v-bnote', 'back', [12, 23, 76, 52], {
        text: '', placeholder: 'Write your personal note here…',
        font: 'playful', size: 52, color: '#f6ece0', align: 'left', lh: 1.55,
        label: 'Personal note', maxLen: 600,
      }),
      t('v-bsign', 'back', [12, 80, 76, 7], {
        text: '', placeholder: '— your name', font: 'playful', size: 42,
        color: '#e8c88a', align: 'right', label: 'Signature', maxLen: 40,
      }),
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
      t('ty-msg', 'front', [8.5, 76.0, 83.0, 11.0], {
        text: "Happy Teacher's Day!", font: 'playful', size: 44, color: '#3a231c',
        align: 'center', label: 'Message', maxLen: 90,
      }),
      /* back */
      t('ty-bt', 'back', [12, 13, 76, 7], {
        text: 'With gratitude', font: 'elegant', size: 54, color: '#f0dcc0', align: 'center', label: 'Title', maxLen: 40,
      }),
      t('ty-bnote', 'back', [12, 24, 76, 52], {
        text: '', placeholder: 'Write your personal note here…', font: 'playful', size: 50,
        color: '#fdf7ec', align: 'left', lh: 1.55, label: 'Personal note', maxLen: 600,
      }),
      t('ty-bsign', 'back', [12, 80, 76, 7], {
        text: '', placeholder: '— your name', font: 'playful', size: 38, color: '#e8c88a', align: 'right', label: 'Signature', maxLen: 40,
      }),
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
      t('pr-msg', 'front', [26.0, 80.5, 48.0, 11.5], {
        text: '', placeholder: 'To: / From: note…', font: 'playful', size: 38,
        color: '#5b4a43', align: 'center', label: 'Note', maxLen: 80,
      }),
      /* back */
      t('pr-bt', 'back', [12, 14, 76, 7], {
        text: 'With love', font: 'elegant', size: 54, color: '#a5736e', align: 'center', label: 'Title', maxLen: 40,
      }),
      t('pr-bnote', 'back', [13, 25, 74, 50], {
        text: '', placeholder: 'Write your personal note here…', font: 'playful', size: 50,
        color: '#4a3f3a', align: 'left', lh: 1.55, label: 'Personal note', maxLen: 600,
      }),
      t('pr-bsign', 'back', [13, 79, 74, 7], {
        text: '', placeholder: '— your name', font: 'playful', size: 38, color: '#a5736e', align: 'right', label: 'Signature', maxLen: 40,
      }),
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
      t('gr-msg', 'front', [13.5, 77.0, 73.0, 12.0], {
        text: "Happy Teacher's Day!", font: 'playful', size: 42, color: '#2e2a26',
        align: 'center', label: 'Message', maxLen: 90,
      }),
      /* back */
      t('gr-bt', 'back', [12, 14, 76, 7], {
        text: 'Thank you', font: 'elegant', size: 54, color: '#ffffff', align: 'center', label: 'Title', maxLen: 40,
      }),
      t('gr-bnote', 'back', [13, 25, 74, 50], {
        text: '', placeholder: 'Write your personal note here…', font: 'playful', size: 50,
        color: '#efe7dc', align: 'left', lh: 1.55, label: 'Personal note', maxLen: 600,
      }),
      t('gr-bsign', 'back', [13, 79, 74, 7], {
        text: '', placeholder: '— your name', font: 'playful', size: 38, color: '#c9c2b8', align: 'right', label: 'Signature', maxLen: 40,
      }),
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
      t('li-msg', 'front', [16.0, 79.0, 68.0, 11.5], {
        text: "Happy Teacher's Day!", font: 'playful', size: 44,
        color: '#4b385e', align: 'center', label: 'Message', maxLen: 120,
      }),
      /* back */
      t('li-bt', 'back', [12, 14, 76, 7], {
        text: 'Just for you', font: 'elegant', size: 54, color: '#8c63a9', align: 'center', label: 'Title', maxLen: 40,
      }),
      t('li-bnote', 'back', [13, 25, 74, 50], {
        text: '', placeholder: 'Write your personal note here…', font: 'playful', size: 50,
        color: '#4b3b57', align: 'left', lh: 1.55, label: 'Personal note', maxLen: 600,
      }),
      t('li-bsign', 'back', [13, 79, 74, 7], {
        text: '', placeholder: '— your name', font: 'playful', size: 38, color: '#8c63a9', align: 'right', label: 'Signature', maxLen: 40,
      }),
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
