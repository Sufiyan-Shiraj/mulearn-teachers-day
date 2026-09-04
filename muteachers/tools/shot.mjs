import { chromium } from 'playwright-core'
import { existsSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

const base = process.env.BASE || 'http://localhost:5273'
const out = 'shots'
mkdirSync(out, { recursive: true })

// find a bundled chromium
const root = path.join(homedir(), 'Library/Caches/ms-playwright')
const candidates = ['chromium-1234/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium',
                    'chromium-1223/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium']
let exe = candidates.map(c => path.join(root, c)).find(p => existsSync(p))
if (!exe) exe = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const jobs = JSON.parse(process.argv[2])

const browser = await chromium.launch({ executablePath: exe, args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] })
for (const j of jobs) {
  const ctx = await browser.newContext({
    viewport: { width: j.w ?? 1440, height: j.h ?? 900 },
    deviceScaleFactor: j.dpr ?? 1,
    isMobile: !!j.mobile,
    hasTouch: !!j.mobile,
    permissions: ['camera'],
  })
  const page = await ctx.newPage()
  page.on('console', m => { if (m.type() === 'error') console.log('  [console]', m.text().slice(0, 200)) })
  page.on('pageerror', e => console.log('  [pageerror]', String(e).slice(0, 300)))
  if (j.seed) {
    await page.goto(base + '/pick', { waitUntil: 'networkidle' })
    await page.evaluate(async (tpl) => {
      const btns = [...document.querySelectorAll('.pk-card')]
      const i = ['velvet','thankyou','scrapbook','disco','pressed','grateful','lilac'].indexOf(tpl)
      btns[Math.max(0, i)].click()
    }, j.seed === true ? 'velvet' : j.seed)
    await page.waitForTimeout(700)
    await page.evaluate(async () => {
      const r = await fetch('/demo-photo.jpg'); const b = await r.blob()
      const d = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b) })
      const raw = localStorage.getItem('mut.card.current')
      if (raw) { const doc = JSON.parse(raw); doc.photo = d; doc.to = 'Ms. Nair'; doc.from = 'Ananya'
        const back = doc.elements.find(e => e.face === 'back' && /note/i.test(e.label || ''))
        if (back) back.text = 'You made me believe I could do hard things.\nThank you for every patient answer, and for never once making me feel small.'
        const sign = doc.elements.find(e => e.face === 'back' && /signature/i.test(e.label || ''))
        if (sign) sign.text = '— Ananya'
        localStorage.setItem('mut.card.current', JSON.stringify(doc)) }
    })
  }
  if (j.visitShare) { await page.goto(base + '/share', { waitUntil: 'networkidle' }); await page.waitForTimeout(1600) }
  await page.goto(base + (j.path ?? '/'), { waitUntil: 'networkidle' })
  if (j.script) await page.evaluate(j.script)
  await page.waitForTimeout(j.wait ?? 900)
  const file = `${out}/${j.name}.png`
  await page.screenshot({ path: file, fullPage: !!j.full })
  console.log('✓', file)
  await ctx.close()
}
await browser.close()
