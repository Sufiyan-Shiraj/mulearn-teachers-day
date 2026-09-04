import type { CardElement, Template } from './types'

/* helpers keep the template table readable */
const t = (
  id: string, face: 'front' | 'back', box: [number, number, number, number],
  o: Partial<Extract<CardElement, { kind: 'text' }>> = {},
): CardElement => ({
  kind: 'text', id, face, box: { x: box[0], y: box[1], w: box[2], h: box[3] },
  rot: 0, text: '', placeholder: 'Tap to write…', font: 'playful', size: 46,
  color: '#1a1a1a', align: 'center', lh: 1.25, plate: 'none', ...o,
})

const p = (
  id: string, face: 'front' | 'back', box: [number, number, number, number],
  o: Partial<Extract<CardElement, { kind: 'photo' }>> = {},
): CardElement => ({
  kind: 'photo', id, face, box: { x: box[0], y: box[1], w: box[2], h: box[3] },
  rot: 0, frame: 'polaroid', zoom: 1, ox: 0, oy: 0, tape: 'none', ...o,
})

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
      p('dc-photo', 'front', [17.6, 39.9, 65.4, 41.2], { rot: -7.4, frame: 'slot' }),
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
      p('sc-photo', 'front', [20.6, 28.6, 65.6, 41.6], { rot: 6.2, frame: 'slot' }),
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
    aspect: 896 / 1200,
    art: 'velvet',
    accent: '#7b1113',
    dark: true,
    isNew: true,
    elements: [
      p('v-photo', 'front', [47.5, 23.0, 34.0, 27.5], { rot: 7.8, frame: 'slot' }),
      t('v-msg', 'front', [19, 69, 62, 14], {
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
    aspect: 896 / 1200,
    art: 'thankyou',
    accent: '#74100f',
    dark: true,
    isNew: true,
    elements: [
      p('ty-photo', 'front', [31.5, 31.0, 36.5, 28.5], { rot: -10.3, frame: 'slot' }),
      t('ty-msg', 'front', [18.5, 74.0, 63, 8], {
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
    aspect: 896 / 1200,
    art: 'pressed',
    accent: '#c98f8a',
    elements: [
      p('pr-photo', 'front', [35.2, 36.5, 31.0, 24.0], { rot: 0, frame: 'slot' }),
      t('pr-msg', 'front', [33, 76.5, 34, 8], {
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
    aspect: 896 / 1200,
    art: 'grateful',
    accent: '#1a1a1a',
    dark: true,
    elements: [
      p('gr-photo', 'front', [26.5, 31.8, 34.0, 33.0], { rot: 0, frame: 'arch-slot' }),
      t('gr-msg', 'front', [24.5, 70.0, 51, 8.5], {
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
    aspect: 896 / 1200,
    art: 'lilac',
    accent: '#8c63a9',
    elements: [
      p('li-photo', 'front', [35.8, 33.8, 34.5, 26.8], { rot: 0, frame: 'slot' }),
      t('li-msg', 'front', [22, 76.0, 56, 9], {
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
