/* ============================================================
   Sticker / decoration artwork.
   Every piece is a self-contained SVG that fills its box,
   so it stays crisp at any size on the card.
   ============================================================ */
import type { DecoKey } from '../../lib/types'

const S: React.SVGProps<SVGSVGElement> = { xmlns: 'http://www.w3.org/2000/svg', width: '100%', height: '100%' }

function uid(k: string) { return `d-${k}` }

/* ---------- hearts ---------- */
const HeartRed = () => (
  <svg {...S} viewBox="0 0 120 106" aria-hidden>
    <defs>
      <radialGradient id={uid('hr')} cx="34%" cy="26%" r="78%">
        <stop offset="0" stopColor="#ff8b80" /><stop offset=".38" stopColor="#e8241f" />
        <stop offset=".82" stopColor="#a80d0c" /><stop offset="1" stopColor="#750605" />
      </radialGradient>
      <radialGradient id={uid('hrs')} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#fff" stopOpacity=".95" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
    </defs>
    <path d="M60 102C46 90 8 63 4 38 1 18 14 3 31 3c12 0 23 8 29 19C66 11 77 3 89 3c17 0 30 15 27 35-4 25-42 52-56 64Z" fill={`url(#${uid('hr')})`} />
    <ellipse cx="36" cy="27" rx="17" ry="12" fill={`url(#${uid('hrs')})`} opacity=".85" transform="rotate(-28 36 27)" />
    <ellipse cx="83" cy="24" rx="8" ry="5" fill="#fff" opacity=".5" transform="rotate(-20 83 24)" />
    <path d="M22 62c6 12 20 24 33 33" stroke="#fff" strokeOpacity=".22" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
)

