import { chromium } from 'playwright-core'
import { existsSync } from 'node:fs'; import { homedir } from 'node:os'; import path from 'node:path'
const root = path.join(homedir(), 'Library/Caches/ms-playwright')
const exe = ['chromium-1234/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium'].map(c => path.join(root, c)).find(p => existsSync(p))
const b = await chromium.launch({ executablePath: exe })
const ctx = await b.newContext({ viewport: { width: 413, height: 939 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
const p = await ctx.newPage()
await p.goto('http://localhost:5273/leaderboards', { waitUntil: 'networkidle' })
await p.locator('.nav-burger').click()
await p.waitForTimeout(900)
await p.screenshot({ path: 'shots/navbug.png' })
console.log(JSON.stringify(await p.evaluate(() => {
  const sheetEl = document.querySelector('.nav-sheet')
  const chain = []
  for (let n = sheetEl?.parentElement; n && n !== document.documentElement; n = n.parentElement) {
    const c = getComputedStyle(n)
    const flags = { transform: c.transform, filter: c.filter, backdropFilter: c.backdropFilter,
                    perspective: c.perspective, contain: c.contain, willChange: c.willChange, animation: c.animationName }
    const bad = Object.entries(flags).filter(([k, v]) => v && v !== 'none' && v !== 'auto' && v !== 'normal')
    chain.push({ el: n.className || n.tagName, containing: bad })
  }
  window.__chain = chain
  return null
})))
console.log('ancestors:', JSON.stringify(await p.evaluate(() => window.__chain), null, 1))
console.log(JSON.stringify(await p.evaluate(() => {
  const r = s => { const n = document.querySelector(s); if (!n) return null; const b = n.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), h: Math.round(b.height) } }
  const sheet = document.querySelector('.nav-sheet')
  const cs = sheet ? getComputedStyle(sheet) : null
  return { vh: innerHeight, sheet: r('.nav-sheet'), inner: r('.nav-sheet-in'),
           first: r('.nav-sheet-link'), links: document.querySelectorAll('.nav-sheet-link').length,
           just: cs?.justifyContent, pad: cs?.padding, overflow: cs?.overflow, bodyScroll: document.body.scrollHeight }
}), null, 1))
await b.close()
