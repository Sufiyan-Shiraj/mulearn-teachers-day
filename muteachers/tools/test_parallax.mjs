import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const SHOTS = '/Users/tejaskm/.gemini/antigravity-ide/brain/fed594e0-9a4f-48d1-b949-034d4989d956/shots'
mkdirSync(SHOTS, { recursive: true })

async function run() {
  console.log('1. Launching browser to test parallax effects...')
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 860 },
  })
  const page = await context.newPage()

  // Mark intro seen so we can jump straight to Landing
  await page.goto('http://localhost:5175/')
  await page.evaluate(() => {
    sessionStorage.setItem('mulearn_intro_seen', 'true')
  })
  await page.reload()
  await page.waitForTimeout(600)

  // 1. Capture neutral Hero
  console.log('2. Testing Hero collage neutral state...')
  await page.screenshot({ path: `${SHOTS}/parallax-01-hero-neutral.png` })

  // 2. Move cursor to top-left of the hero collage
  console.log('3. Moving cursor to top-left of Hero collage...')
  const collage = page.locator('.ld-collage')
  const box = await collage.boundingBox()
  if (box) {
    await page.mouse.move(box.x + box.width * 0.15, box.y + box.height * 0.15, { steps: 15 })
    await page.waitForTimeout(400)
    await page.screenshot({ path: `${SHOTS}/parallax-02-hero-tilt-topleft.png` })

    // Move cursor to bottom-right of the hero collage
    console.log('4. Moving cursor to bottom-right of Hero collage...')
    await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.85, { steps: 15 })
    await page.waitForTimeout(400)
    await page.screenshot({ path: `${SHOTS}/parallax-03-hero-tilt-bottomright.png` })
  }

  // 3. Test Scroll Parallax on Landing
  console.log('5. Scrolling down Landing to test vertical parallax...')
  await page.evaluate(() => window.scrollBy({ top: 380, behavior: 'smooth' }))
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${SHOTS}/parallax-04-hero-scrolled.png` })

  // 4. Test How It Works scroll drift
  console.log('6. Navigating to /how-it-works to test sticker drift...')
  await page.goto('http://localhost:5175/how-it-works')
  await page.waitForTimeout(500)
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }))
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SHOTS}/parallax-05-howitworks-scrolled.png` })

  // 5. Test Pick Card Header Doodles
  console.log('7. Navigating to /pick to test header doodle parallax...')
  await page.goto('http://localhost:5175/pick')
  await page.waitForTimeout(500)
  const pkHead = page.locator('.pk-head')
  const pkBox = await pkHead.boundingBox()
  if (pkBox) {
    await page.mouse.move(pkBox.x + pkBox.width * 0.2, pkBox.y + pkBox.height * 0.3, { steps: 10 })
    await page.waitForTimeout(350)
    await page.screenshot({ path: `${SHOTS}/parallax-06-pickcard-head.png` })
  }

  console.log('All parallax verification tests finished successfully!')
  await browser.close()
}

run().catch(err => {
  console.error('Test error:', err)
  process.exit(1)
})