const HeartDoodleD = ({ c = '#d2372f' }: { c?: string }) => (
  <svg {...S} viewBox="0 0 120 108" fill="none" aria-hidden>
    <path d="M60 100C48 88 12 62 8 38 5 18 18 5 34 6c11 1 21 9 26 19 5-10 15-18 26-19 16-1 29 12 26 32-4 24-40 50-52 62Z"
      stroke={c} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const HeartOutline = ({ c = '#ffffff' }: { c?: string }) => (
  <svg {...S} viewBox="0 0 120 108" fill="none" aria-hidden>
    <path d="M60 98C49 87 15 63 11 40 8 22 20 10 34 11c10 1 20 8 25 17 5-9 15-16 25-17 14-1 26 11 23 29-4 23-36 47-47 58Z"
      stroke={c} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ---------- stars ---------- */
const StarGold = () => (
  <svg {...S} viewBox="0 0 124 120" aria-hidden>
    <defs>
      <linearGradient id={uid('sg')} x1="16%" y1="6%" x2="86%" y2="96%">
        <stop offset="0" stopColor="#f7d488" /><stop offset=".3" stopColor="#dfa63a" />
        <stop offset=".62" stopColor="#c07f1e" /><stop offset="1" stopColor="#8f5710" />
      </linearGradient>
    </defs>
    <path d="M62.0 4.0 Q69.8 18.5 76.1 40.6 Q99.1 39.8 115.3 42.7 Q103.8 54.6 84.8 67.4 Q92.7 89.0 94.9 105.3 Q80.1 98.1 62.0 84.0 Q43.9 98.1 29.1 105.3 Q31.3 89.0 39.2 67.4 Q20.2 54.6 8.7 42.7 Q24.9 39.8 47.9 40.6 Q54.2 18.5 62.0 4.0 Z"
      fill={`url(#${uid('sg')})`} />
    <path d="M62.0 20.0 Q67.5 30.4 72.0 46.2 Q88.4 45.6 100.0 47.6 Q91.8 56.1 78.2 65.3 Q83.8 80.7 85.5 92.4 Q74.9 87.1 62.0 77.0 Q49.1 87.1 38.5 92.4 Q40.2 80.7 45.8 65.3 Q32.2 56.1 24.0 47.6 Q35.6 45.6 52.0 46.2 Q56.5 30.4 62.0 20.0 Z"
      fill="none" stroke="#7d4c0d" strokeOpacity=".38" strokeWidth="1.8" strokeDasharray="5 4" />
    <ellipse cx="48" cy="32" rx="13" ry="7" fill="#fff" opacity=".32" transform="rotate(-30 48 32)" />
  </svg>
)

const StarSilver = () => (
  <svg {...S} viewBox="0 0 124 120" aria-hidden>
    <defs>
      <linearGradient id={uid('ss')} x1="14%" y1="4%" x2="84%" y2="96%">
        <stop offset="0" stopColor="#ffffff" /><stop offset=".22" stopColor="#e6eaee" />
        <stop offset=".46" stopColor="#a8b1ba" /><stop offset=".62" stopColor="#f2f5f8" />
        <stop offset=".82" stopColor="#98a2ac" /><stop offset="1" stopColor="#c9d1d8" />
      </linearGradient>
      <radialGradient id={uid('ssh')} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#fff" stopOpacity=".92" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
    </defs>
    <path d="M62.0 4.0 Q69.8 18.5 76.1 40.6 Q99.1 39.8 115.3 42.7 Q103.8 54.6 84.8 67.4 Q92.7 89.0 94.9 105.3 Q80.1 98.1 62.0 84.0 Q43.9 98.1 29.1 105.3 Q31.3 89.0 39.2 67.4 Q20.2 54.6 8.7 42.7 Q24.9 39.8 47.9 40.6 Q54.2 18.5 62.0 4.0 Z"
      fill={`url(#${uid('ss')})`} />
    <path d="M62.0 20.0 Q67.5 30.4 72.0 46.2 Q88.4 45.6 100.0 47.6 Q91.8 56.1 78.2 65.3 Q83.8 80.7 85.5 92.4 Q74.9 87.1 62.0 77.0 Q49.1 87.1 38.5 92.4 Q40.2 80.7 45.8 65.3 Q32.2 56.1 24.0 47.6 Q35.6 45.6 52.0 46.2 Q56.5 30.4 62.0 20.0 Z"
      fill="none" stroke="#7e878f" strokeOpacity=".35" strokeWidth="1.6" />
    <ellipse cx="46" cy="34" rx="15" ry="9" fill={`url(#${uid('ssh')})`} transform="rotate(-32 46 34)" />
    <ellipse cx="88" cy="52" rx="8" ry="4.5" fill="#fff" opacity=".7" transform="rotate(30 88 52)" />
    <path d="M40 74c6 8 13 14 20 18" stroke="#fff" strokeOpacity=".5" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
)

const StarDoodleD = ({ c = '#1a1a1a' }: { c?: string }) => (
  <svg {...S} viewBox="0 0 120 118" fill="none" aria-hidden>
    <path d="M60 8 74 44l38 2-29 25 9 39-32-21-32 21 9-39L8 46l38-2L60 8Z" stroke={c} strokeWidth="4.5" strokeLinejoin="round" />
    <path d="M18 33 104 82M104 34 17 83" stroke={c} strokeWidth="2.6" opacity=".5" />
  </svg>
)

const SparkleD = ({ c = '#ffffff' }: { c?: string }) => (
  <svg {...S} viewBox="0 0 100 100" aria-hidden>
    <path d="M50 2c3 24 20 41 46 48-26 7-43 24-46 48-3-24-20-41-46-48C30 43 47 26 50 2Z" fill={c} />
  </svg>
)

const Sparkle4 = ({ c = '#e0a63c' }: { c?: string }) => (
  <svg {...S} viewBox="0 0 100 100" fill="none" aria-hidden>
    <path d="M50 6v30M50 64v30M6 50h30M64 50h30" stroke={c} strokeWidth="6" strokeLinecap="round" />
  </svg>
)

/* ---------- flowers ---------- */
const Daisy = () => (
  <svg {...S} viewBox="0 0 120 120" aria-hidden>
    <defs>
      <radialGradient id={uid('dc')} cx="42%" cy="38%" r="62%">
        <stop offset="0" stopColor="#ffdf7a" /><stop offset=".6" stopColor="#f2a922" /><stop offset="1" stopColor="#c97c0a" />
      </radialGradient>
    </defs>
    <g>
      {Array.from({ length: 13 }).map((_, i) => (
        <ellipse key={i} cx="60" cy="24" rx="11" ry="25"
          fill={i % 2 ? '#fdfbf6' : '#ffffff'} stroke="#e6ded1" strokeWidth=".8"
          transform={`rotate(${(360 / 13) * i} 60 60)`} />
      ))}
    </g>
    <circle cx="60" cy="60" r="18" fill={`url(#${uid('dc')})`} />
    <circle cx="60" cy="60" r="18" fill="none" stroke="#a86608" strokeOpacity=".3" strokeWidth="1.4" />
    {Array.from({ length: 22 }).map((_, i) => {
      const a = (i / 22) * Math.PI * 2, r = 6 + (i % 3) * 3.4
      return <circle key={i} cx={60 + Math.cos(a) * r} cy={60 + Math.sin(a) * r} r="1.5" fill="#8f5606" opacity=".55" />
    })}
  </svg>
)

const Cosmos = ({ c = '#9a6fb0' }: { c?: string }) => (
  <svg {...S} viewBox="0 0 120 120" aria-hidden>
    <g>
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d="M60 58c-8-4-14-16-13-28 0-7 5-14 13-14s13 7 13 14c1 12-5 24-13 28Z"
          fill={c} opacity={i % 2 ? .92 : 1} transform={`rotate(${(360 / 8) * i} 60 60)`} />
      ))}
    </g>
    <circle cx="60" cy="60" r="12" fill="#f6d764" />
    <circle cx="60" cy="60" r="6" fill="#e0a63c" />
  </svg>
)

