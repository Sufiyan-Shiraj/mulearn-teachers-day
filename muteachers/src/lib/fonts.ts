import type { FontKey } from './types'

export const FONTS: Record<FontKey, { label: string; stack: string; weight: number; lh: number; sample: string }> = {
  playful:     { label: 'Playful',     stack: 'var(--f-script)',  weight: 600, lh: 1.16, sample: 'Aa' },
  elegant:     { label: 'Elegant',     stack: 'var(--f-elegant)', weight: 600, lh: 1.18, sample: 'Aa' },
  typewriter:  { label: 'Typewriter',  stack: 'var(--f-type)',    weight: 400, lh: 1.42, sample: 'Aa' },
  handwritten: { label: 'Handwritten', stack: 'var(--f-hand)',    weight: 400, lh: 1.44, sample: 'Aa' },
  classic:     { label: 'Classic',     stack: 'var(--f-display)', weight: 500, lh: 1.28, sample: 'Aa' },
  bold:        { label: 'Bold',        stack: 'var(--f-sans)',    weight: 700, lh: 1.26, sample: 'Aa' },
}

export const FONT_ORDER: FontKey[] = ['playful', 'elegant', 'typewriter', 'handwritten', 'classic', 'bold']
