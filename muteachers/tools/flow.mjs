import { chromium } from 'playwright-core'
import { existsSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

const base = process.env.BASE || 'http://localhost:5273'
mkdirSync('shots', { recursive: true })
const root = path.join(homedir(), 'Library/Caches/ms-playwright')
const exe = ['chromium-1234/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium',
             'chromium-1223/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium']
  .map(c => path.join(root, c)).find(p => existsSync(p))
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const mobile = process.argv.includes('--mobile')
const browser = await chromium.launch({ executablePath: exe, args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] })
const ctx = await browser.newContext({
  viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 950 },
  isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 2,
  permissions: ['camera'],
})
const page = await ctx.newPage()
const errs = []
page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })

const tag = mobile ? 'm' : 'd'
const shot = async n => { await page.screenshot({ path: `shots/flow-${tag}-${n}.png` }); console.log('  shot', n) }
const step = async (label, fn) => { process.stdout.write('▸ ' + label + '\n'); await fn() }

await step('landing', async () => {
  await page.goto(base + '/', { waitUntil: 'networkidle' })
  await page.getByRole('link', { name: /Create a Card/i }).first().click()
  await page.waitForURL('**/pick')
})

await step('pick a template', async () => {
  await page.locator('.pk-card').first().click()
  await page.waitForURL('**/photo', { timeout: 5000 })
})

await step('upload a photo', async () => {
  const buf = await (await fetch(base + '/demo-photo.jpg')).arrayBuffer()
  await page.setInputFiles('input[type=file]', { name: 'demo.jpg', mimeType: 'image/jpeg', buffer: Buffer.from(buf) })
  await page.waitForURL('**/create', { timeout: 8000 })
  await page.waitForTimeout(1200)
  await shot('01-editor')
})

await step('tap the message text and type', async () => {
  const msg = page.locator('.c-el--text').filter({ hasText: 'Thank you for' }).first()
  await msg.click()               // select
  await page.waitForTimeout(220)
  await shot('02-selected')
  await msg.click()               // enter editing
  await page.waitForTimeout(320)
  const box = page.locator('.c-text-edit')
  await box.waitFor({ timeout: 3000 })
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Meta+A')
  await page.keyboard.type('You made me love the subject')
  await page.waitForTimeout(300)
  await shot('03-typing')
  const val = await box.innerText()
  console.log('  text now:', JSON.stringify(val))
  if (!val.includes('love the subject')) throw new Error('typing on the card did not register')
})

await step('change the font', async () => {
  if (mobile) { await page.locator('.ed-tb').filter({ hasText: 'Font' }).click(); await page.waitForTimeout(400) }
  await page.locator('.ep-font').filter({ hasText: 'Typewriter' }).last().click()
  await page.waitForTimeout(250)
  const fam = await page.locator('.c-el--text').filter({ hasText: 'love the subject' }).locator('.c-text-body').first()
    .evaluate(n => getComputedStyle(n).fontFamily)
  console.log('  font-family:', fam)
  if (!/Special Elite/i.test(fam)) throw new Error('font did not change')
  await page.locator('.ep-font').filter({ hasText: 'Playful' }).last().click()
  if (mobile && await page.locator('.ed-scrim').count()) { await page.locator('.ed-scrim').click(); await page.waitForTimeout(300) }
})

await step('resize with the slider', async () => {
  if (mobile) { await page.locator('.ed-tb').filter({ hasText: 'Size' }).click(); await page.waitForTimeout(400) }
  const before = await page.locator('.ep-row-value').last().innerText()
  const slider = page.locator('.ep-range').last()
  const sb = await slider.boundingBox()
  await page.mouse.move(sb.x + sb.width * 0.3, sb.y + sb.height / 2)
  await page.mouse.down()
  await page.mouse.move(sb.x + sb.width * 0.72, sb.y + sb.height / 2, { steps: 10 })
  await page.mouse.up()
  await page.waitForTimeout(250)
  const after = await page.locator('.ep-row-value').last().innerText()
  console.log('  size', before, '→', after)
  if (before === after) throw new Error('size slider had no effect')
  if (mobile && await page.locator('.ed-scrim').count()) { await page.locator('.ed-scrim').click(); await page.waitForTimeout(300) }
})

await step('add a decoration and drag it', async () => {
  if (mobile) {
    await page.locator('.ed-tb').filter({ hasText: 'More' }).click(); await page.waitForTimeout(400)
    await page.locator('.ed-sheet-tool').filter({ hasText: 'Decorate' }).click(); await page.waitForTimeout(300)
  } else {
    await page.locator('.ed-rail-btn').filter({ hasText: 'Decorate' }).click()
  }
  await page.waitForTimeout(200)
  const n0 = await page.locator('.c-el--deco').count()
  await page.locator('.ep-deco').last().click()
  await page.waitForTimeout(300)
  const n1 = await page.locator('.c-el--deco').count()
  console.log('  decorations', n0, '→', n1)
  if (n1 <= n0) throw new Error('decoration was not added')
  if (mobile && await page.locator('.ed-scrim').count()) { await page.locator('.ed-scrim').click(); await page.waitForTimeout(350) }
  const el = page.locator('.c-el--deco').last()
  const b0 = await el.boundingBox()
  await page.mouse.move(b0.x + b0.width / 2, b0.y + b0.height / 2)
  await page.mouse.down()
  await page.mouse.move(b0.x + b0.width / 2 + 70, b0.y + b0.height / 2 + 50, { steps: 12 })
  await page.mouse.up()
  await page.waitForTimeout(250)
  const b1 = await el.boundingBox()
  console.log('  moved by', Math.round(b1.x - b0.x), Math.round(b1.y - b0.y))
  if (Math.abs(b1.x - b0.x) < 25) throw new Error('drag did not move the decoration')
  await shot('04-deco')
})