const Rose = ({ c = '#e8a4a8' }: { c?: string }) => (
  <svg {...S} viewBox="0 0 120 120" aria-hidden>
    {Array.from({ length: 6 }).map((_, i) => (
      <ellipse key={i} cx="60" cy="36" rx="19" ry="26" fill={c} opacity=".75"
        transform={`rotate(${(360 / 6) * i} 60 60)`} />
    ))}
    {Array.from({ length: 5 }).map((_, i) => (
      <ellipse key={`b${i}`} cx="60" cy="46" rx="12" ry="17" fill={c}
        transform={`rotate(${(360 / 5) * i + 20} 60 60)`} />
    ))}
    <circle cx="60" cy="60" r="9" fill="#c9737c" />
  </svg>
)

const Sprig = ({ c = '#7f9166' }: { c?: string }) => (
  <svg {...S} viewBox="0 0 80 140" fill="none" aria-hidden>
    <path d="M40 138C36 100 34 60 40 6" stroke={c} strokeWidth="3" strokeLinecap="round" />
    {Array.from({ length: 7 }).map((_, i) => {
      const y = 24 + i * 15
      return (
        <g key={i}>
          <path d={`M40 ${y} C22 ${y - 8} 14 ${y + 2} 10 ${y + 12} C24 ${y + 14} 36 ${y + 8} 40 ${y}`} fill={c} opacity=".85" />
          <path d={`M40 ${y + 7} C58 ${y - 1} 66 ${y + 9} 70 ${y + 19} C56 ${y + 21} 44 ${y + 15} 40 ${y + 7}`} fill={c} opacity=".7" />
        </g>
      )
    })}
  </svg>
)

const Leaf = ({ c = '#7f9166' }: { c?: string }) => (
  <svg {...S} viewBox="0 0 90 120" fill="none" aria-hidden>
    <path d="M45 6C18 34 12 76 45 116 78 76 72 34 45 6Z" fill={c} opacity=".92" />
    <path d="M45 12v100M45 40 22 56M45 40l23 16M45 66 24 82M45 66l21 16" stroke="#3f4c33" strokeOpacity=".35" strokeWidth="2" />
  </svg>
)

/* ---------- stationery ---------- */
function Tape({ fill, pattern }: { fill: string; pattern?: 'dots' | 'grid' | 'none' }) {
  const pid = `tp-${fill.replace(/[^a-z0-9]/gi, '')}-${pattern}`
  return (
    <svg {...S} viewBox="0 0 200 56" preserveAspectRatio="none" aria-hidden>
      <defs>
        {pattern === 'dots' && (
          <pattern id={pid} width="17" height="17" patternUnits="userSpaceOnUse">
            <circle cx="8.5" cy="8.5" r="4.1" fill="#1c1c1c" opacity=".9" />
          </pattern>
        )}
        {pattern === 'grid' && (
          <pattern id={pid} width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M12 0H0v12" fill="none" stroke="#a98c5f" strokeOpacity=".55" strokeWidth="1.4" />
          </pattern>
        )}
      </defs>
      <path d="M0 4 200 0v52L0 56Z" fill={fill} />
      {pattern && pattern !== 'none' && <path d="M0 4 200 0v52L0 56Z" fill={`url(#${pid})`} />}
      <path d="M0 4 200 0v52L0 56Z" fill="none" stroke="#000" strokeOpacity=".07" />
      <rect x="0" y="0" width="200" height="56" fill="#fff" opacity=".08" />
    </svg>
  )
}

