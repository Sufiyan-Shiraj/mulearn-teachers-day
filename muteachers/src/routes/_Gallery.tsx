import { Decoration } from '../components/art/Decorations'
import { DECO_ASPECT, DECO_GROUPS } from '../lib/decoMeta'
import { TEMPLATES } from '../lib/templates'
import { CardCanvas } from '../components/card/CardCanvas'
import { newDoc } from '../lib/store'

export default function Gallery() {
  return (
    <div style={{ padding: 24 }}>
      {DECO_GROUPS.map(g => (
        <div key={g.key} style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, marginBottom: 8 }}>{g.label}</h3>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            {g.items.map(k => (
              <div key={k} style={{ width: 92, height: 92 / (DECO_ASPECT[k] ?? 1), position: 'relative', background: '#e9e2d8' }}>
                <Decoration deco={k} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <h3 style={{ fontSize: 13, margin: '24px 0 10px' }}>Templates</h3>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {TEMPLATES.map(t => (
          <div key={t.id} style={{ width: 240 }}>
            <CardCanvas doc={{ ...newDoc(t.id), photo: '/WhatsApp Image 2026-09-04 at 20.28.30.jpeg' }} template={t} />
            <div style={{ fontSize: 12, textAlign: 'center', marginTop: 6 }}>{t.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
