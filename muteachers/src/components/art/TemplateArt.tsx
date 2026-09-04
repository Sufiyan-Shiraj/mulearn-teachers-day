/* ============================================================
   Template artwork.
   Each template paints its own front / back background inside
   the design space. Interactive photo slots and text are layered
   on top of this by <CardCanvas/>.
   ============================================================ */
import type { ArtKey, Face } from '../../lib/types'
import { SLOTS } from '../../lib/slots'
import { Decoration } from './Decorations'
import { PressedSpray, SingleBloom } from './Botanical'
import './template-art.css'

type Layer = 'back' | 'front'
type Props = { art: ArtKey; face: Face; layer?: Layer }

const noise = (
  <svg className="ta-noise" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <filter id="ta-n">
      <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="4" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#ta-n)" />
  </svg>
)

const rules = <div className="ta-rules" aria-hidden />

/* ------------------------------------------------------------------ */
/**
 * The front of a card is one flat piece of artwork with an empty frame
 * printed into it, so it is painted in two passes:
 *
 *   layer="back"   the artwork itself, under everything
 *   layer="front"  `<id>-over.webp` — the same artwork with the empty
 *                  paper punched out to alpha, cropped to the frame —
 *                  laid back over the photo
 *
 * The photo sits between the two, so it shows through the punched hole
 * while the tape, disco balls and hearts the designer laid across the
 * frame still cover it. The back of a card is drawn in CSS and has no
 * photo, so it only ever paints on the back layer.
 */
function PhotoArt({ art, src, face, layer, back }: {
  art: ArtKey; src: string; face: Face; layer: Layer; back: React.ReactNode
}) {
  if (face === 'back') return layer === 'front' ? null : <>{back}</>

  if (layer === 'front') {
    const [x, y, w, h] = SLOTS[art].over
    return (
      <div className="ta ta-over" aria-hidden>
        <img
          className="ta-punch"
          src={src.replace(/\.jpg$/, '-over.webp')}
          alt=""
          draggable={false}
          style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
        />
      </div>
    )
  }

  return (
    <div className="ta">
      <img className="ta-full" src={src} alt="" draggable={false} />
    </div>
  )
}

/* ---------------- Card Backs ---------------- */
function DiscoBack() {
  return (
    <div className="ta ta-velvet ta-back">
      <div className="ta-velvet-bg" />
      <div className="ta-velvet-vignette" />
      <div className="ta-velvet-inner" />
      {rules}
      {noise}
      <div className="ta-abs" style={{ left: '5%', top: '4%', width: '14%', height: '8%', transform: 'rotate(-12deg)' }}>
        <Decoration deco="disco" />
      </div>
      <div className="ta-abs" style={{ left: '82%', top: '88%', width: '12%', height: '7%', transform: 'rotate(12deg)' }}>
        <Decoration deco="star-silver" />
      </div>
    </div>
  )
}

function ScrapBack() {
  return (
    <div className="ta ta-scrap-back">
      <div className="ta-scrap-bg" />
      {noise}
      <div className="ta-scrap-page" />
      {rules}
      <div className="ta-abs" style={{ left: '4%', top: '3%', width: '16%', height: '9%', transform: 'rotate(-8deg)' }}>
        <Decoration deco="tape-washi" />
      </div>
      <div className="ta-abs" style={{ left: '80%', top: '89%', width: '13%', height: '7.5%', transform: 'rotate(8deg)' }}>
        <Decoration deco="star-gold" />
      </div>
    </div>
  )
}

function VelvetBack() {
  return (
    <div className="ta ta-velvet ta-back">
      <div className="ta-velvet-bg" />
      <div className="ta-velvet-vignette" />
      <div className="ta-velvet-inner" />
      {rules}
      {noise}
      <div className="ta-abs" style={{ left: '6%', top: '4%', width: '12%', height: '7.6%', transform: 'rotate(-16deg)' }}>
        <Decoration deco="star-gold" />
      </div>
      <div className="ta-abs" style={{ left: '82%', top: '87%', width: '12%', height: '7.6%', transform: 'rotate(9deg)' }}>
        <Decoration deco="heart-red" />
      </div>
    </div>
  )
}

function ThankYouBack() {
  return (
    <div className="ta ta-thanks ta-back">
      <div className="ta-thanks-bg" />
      <div className="ta-thanks-inner" />
      {rules}
      {noise}
      <div className="ta-abs" style={{ left: '5%', top: '4%', width: '13%', height: '8%', transform: 'rotate(-10deg)' }}>
        <Decoration deco="disco" />
      </div>
      <div className="ta-abs" style={{ left: '81%', top: '88%', width: '13%', height: '8%', transform: 'rotate(8deg)' }}>
        <Decoration deco="star-silver" />
      </div>
    </div>
  )
}

function PressedBack() {
  return (
    <div className="ta ta-pressed ta-back">
      <div className="ta-pressed-bg" />
      {rules}
      {noise}
      <div className="ta-abs" style={{ left: '-8%', top: '62%', width: '42%', height: '42%', opacity: 0.65 }}>
        <PressedSpray tone="sage" />
      </div>
      <div className="ta-abs" style={{ left: '74%', top: '-3%', width: '34%', height: '34%', transform: 'rotate(180deg)', opacity: 0.55 }}>
        <PressedSpray tone="pink" />
      </div>
    </div>
  )
}

function GratefulBack() {
  return (
    <div className="ta ta-grateful ta-back">
      <div className="ta-grateful-bg" />
      <div className="ta-grateful-inner" />
      {rules}
      {noise}
      <div className="ta-abs" style={{ left: '5%', top: '4%', width: '12%', height: '7.5%', transform: 'rotate(-12deg)' }}>
        <Decoration deco="star-gold" />
      </div>
      <div className="ta-abs" style={{ left: '82%', top: '88%', width: '10%', height: '6.5%' }}>
        <Decoration deco="sparkle" color="rgba(255,255,255,.8)" />
      </div>
    </div>
  )
}

function LilacBack() {
  return (
    <div className="ta ta-lilac ta-back">
      <div className="ta-lilac-bg" />
      <div className="ta-lilac-inner" />
      {rules}
      {noise}
      <div className="ta-abs" style={{ left: '4%', top: '3%', width: '14%', height: '8%', transform: 'rotate(-6deg)' }}>
        <Decoration deco="tape-washi" />
      </div>
      <div className="ta-abs" style={{ left: '80%', top: '87%', width: '15%', height: '10%', transform: 'rotate(12deg)', opacity: 0.85 }}>
        <SingleBloom tone="lilac" />
      </div>
    </div>
  )
}

/* ---------------- Main Art Component ---------------- */
const BACKS: Record<ArtKey, () => React.ReactElement> = {
  disco: DiscoBack,
  scrapbook: ScrapBack,
  velvet: VelvetBack,
  thankyou: ThankYouBack,
  pressed: PressedBack,
  grateful: GratefulBack,
  lilac: LilacBack,
}

export function TemplateArt({ art, face, layer = 'back' }: Props) {
  const Back = BACKS[art]
  return (
    <PhotoArt
      art={art}
      src={`/templates/${art}.jpg`}
      face={face}
      layer={layer}
      back={<Back />}
    />
  )
}