const GridPatch = () => (
  <svg {...S} viewBox="0 0 120 150" aria-hidden>
    <defs>
      <pattern id={uid('gp')} width="11" height="11" patternUnits="userSpaceOnUse">
        <path d="M11 0H0v11" fill="none" stroke="#9d7c4c" strokeOpacity=".7" strokeWidth="1.1" />
      </pattern>
    </defs>
    <path d="M6 4 114 0l4 146-110 4Z" fill="#e6d7ba" />
    <path d="M6 4 114 0l4 146-110 4Z" fill={`url(#${uid('gp')})`} />
    <path d="M6 4 114 0l4 146-110 4Z" fill="none" stroke="#b79a6b" strokeOpacity=".5" />
  </svg>
)

const Pin = () => (
  <svg {...S} viewBox="0 0 60 70" aria-hidden>
    <circle cx="30" cy="22" r="18" fill="#d2372f" />
    <circle cx="24" cy="16" r="6" fill="#fff" opacity=".45" />
    <path d="M30 38v28" stroke="#8c8c8c" strokeWidth="3.4" strokeLinecap="round" />
  </svg>
)

const Stamp = () => (
  <svg {...S} viewBox="0 0 110 130" aria-hidden>
    <path d="M6 6h98v118H6z" fill="#f6efe3" stroke="#d9c9ad" strokeWidth="2" strokeDasharray="7 5" />
    <rect x="16" y="16" width="78" height="76" rx="2" fill="#c8ac7d" opacity=".45" />
    <path d="M20 88 44 54l18 20 14-14 14 28Z" fill="#8b6f47" opacity=".65" />
    <circle cx="70" cy="34" r="8" fill="#e2c489" />
    <text x="55" y="112" textAnchor="middle" fontFamily="serif" fontSize="15" fill="#8b6f47">THANKS</text>
  </svg>
)

const Disco = () => (
  <svg {...S} viewBox="0 0 120 120" aria-hidden>
    <defs>
      <radialGradient id={uid('db')} cx="34%" cy="28%" r="72%">
        <stop offset="0" stopColor="#ffffff" /><stop offset=".38" stopColor="#cfd6dc" />
        <stop offset=".72" stopColor="#8b949e" /><stop offset="1" stopColor="#4d545c" />
      </radialGradient>
      <clipPath id={uid('dbc')}><circle cx="60" cy="60" r="56" /></clipPath>
    </defs>
    <circle cx="60" cy="60" r="56" fill={`url(#${uid('db')})`} />
    <g clipPath={`url(#${uid('dbc')})`} opacity=".55">
      {Array.from({ length: 15 }).map((_, i) => <path key={`h${i}`} d={`M0 ${i * 8 + 2}H120`} stroke="#3d444b" strokeWidth="1" />)}
      {Array.from({ length: 15 }).map((_, i) => <path key={`v${i}`} d={`M${i * 8 + 2} 0V120`} stroke="#3d444b" strokeWidth="1" />)}
      {Array.from({ length: 34 }).map((_, i) => (
        <rect key={`s${i}`} x={(i * 29) % 112} y={((i * 47) % 112)} width="7" height="7" fill="#fff" opacity={(i % 5) / 7 + .18} />
      ))}
    </g>
    <circle cx="42" cy="38" r="14" fill="#fff" opacity=".3" />
  </svg>
)