await step('resize handle', async () => {
  const el = page.locator('.c-el--deco').last()
  await el.click()
  await page.waitForTimeout(200)
  const b0 = await el.boundingBox()
  const h = page.locator('.c-handle--size').first()
  const hb = await h.boundingBox()
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2)
  await page.mouse.down()
  await page.mouse.move(hb.x + 60, hb.y + 60, { steps: 12 })
  await page.mouse.up()
  await page.waitForTimeout(250)
  const b1 = await el.boundingBox()
  console.log('  size', Math.round(b0.width), '→', Math.round(b1.width))
  if (b1.width <= b0.width + 8) throw new Error('resize handle did not grow the element')
})

await step('rotate handle', async () => {
  const el = page.locator('.c-el--deco').last()
  const rotBefore = await el.evaluate(n => getComputedStyle(n).transform)
  const h = page.locator('.c-handle--rot').first()
  const hb = await h.boundingBox()
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2)
  await page.mouse.down()
  await page.mouse.move(hb.x + 90, hb.y - 40, { steps: 12 })
  await page.mouse.up()
  await page.waitForTimeout(250)
  const rotAfter = await el.evaluate(n => getComputedStyle(n).transform)
  console.log('  transform changed:', rotBefore !== rotAfter)
  if (rotBefore === rotAfter) throw new Error('rotate handle did nothing')
})

await step('delete handle + undo', async () => {
  const n0 = await page.locator('.c-el--deco').count()
  await page.locator('.c-handle--del').first().click()
  await page.waitForTimeout(250)
  const n1 = await page.locator('.c-el--deco').count()
  if (n1 !== n0 - 1) throw new Error('delete did not remove the element')
  if (mobile) await page.evaluate(() => { document.querySelector('.ed-panel')?.scrollIntoView() })
  await page.evaluate(() => { const b = document.querySelectorAll('.ed-hist-btn')[0]; if (b) b.click(); else document.dispatchEvent(new KeyboardEvent('keydown')) })
  if (!(await page.locator('.ed-hist-btn').count())) {
    await page.keyboard.down('Meta'); await page.keyboard.press('z'); await page.keyboard.up('Meta')
  }
  await page.waitForTimeout(250)
  const n2 = await page.locator('.c-el--deco').count()
  console.log('  deco count', n0, '→', n1, '→ undo →', n2)
  if (n2 !== n0) throw new Error('undo did not restore the element')
})

await step('flip to the inside and write the note', async () => {
  await page.locator('.ed-face-switch button').nth(1).click()
  await page.waitForTimeout(400)
  const note = page.locator('.c-el--text').nth(1)
  await note.click(); await page.waitForTimeout(200)
  await note.click(); await page.waitForTimeout(300)
  await page.keyboard.type('Thank you for every patient answer.')
  await page.waitForTimeout(250)
  await shot('05-inside')
  const t = await page.locator('.c-text-edit').innerText()
  if (!t.includes('patient answer')) throw new Error('inside note did not accept text')
})

await step('preview and flip', async () => {
  await page.locator('.ed-next .btn, .ed-next a').first().scrollIntoViewIfNeeded()
  await page.locator('.ed-next .btn, .ed-next a').first().click()
  await page.waitForURL('**/preview', { timeout: 5000 })
  await page.waitForTimeout(900)
  await shot('06-preview-front')
  await page.locator('.f-stage').click()
  await page.waitForTimeout(1100)
  await shot('07-preview-back')
  const rot = await page.locator('.f-inner').evaluate(n => getComputedStyle(n).transform)
  console.log('  flip transform:', rot.slice(0, 40))
  if (rot === 'none') throw new Error('card did not flip')
})

let link = ''
await step('share link', async () => {
  await page.locator('.pv-next .btn').first().scrollIntoViewIfNeeded()
  await page.locator('.pv-next .btn').first().click()
  await page.waitForURL('**/share', { timeout: 5000 })
  await page.waitForTimeout(1200)
  await shot('08-share')
  await page.locator('.sh-opt').first().scrollIntoViewIfNeeded()
  await page.locator('.sh-opt').first().click()
  await page.waitForTimeout(400)
  link = await page.locator('.sh-link input').inputValue()
  console.log('  link length:', link.length)
  if (!/\/c(#|\/)/.test(link)) throw new Error('no share link produced')
  console.log('  link:', link.length > 90 ? link.slice(0, 70) + '…' : link)
  await shot('09-share-open')
})

await step('teacher opens the link', async () => {
  const p2 = await ctx.newPage()
  await p2.goto(link, { waitUntil: 'networkidle' })
  await p2.waitForTimeout(1400)
  await p2.screenshot({ path: `shots/flow-${tag}-10-receive.png` })
  const kicker = await p2.locator('.rc-kicker').innerText()
  console.log('  kicker:', kicker)
  await p2.locator('.f-stage').click()
  await p2.waitForTimeout(1300)
  await p2.screenshot({ path: `shots/flow-${tag}-11-receive-open.png` })
  const inside = await p2.locator('.f-face--back').innerText()
  console.log('  inside text:', JSON.stringify(inside.slice(0, 60)))
  if (!inside.includes('patient answer')) throw new Error('the note did not travel in the link')
  await p2.close()
})

console.log(errs.length ? '\n⚠️  console/page errors:\n' + errs.map(e => '  ' + e).join('\n') : '\n✅ no console errors')
await browser.close()
