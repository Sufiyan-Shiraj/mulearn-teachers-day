/* ============================================================
   Photo slots
   ------------------------------------------------------------
   Every template is a flat piece of artwork with one empty
   frame printed into it. These numbers say exactly where that
   frame is, measured off the artwork itself rather than guessed
   by eye: the empty paper was flood-filled from inside the
   frame and a minimum-area rectangle fitted to the result.

   `box` / `rot` place the user's photo.
   `over` places `<id>-over.webp` — the same artwork with the
   empty paper punched out — so the photo tucks in *behind* the
   card and anything the designer laid across the frame (tape,
   a disco ball, a heart) still covers it.

   All four numbers of a rect are percentages of the card:
   x and w of its width, y and h of its height.
   Regenerate with tools/slots.py after changing any artwork.
   ============================================================ */
import type { ArtKey } from './types'

export type Rect = [x: number, y: number, w: number, h: number]

export interface LogoConfig {
  /** percentage from left */
  x: number
  /** percentage from top */
  y: number
  /** width percentage of the card */
  w: number
  /** whether to use white vector logo on dark backgrounds */
  invert?: boolean
  /** subtle opacity to blend naturally into card textures */
  opacity?: number
}

export interface Slot {
  box: Rect
  rot: number
  over: Rect
  /**
   * Where the teacher's name goes.
   *
   * Every template was drawn with somewhere to write — a torn kraft strip, a
   * dashed line, the polaroid's own lower border, a printed "To:" field. These
   * are those areas, so the name lands where the artwork intended instead of
   * needing a text tool. Verified by rendering a name into each one.
   */
  name: Rect
  /** font size in design units, sized to the slot it sits in */
  nameSize: number
  /** angle for the name, if rotated to match tilted artwork (e.g. polaroid chin) */
  nameRot?: number
  /** horizontal stretch factor to sit flat on the perspective/tilt */
  scaleX?: number
  /**
   * Brand mark placement: balanced unobtrusive spot outside card photo & name zones.
   * Optional if the template artwork already contains the brand mark.
   */
  logo?: LogoConfig
}

export const SLOTS: Record<ArtKey, Slot> = {
  disco: {
    box: [18.82, 39.44, 68.44, 40.34],
    rot: -7.9,
    over: [10.455, 34.545, 85.727, 50.205],
    /* the polaroid's own white lower border, parallel at -7.9° */
    name: [17.5, 81.5, 70.0, 7.0],
    nameRot: -7.9,
    scaleX: 1.08,
    nameSize: 40,
    /* centered directly under the 'Happy TEACHERS DAY' gold heart flourish */
    logo: { x: 50.0, y: 30.3, w: 13.0, invert: true, opacity: 0.9 },
  },
  scrapbook: {
    box: [16.6, 24.34, 69.5, 49.51],
    rot: -4.1,
    over: [9.818, 21.837, 82.273, 56.198],
    /* above the dashed write-here line, parallel at -4.1° */
    name: [18.0, 80.0, 68.0, 6.0],
    nameRot: -4.1,
    scaleX: 1.06,
    nameSize: 32,
    /* already contains μLearn ASI in artwork header */
  },
  velvet: {
    box: [48.3, 18.41, 41.73, 31.62],
    rot: 9.9,
    over: [40.455, 13.096, 57.545, 42.276],
    /* the ruled kraft strip, aligned with ruled lines at 0.8° */
    name: [14.0, 72.0, 72.0, 14.0],
    nameRot: 0.8,
    scaleX: 1.05,
    nameSize: 46,
    /* top-left on red velvet above greeting, balances tilted polaroid */
    logo: { x: 23.0, y: 3.5, w: 13.5, invert: true, opacity: 0.9 },
  },
  thankyou: {
    box: [26.35, 28.56, 46.42, 32.0],
    rot: -5.0,
    over: [20.545, 24.595, 58.727, 39.832],
    /* the cream torn banner, parallel at -4.3° */
    name: [10.0, 76.5, 80.0, 12.0],
    nameRot: -4.3,
    scaleX: 1.08,
    nameSize: 46,
    /* upper right beneath 'THANK YOU', balancing the cursive flourish */
    logo: { x: 85.0, y: 15.2, w: 13.5, invert: true, opacity: 0.9 },
  },
  pressed: {
    box: [29.18, 30.06, 42.18, 30.25],
    rot: 0,
    over: [24.727, 26.943, 51.182, 36.561],
    /* the printed "To:" line, square at 0° */
    name: [37.0, 81.8, 34.0, 4.2],
    nameRot: 0.0,
    scaleX: 1.04,
    nameSize: 26,
    /* top-center on cream textured paper, clear of flowers and frame */
    logo: { x: 50.0, y: 3.0, w: 13.5, invert: false, opacity: 0.82 },
  },
  grateful: {
    box: [16.82, 25.44, 47.91, 43.56],
    rot: 0,
    over: [12.364, 22.348, 56.909, 49.811],
    /* the white stitched box, square at 0° */
    name: [14.0, 78.0, 72.0, 10.0],
    nameRot: 0.0,
    scaleX: 1.05,
    nameSize: 42,
    /* top-left on black linen, balances daisy emblem on upper right */
    logo: { x: 23.0, y: 3.4, w: 13.5, invert: true, opacity: 0.9 },
  },
  lilac: {
    box: [33.31, 32.48, 40.23, 28.94],
    rot: 8.7,
    over: [26.0, 27.558, 55.0, 38.92],
    /* the cream torn strip, parallel to cut edge at -1.6° */
    name: [15.0, 80.0, 70.0, 10.0],
    nameRot: -1.6,
    scaleX: 1.06,
    nameSize: 40,
    /* top-right on lavender wash, balances title lettering on left */
    logo: { x: 84.5, y: 4.5, w: 13.5, invert: false, opacity: 0.78 },
  },
}

/** the photo element for a template, sized and turned to sit in its frame */
export function slotPhoto(art: ArtKey) {
  const s = SLOTS[art]
  return { box: s.box, rot: s.rot }
}