const Vinyl = () => (
  <svg {...S} viewBox="0 0 120 120" aria-hidden>
    <circle cx="60" cy="60" r="58" fill="#141414" />
    {Array.from({ length: 9 }).map((_, i) => (
      <circle key={i} cx="60" cy="60" r={22 + i * 4} fill="none" stroke="#2e2e2e" strokeWidth=".9" />
    ))}
    <circle cx="60" cy="60" r="20" fill="#b8232a" />
    <circle cx="60" cy="60" r="20" fill="none" stroke="#7d1418" strokeWidth="1.2" />
    <circle cx="60" cy="60" r="4" fill="#f6efe3" />
    <path d="M20 30a56 56 0 0 1 44-24" stroke="#fff" strokeOpacity=".14" strokeWidth="7" fill="none" strokeLinecap="round" />
  </svg>
)

const GradCap = () => (
  <svg {...S} viewBox="0 0 140 110" aria-hidden>
    <path d="M70 8 136 36 70 64 4 36Z" fill="#1d1d1f" />
    <path d="M70 8 136 36 70 64 4 36Z" fill="none" stroke="#000" strokeOpacity=".5" />
    <path d="M26 46v26c0 10 20 18 44 18s44-8 44-18V46L70 70Z" fill="#232326" />
    <path d="M124 40v34" stroke="#d9a441" strokeWidth="3.2" strokeLinecap="round" />
    <path d="M124 74c-6 6-6 20-2 26" stroke="#d9a441" strokeWidth="3.2" strokeLinecap="round" fill="none" />
    <circle cx="124" cy="40" r="4" fill="#d9a441" />
  </svg>
)

const Pencil = ({ c = '#e0a63c' }: { c?: string }) => (
  <svg {...S} viewBox="0 0 160 46" aria-hidden>
    <path d="M30 6h108a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H30Z" fill={c} />
    <path d="M30 6 4 23l26 17Z" fill="#f0dcc0" />
    <path d="M14 29 4 23l10-6Z" fill="#3d3733" />
    <path d="M144 12h10a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6h-10Z" fill="#e07a6f" />
    <path d="M30 16h108M30 30h108" stroke="#000" strokeOpacity=".12" strokeWidth="2" />
  </svg>
)

const Apple = () => (
  <svg {...S} viewBox="0 0 110 120" aria-hidden>
    <path d="M55 30c-9-8-24-10-34-2C8 38 6 62 14 84c6 16 17 30 26 30 6 0 9-3 15-3s9 3 15 3c9 0 20-14 26-30 8-22 6-46-7-56-10-8-25-6-34 2Z" fill="#c9262b" />
    <path d="M40 42c-8 6-12 20-10 34" stroke="#fff" strokeOpacity=".25" strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M55 30c0-12 4-20 12-24" stroke="#6b4a24" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M58 16c10-10 24-10 30-4-2 10-16 16-30 4Z" fill="#5c8a45" />
  </svg>
)

const Ribbon = ({ c = '#d2372f' }: { c?: string }) => (
  <svg {...S} viewBox="0 0 120 130" aria-hidden>
    <circle cx="60" cy="46" r="38" fill={c} />
    <circle cx="60" cy="46" r="28" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2.4" />
    <path d="M60 30 66 42l13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2Z" fill="#fff" opacity=".9" />
    <path d="M38 78 26 126l24-14 22 14-12-48Z" fill={c} opacity=".85" />
  </svg>
)

function Sticker({ label, bg, fg, rot = 0 }: { label: string; bg: string; fg: string; rot?: number }) {
  return (
    <svg {...S} viewBox="0 0 220 92" aria-hidden>
      <g transform={`rotate(${rot} 110 46)`}>
        <rect x="6" y="10" width="208" height="72" rx="36" fill={bg} />
        <rect x="6" y="10" width="208" height="72" rx="36" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="4" />
        <text x="110" y="60" textAnchor="middle" fontFamily="Caveat, cursive" fontWeight="700" fontSize="40" fill={fg}>{label}</text>
      </g>
    </svg>
  )
}

