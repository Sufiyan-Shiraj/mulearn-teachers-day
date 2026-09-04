import { chromium } from 'playwright-core'
import { existsSync } from 'node:fs'; import { homedir } from 'node:os'; import path from 'node:path'
const root = path.join(homedir(), 'Library/Caches/ms-playwright')
const exe = ['chromium-1234/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium'].map(c => path.join(root, c)).find(p => existsSync(p))
const b = await chromium.launch({ executablePath: exe })
const ctx = await b.newContext({ viewport: { width: 1440, height: 950 }, acceptDownloads: true })
const p = await ctx.newPage()
p.on('pageerror', e => console.log('  pageerror:', String(e).slice(0, 200)))
// seed a card
await p.goto('http://localhost:5273/pick', { waitUntil: 'networkidle' })
await p.locator('.pk-card').first().click()
await p.waitForTimeout(800)
const buf = await (await fetch('http://localhost:5273/demo-photo.jpg')).arrayBuffer()
await p.goto('http://localhost:5273/photo', { waitUntil: 'networkidle' })
await p.setInputFiles('input[type=file]', { name: 'd.jpg', mimeType: 'image/jpeg', buffer: Buffer.from(buf) })
await p.waitForURL('**/create'); await p.waitForTimeout(1200)
await p.goto('http://localhost:5273/share', { waitUntil: 'networkidle' })
await p.waitForTimeout(1500)
// wait for the background render to finish, then hit Save
await p.waitForFunction(() => /straight to your files/.test(document.body.innerText), null, { timeout: 40000 })
console.log('✓ images pre-rendered in the background')
const downloads = []
p.on('download', d => downloads.push(d))
await p.locator('.sh-opt--save').click()
await p.waitForTimeout(1200)
console.log('  toast:', JSON.stringify(await p.locator('.sh-toast').innerText().catch(() => '(none)')))
await p.waitForTimeout(2600)
console.log('  downloads fired:', downloads.length)
for (const d of downloads) {
  const f = 'shots/' + d.suggestedFilename()
  await d.saveAs(f)
  console.log('  ✓', d.suggestedFilename())
}
if (downloads.length !== 2) throw new Error('expected both sides to be saved, got ' + downloads.length)
// print drawer still available
await p.locator('.sh-opt').filter({ hasText: 'Print Your Card' }).click()
await p.waitForTimeout(400)
console.log('  print option present:', await p.locator('.sh-chan--wide').isVisible())
await b.close()
