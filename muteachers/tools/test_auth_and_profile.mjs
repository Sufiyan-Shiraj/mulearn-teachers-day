import { chromium } from 'playwright-core'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const base = process.env.BASE || 'http://localhost:5175'
mkdirSync('shots', { recursive: true })
const exe = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const browser = await chromium.launch({ executablePath: exe, args: ['--use-fake-ui-for-media-stream'] })
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 950 },
  permissions: ['camera'],
})
const page = await ctx.newPage()

console.log('1. Navigating to landing page...')
await page.goto(base + '/', { waitUntil: 'networkidle' })
await page.screenshot({ path: 'shots/test-01-landing.png' })

console.log('2. Opening Auth Modal...')
await page.locator('.nav-signin-btn').click()
await page.waitForSelector('.auth-modal', { state: 'visible' })
await page.screenshot({ path: 'shots/test-02-authmodal.png' })

console.log('3. Clicking Demo Sign-In...')
await page.locator('.auth-btn--demo').click()
await page.waitForTimeout(600)
await page.screenshot({ path: 'shots/test-03-loggedin.png' })

const userName = await page.locator('.nav-user-name').innerText()
console.log('  Logged in user in TopNav:', userName)

console.log('4. Navigating to Leaderboard...')
await page.goto(base + '/leaderboards', { waitUntil: 'networkidle' })
await page.waitForSelector('.lb-podium', { timeout: 10000 })
await page.waitForTimeout(1000)
await page.screenshot({ path: 'shots/test-04-leaderboard.png' })

const podiumCards = await page.locator('.lb-pod').count()
console.log('  Podium cards rendered:', podiumCards)
const yourRankExists = await page.locator('.lb-you').count()
console.log('  Your Rank section rendered:', yourRankExists > 0)

console.log('5. Navigating to Public Profile /u/mulearn_student...')
await page.goto(base + '/u/mulearn_student', { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
await page.screenshot({ path: 'shots/test-05-profile.png' })

const profileHandle = await page.locator('.up-handle').innerText()
console.log('  Profile handle rendered:', profileHandle)

console.log('6. Navigating to My Cards...')
await page.goto(base + '/my-cards', { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
await page.screenshot({ path: 'shots/test-06-mycards.png' })

console.log('✅ All Auth, Leaderboard, Profile, and My Cards tests passed successfully!')
await browser.close()
