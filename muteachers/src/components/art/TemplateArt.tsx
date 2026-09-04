/* ============================================================
   Template artwork — the frame a selfie is taken into.
   Each template is one flat image with an empty frame printed
   in it; the photo and the teacher's name are layered into that
   frame by <CardCanvas/>.
   ============================================================ */
import type { ArtKey } from '../../lib/types'
import { SLOTS } from '../../lib/slots'
import './template-art.css'

type Layer = 'back' | 'front'
type Props = { art: ArtKey; layer?: Layer }

/* ------------------------------------------------------------------ */
/**
 * A template is one flat piece of artwork with an empty frame printed into
 * it, painted in two passes:
 *
 *   layer="back"   the artwork itself, under everything
 *   layer="front"  `<id>-over.webp` — the same artwork with the empty
 *                  paper punched out to alpha, cropped to the frame —
 *                  laid back over the photo
 *
 * The photo sits between the two, so it shows through the punched hole
 * while the tape, disco balls and hearts the designer laid across the
 * frame still cover it.
 */
function PhotoArt({ art, src, layer }: { art: ArtKey; src: string; layer: Layer }) {
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

/* ---------------- Main Art Component ---------------- */
export function TemplateArt({ art, layer = 'back' }: Props) {
  return <PhotoArt art={art} src={`/templates/${art}.jpg`} layer={layer} />
}
