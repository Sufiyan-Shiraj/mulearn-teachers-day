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
}

export const SLOTS: Record<ArtKey, Slot> = {
  disco: {
    box: [18.82, 39.44, 68.44, 40.34],
    rot: -7.9,
    over: [10.455, 34.545, 85.727, 50.205],
    /* the polaroid's own white lower border */
    name: [18.0, 83.0, 64.0, 7.0],
    nameSize: 38,
  },
  scrapbook: {
    box: [16.6, 24.34, 69.5, 49.51],
    rot: -4.1,
    over: [9.818, 21.837, 82.273, 56.198],
    /* above the dashed write-here line */
    name: [24.0, 81.8, 56.0, 4.6],
    nameSize: 30,
  },
  velvet: {
    box: [48.3, 18.41, 41.73, 31.62],
    rot: 9.9,
    over: [40.455, 13.096, 57.545, 42.276],
    /* the ruled kraft strip */
    name: [14.0, 72.0, 72.0, 15.0],
    nameSize: 46,
  },
  thankyou: {
    box: [26.35, 28.56, 46.42, 32.0],
    rot: -5.0,
    over: [20.545, 24.595, 58.727, 39.832],
    /* the cream torn banner */
    name: [10.0, 75.5, 80.0, 13.0],
    nameSize: 46,
  },
  pressed: {
    box: [29.18, 30.06, 42.18, 30.25],
    rot: 0,
    over: [24.727, 26.943, 51.182, 36.561],
    /* the printed "To:" line */
    name: [37.0, 81.8, 34.0, 4.2],
    nameSize: 26,
  },
  grateful: {
    box: [16.82, 25.44, 47.91, 43.56],
    rot: 0,
    over: [12.364, 22.348, 56.909, 49.811],
    /* the white stitched box */
    name: [13.0, 76.5, 73.0, 12.5],
    nameSize: 42,
  },
  lilac: {
    box: [33.31, 32.48, 40.23, 28.94],
    rot: 8.7,
    over: [26.0, 27.558, 55.0, 38.92],
    /* the cream torn strip */
    name: [15.0, 80.0, 70.0, 11.0],
    nameSize: 40,
  },
}

/** the photo element for a template, sized and turned to sit in its frame */
export function slotPhoto(art: ArtKey) {
  const s = SLOTS[art]
  return { box: s.box, rot: s.rot }
}
