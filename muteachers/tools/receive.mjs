import { chromium } from 'playwright-core'
import { existsSync } from 'node:fs'; import { homedir } from 'node:os'; import path from 'node:path'
const root = path.join(homedir(), 'Library/Caches/ms-playwright')
const exe = ['chromium-1234/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium'].map(c => path.join(root, c)).find(p => existsSync(p))
const b = await chromium.launch({ executablePath: exe })
const mk = async (mobile) => {
  const ctx = await b.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 950 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 2 })
  const p = await ctx.newPage()
  await p.goto('http://localhost:5273/pick', { waitUntil: 'networkidle' })
  await p.locator('.pk-card').first().click(); await p.waitForTimeout(700)
  const buf = await (await fetch('http://localhost:5273/demo-photo.jpg')).arrayBuffer()
  await p.goto('http://localhost:5273/photo', { waitUntil: 'networkidle' })
  await p.setInputFiles('input[type=file]', { name: 'd.jpg', mimeType: 'image/jpeg', buffer: Buffer.from(buf) })
  await p.waitForURL('**/create'); await p.waitForTimeout(900)
  await p.evaluate(() => {
    const raw = localStorage.getItem('mut.card.current'); const d = JSON.parse(raw)
    d.to = 'Ms. Nair'; d.from = 'Ananya'
    const note = d.elements.find(e => e.face === 'back' && /note/i.test(e.label || ''))
    note.text = 'You made me believe I could do hard things.\nThank you for every patient answer, and for never once making me feel small.'
    const sig = d.elements.find(e => e.face === 'back' && /signature/i.test(e.label || ''))
    sig.text = '— Ananya'
    localStorage.setItem('mut.card.current', JSON.stringify(d))
  })
  await p.goto('http://localhost:5273/share', { waitUntil: 'networkidle' }); await p.waitForTimeout(1600)
  await p.locator('.sh-opt').first().scrollIntoViewIfNeeded(); await p.locator('.sh-opt').first().click(); await p.waitForTimeout(400)
  const link = await p.locator('.sh-link input').inputValue()
  const t = mobile ? 'm' : 'd'
  const p2 = await ctx.newPage()
  await p2.goto(link, { waitUntil: 'networkidle' }); await p2.waitForTimeout(1600)
  await p2.screenshot({ path: `shots/rc-${t}-front.png` })
  await p2.locator('.f-stage').click(); await p2.waitForTimeout(1300)
  await p2.screenshot({ path: `shots/rc-${t}-back.png` })
  console.log('✓', t, link)
  await ctx.close()
}
await mk(false); await mk(true)
await b.close()
