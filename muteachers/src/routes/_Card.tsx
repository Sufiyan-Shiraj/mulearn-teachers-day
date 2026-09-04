import { useSearchParams } from 'react-router-dom'
import { CardCanvas } from '../components/card/CardCanvas'
import { getTemplate } from '../lib/templates'
import { newDoc } from '../lib/store'

export default function CardDebug() {
  const [q] = useSearchParams()
  const id = q.get('t') ?? 'velvet'
  const w = Number(q.get('w') ?? 460)
  const t = getTemplate(id)
  const doc = { ...newDoc(id), photo: q.get('nophoto') ? undefined : '/demo-photo.jpg' }
  const cal = q.get('cal')
  return (
    <div style={{ display: 'flex', gap: 20, padding: 20, alignItems: 'flex-start' }}>
      <div style={{ width: w, flex: 'none', position: 'relative' }}>
        <CardCanvas doc={doc} template={t} face="front" />
        {cal && <Grid />}
      </div>
      {!q.get('front') && (
        <div style={{ width: w, flex: 'none', position: 'relative' }}>
          <CardCanvas doc={doc} template={t} face="back" />
          {cal && <Grid />}
        </div>
      )}
    </div>
  )
}

function Grid() {
  const lines = []
  for (let i = 0; i <= 100; i += 5) {
    lines.push(<div key={'v' + i} style={{ position: 'absolute', left: i + '%', top: 0, bottom: 0, width: 1, background: i % 25 === 0 ? '#0ff' : 'rgba(0,255,255,.42)' }} />)
    lines.push(<div key={'h' + i} style={{ position: 'absolute', top: i + '%', left: 0, right: 0, height: 1, background: i % 25 === 0 ? '#f0f' : 'rgba(255,0,255,.42)' }} />)
  }
  for (let i = 0; i <= 100; i += 10) {
    lines.push(<div key={'lx' + i} style={{ position: 'absolute', left: i + '%', top: 0, fontSize: 9, color: '#0ff', background: '#000', padding: '0 1px' }}>{i}</div>)
    lines.push(<div key={'ly' + i} style={{ position: 'absolute', top: i + '%', left: 0, fontSize: 9, color: '#f0f', background: '#000', padding: '0 1px' }}>{i}</div>)
  }
  return <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>{lines}</div>
}