/* ---------- registry ---------- */
export function Decoration({ deco, color }: { deco: DecoKey; color?: string }) {
  switch (deco) {
    case 'heart-red': return <HeartRed />
    case 'heart-doodle': return <HeartDoodleD c={color} />
    case 'heart-outline': return <HeartOutline c={color} />
    case 'star-gold': return <StarGold />
    case 'star-silver': return <StarSilver />
    case 'star-doodle': return <StarDoodleD c={color} />
    case 'sparkle': return <SparkleD c={color} />
    case 'sparkle-4': return <Sparkle4 c={color} />
    case 'daisy': return <Daisy />
    case 'cosmos': return <Cosmos c={color} />
    case 'rose': return <Rose c={color} />
    case 'leaf': return <Leaf c={color} />
    case 'sprig': return <Sprig c={color} />
    case 'tape-dots': return <Tape fill="#e3cfa6" pattern="dots" />
    case 'tape-kraft': return <Tape fill="#d9bf93" pattern="grid" />
    case 'tape-red': return <Tape fill="#c8393a" pattern="dots" />
    case 'tape-washi': return <Tape fill="#cdbfdd" pattern="none" />
    case 'grid-patch': return <GridPatch />
    case 'paperclip': return (
      <svg {...S} viewBox="0 0 24 46" fill="none" aria-hidden>
        <path d="M17.5 12.5v20.8c0 4.4-2.6 7.2-6.2 7.2S5 37.7 5 33.3V10.6C5 7.5 6.9 5.4 9.5 5.4s4.4 2.1 4.4 5.2v21.7c0 1.8-.9 3-2.4 3s-2.4-1.2-2.4-3V13.4"
          stroke={color ?? '#9aa2ad'} strokeWidth="2.1" strokeLinecap="round" />
      </svg>
    )
    case 'pin': return <Pin />
    case 'stamp': return <Stamp />
    case 'smiley': return (
      <svg {...S} viewBox="0 0 100 100" fill="none" aria-hidden>
        <circle cx="50" cy="50" r="42" stroke={color ?? '#1a1a1a'} strokeWidth="6" />
        <path d="M32 60c8 12 28 12 36 0" stroke={color ?? '#1a1a1a'} strokeWidth="6" strokeLinecap="round" />
        <circle cx="36" cy="40" r="5" fill={color ?? '#1a1a1a'} /><circle cx="64" cy="40" r="5" fill={color ?? '#1a1a1a'} />
      </svg>
    )
    case 'squiggle': return (
      <svg {...S} viewBox="0 0 180 30" fill="none" aria-hidden>
        <path d="M4 16c10-16 22 16 32 0s22 16 32 0 22 16 32 0 22 16 32 0 22 16 32 0" stroke={color ?? '#e0a63c'} strokeWidth="4.5" strokeLinecap="round" />
      </svg>
    )
    case 'arrow': return (
      <svg {...S} viewBox="0 0 120 66" fill="none" aria-hidden>
        <path d="M4 48C20 18 60 5 100 17" stroke={color ?? '#d2372f'} strokeWidth="4.4" strokeLinecap="round" />
        <path d="M81 9 103 18l-9 18" stroke={color ?? '#d2372f'} strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
    case 'burst': return (
      <svg {...S} viewBox="0 0 90 74" fill="none" aria-hidden>
        <path d="M8 8 30 24M6 38h26M12 66 30 50" stroke={color ?? '#d2372f'} strokeWidth="6" strokeLinecap="round" />
        <path d="M82 8 60 24M84 38H58M78 66 60 50" stroke={color ?? '#d2372f'} strokeWidth="6" strokeLinecap="round" opacity=".8" />
      </svg>
    )
    case 'underline': return (
      <svg {...S} viewBox="0 0 200 16" fill="none" preserveAspectRatio="none" aria-hidden>
        <path d="M4 10C34 4 72 2 108 3c30 1 60 3 88 7" stroke={color ?? '#d2372f'} strokeWidth="4" strokeLinecap="round" />
      </svg>
    )
    case 'disco': return <Disco />
    case 'vinyl': return <Vinyl />
    case 'gradcap': return <GradCap />
    case 'pencil': return <Pencil c={color} />
    case 'apple': return <Apple />
    case 'ribbon': return <Ribbon c={color} />
    case 'sticker-thanks': return <Sticker label="thank you!" bg="#f6d764" fg="#5a3d05" rot={-3} />
    case 'sticker-best': return <Sticker label="best teacher" bg="#cdbfdd" fg="#3f2c55" rot={2} />
    case 'sticker-star': return <Sticker label="you're a star" bg="#f4b8b0" fg="#7a1f18" rot={-2} />
    default: return null
  }
}
