import { chromium } from 'playwright-core'
import { existsSync } from 'node:fs'; import { homedir } from 'node:os'; import path from 'node:path'
const root = path.join(homedir(), 'Library/Caches/ms-playwright')
const exe = ['chromium-1234/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium'].map(c => path.join(root, c)).find(p => existsSync(p))
const base = 'http://localhost:5273'
const routes = ['/', '/pick', '/photo', '/create', '/preview', '/share', '/my-cards', '/leaderboards', '/how-it-works', '/about']
const sizes = [
  { n: 'mobile-360', w: 360, h: 780, mobile: true },
  { n: 'mobile-390', w: 390, h: 844, mobile: true },
  { n: 'tablet-768', w: 768, h: 1024, mobile: false },
  { n: 'laptop-1280', w: 1280, h: 800, mobile: false },
  { n: 'desktop-1440', w: 1440, h: 900, mobile: false },
  { n: 'wide-1920', w: 1920, h: 1080, mobile: false },
]
const b = await chromium.launch({ executablePath: exe, args: ['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream'] })
let bad = 0
for (const s of sizes) {
  const ctx = await b.newContext({ viewport: { width: s.w, height: s.h }, isMobile: s.mobile, hasTouch: s.mobile, permissions: ['camera'] })
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', e => errs.push(String(e).slice(0, 140)))
  p.on('console', m => { if (m.type() === 'error' && !/502|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 140)) })
  for (const r of routes) {
    await p.goto(base + r, { waitUntil: 'networkidle' })
    await p.waitForTimeout(500)
    const res = await p.evaluate((vw) => {
      const de = document.documentElement
      const overflow = Math.max(de.scrollWidth, document.body.scrollWidth) - vw
      const offenders = []
      if (overflow > 1) {
        document.querySelectorAll('*').forEach(n => {
          const b = n.getBoundingClientRect()
          if (b.width && (b.right > vw + 1.5 || b.left < -1.5)) {
            const cs = getComputedStyle(n)
            if (cs.position === 'fixed') return
            offenders.push(`${n.className || n.tagName} [${Math.round(b.left)}→${Math.round(b.right)}]`)
          }
        })
      }
      // tap-target audit
      const small = []
      document.querySelectorAll('button, a, input[type=range]').forEach(n => {
        const b = n.getBoundingClientRect()
        if (b.width === 0 || b.height === 0) return
        if (getComputedStyle(n).visibility === 'hidden') return
        if (b.height < 30 || b.width < 26) small.push(`${n.className || n.tagName} ${Math.round(b.width)}x${Math.round(b.height)}`)
      })
      return { overflow, offenders: [...new Set(offenders)].slice(0, 6), small: [...new Set(small)].slice(0, 6) }
    }, s.w)
    const flag = res.overflow > 1
    if (flag) bad++
    if (flag || errs.length) {
      console.log(`${flag ? '✗' : ' '} ${s.n} ${r}  overflow=${res.overflow}`)
      res.offenders.forEach(o => console.log('     ', o))
      errs.splice(0).forEach(e => console.log('     err:', e))
    }
    if (s.mobile && res.small.length) console.log(`  small taps ${s.n} ${r}:`, res.small.join(' | '))
  }
  await ctx.close()
}
console.log(bad ? `\n${bad} overflow issues` : '\n✅ no horizontal overflow anywhere')
await b.close()
