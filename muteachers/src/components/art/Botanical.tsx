/* Delicate pressed-flower artwork used by the soft / floral templates. */

type Palette = { petal: string; petal2: string; centre: string; stem: string; leaf: string }

const PINK: Palette = { petal: '#f3c1bd', petal2: '#e9a5a2', centre: '#e9b44a', stem: '#93a37c', leaf: '#a3b189' }

function Blossom({ x, y, r, rot = 0, n = 5, p = PINK, o = 1 }:
  { x: number; y: number; r: number; rot?: number; n?: number; p?: Palette; o?: number }) {
  /* deterministic so the gradient id is stable across renders */
  const id = `bl-${Math.round(x)}-${Math.round(y)}-${Math.round(r * 10)}-${p.petal.slice(1)}`
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
      <defs>
        <radialGradient id={id} cx="50%" cy="88%" r="86%">
          <stop offset="0" stopColor={p.petal2} />
          <stop offset=".42" stopColor={p.petal} />
          <stop offset="1" stopColor="#fff" stopOpacity=".92" />
        </radialGradient>
      </defs>
      {Array.from({ length: n }).map((_, i) => (
        <path key={i}
          d={`M0 0 C ${-r * .44} ${-r * .34}, ${-r * .52} ${-r * .82}, ${-r * .16} ${-r * .97}
              C ${-r * .06} ${-r * .86}, ${r * .06} ${-r * .86}, ${r * .16} ${-r * .97}
              C ${r * .52} ${-r * .82}, ${r * .44} ${-r * .34}, 0 0 Z`}
          fill={`url(#${id})`}
          stroke={p.petal2} strokeOpacity=".28" strokeWidth={r * .022}
          transform={`rotate(${(360 / n) * i + (i % 2 ? 3 : -3)})`}
        />
      ))}
      <circle r={r * .2} fill={p.centre} />
      <circle r={r * .11} fill="#c98f1e" opacity=".55" />
    </g>
  )
}

function Bud({ x, y, r, rot = 0, p = PINK }: { x: number; y: number; r: number; rot?: number; p?: Palette }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse rx={r * .5} ry={r} fill={p.petal} />
      <path d={`M${-r * .5} ${r * .2} Q0 ${r * 1.1} ${r * .5} ${r * .2}`} fill={p.stem} opacity=".8" />
    </g>
  )
}

function Leaf({ x, y, l, rot = 0, p = PINK }: { x: number; y: number; l: number; rot?: number; p?: Palette }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M0 0 C ${-l * .34} ${-l * .3}, ${-l * .3} ${-l * .78}, 0 ${-l} C ${l * .3} ${-l * .78}, ${l * .34} ${-l * .3}, 0 0 Z`} fill={p.leaf} />
      <path d={`M0 0 V ${-l}`} stroke="#7b8a67" strokeWidth={l * .035} opacity=".45" />
    </g>
  )
}

/** a single flowering stem, drawn from the base upward */
export function Stem({ h = 240, lean = 8, p = PINK, seed = 1, blooms = 3 }:
  { h?: number; lean?: number; p?: Palette; seed?: number; blooms?: number }) {
  const rnd = (n: number) => {
    const x = Math.sin(seed * 99 + n * 37) * 10000
    return x - Math.floor(x)
  }
  return (
    <g>
      <path d={`M0 0 C ${lean * .4} ${-h * .35}, ${lean * .8} ${-h * .7}, ${lean} ${-h}`}
        stroke={p.stem} strokeWidth={h * .012} fill="none" strokeLinecap="round" />
      {Array.from({ length: 4 }).map((_, i) => {
        const t = .18 + i * .19
        return (
          <g key={`l${i}`}>
            <Leaf x={lean * t} y={-h * t} l={h * (.13 + rnd(i) * .05)} rot={i % 2 ? -58 - rnd(i) * 18 : 58 + rnd(i) * 18} p={p} />
          </g>
        )
      })}
      {Array.from({ length: blooms }).map((_, i) => {
        const t = .55 + i * .18
        const side = i % 2 ? 1 : -1
        return (
          <Blossom key={`b${i}`} x={lean * t + side * h * (.1 + rnd(i + 9) * .06)} y={-h * t}
            r={h * (.085 + rnd(i + 3) * .03)} rot={rnd(i + 5) * 90} p={p} />
        )
      })}
      <Bud x={lean} y={-h * .99} r={h * .045} rot={rnd(7) * 20 - 10} p={p} />
    </g>
  )
}

export function PressedSpray({ tone = 'pink' }: { tone?: 'pink' | 'sage' | 'lilac' }) {
  const p: Palette =
    tone === 'sage' ? { petal: '#dfe6d3', petal2: '#c9d5b8', centre: '#e6c766', stem: '#8c9b76', leaf: '#9fae86' }
    : tone === 'lilac' ? { petal: '#cdb6e0', petal2: '#b295cd', centre: '#f0d45e', stem: '#8b9a74', leaf: '#9dab85' }
    : PINK
  return (
    <svg viewBox="0 0 300 420" width="100%" height="100%" aria-hidden>
      <g transform="translate(70 415)"><Stem h={330} lean={16} p={p} seed={3} blooms={3} /></g>
      <g transform="translate(150 418)"><Stem h={260} lean={-22} p={p} seed={8} blooms={2} /></g>
      <g transform="translate(215 420)"><Stem h={300} lean={26} p={p} seed={14} blooms={3} /></g>
      <Blossom x={40} y={150} r={26} rot={18} p={p} o={.95} />
      <Blossom x={258} y={210} r={20} rot={-24} p={p} o={.9} />
      <Blossom x={120} y={92} r={16} rot={40} p={p} o={.85} />
    </svg>
  )
}

export function SingleBloom({ tone = 'pink', size = 120 }: { tone?: 'pink' | 'sage' | 'lilac'; size?: number }) {
  const p: Palette =
    tone === 'lilac' ? { petal: '#b795d0', petal2: '#9a76b8', centre: '#f2d55f', stem: '#8b9a74', leaf: '#9dab85' }
    : tone === 'sage' ? { petal: '#dfe6d3', petal2: '#c9d5b8', centre: '#e6c766', stem: '#8c9b76', leaf: '#9fae86' }
    : PINK
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden>
      <Blossom x={60} y={60} r={size * .42} n={8} p={p} />
    </svg>
  )
}
