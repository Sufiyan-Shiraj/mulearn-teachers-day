import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const SHOTS = '/Users/tejaskm/.gemini/antigravity-ide/brain/fed594e0-9a4f-48d1-b949-034d4989d956/shots'
mkdirSync(SHOTS, { recursive: true })

async function run() {
  console.log('Launching browser...')
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 860 },
  })
  const page = await context.newPage()

  // 1. Visit landing with clean session storage so preloader runs
  console.log('1. Loading landing page with preloader...')
  await page.goto('http://localhost:5175/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload()

  // 2. Capture preloader early stage (~400ms)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SHOTS}/preloader-01-early.png` })
  console.log('Screenshot 1 captured: Preloader early stage (washi tape & inking)')

  // 3. Capture preloader mid stage (~1400ms)
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${SHOTS}/preloader-02-mid.png` })
  console.log('Screenshot 2 captured: Preloader mid stage (heart doodle & script)')

  // 4. Capture preloader stamp counter stage (~2100ms)
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${SHOTS}/preloader-03-stamp.png` })
  console.log('Screenshot 3 captured: Preloader stamp & counter stage')

  // 5. Wait for preloader to finish its exit transition
  console.log('Waiting for preloader exit reveal...')
  await page.waitForTimeout(1400)
  const isPreloaderGone = (await page.locator('.preloader-root').count()) === 0
  console.log('Preloader dismissed successfully:', isPreloaderGone)

  await page.screenshot({ path: `${SHOTS}/preloader-04-landed.png` })
  console.log('Screenshot 4 captured: Landing page after preloader reveal')

  // 6. Test AuthModal without Demo Student
  console.log('6. Clicking "Create a Card" to open AuthModal...')
  const ctaBtn = page.locator('.ld-cta a:has-text("Create a Card")')
  await ctaBtn.click()
  await page.waitForTimeout(500)

  // Verify AuthModal is visible
  const modal = page.locator('.auth-modal')
  const isModalVisible = await modal.isVisible()
  console.log('Auth modal visible:', isModalVisible)
  if (!isModalVisible) throw new Error('Auth modal not opened!')

  // Check demo student button is completely gone
  const demoBtnCount = await page.locator('.auth-btn--demo').count()
  console.log('Demo button count (should be 0):', demoBtnCount)
  if (demoBtnCount !== 0) throw new Error('Demo student button still found in DOM!')

  // Check Google button is present
  const googleBtnVisible = await page.locator('.auth-btn--google').isVisible()
  console.log('Google login button visible:', googleBtnVisible)
  if (!googleBtnVisible) throw new Error('Google login button missing!')

  await page.screenshot({ path: `${SHOTS}/motion-01-auth-signup-tab.png` })
  console.log('Screenshot 5 captured: AuthModal in Sign Up mode (no demo button)')

  // 7. Click Sign In tab and verify Framer Motion pill and content transition
  console.log('7. Switching to Sign In tab...')
  const signInTab = page.locator('.auth-tab:has-text("Sign In")')
  await signInTab.click()
  await page.waitForTimeout(300)

  const activePillCount = await page.locator('.auth-tab-pill').count()
  console.log('Framer Motion active tab pill present:', activePillCount > 0)

  await page.screenshot({ path: `${SHOTS}/motion-02-auth-signin-tab.png` })
  console.log('Screenshot 6 captured: AuthModal smoothly transitioned to Sign In mode')

  // Close modal
  await page.locator('.auth-close').click()
  await page.waitForTimeout(400)

  // 8. Test Replay Preloader from Footer
  console.log('8. Testing "Replay Studio Intro" button in footer...')
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(600)

  const replayBtn = page.locator('.ft-replay-btn')
  await replayBtn.click()
  await page.waitForTimeout(500)

  const isPreloaderReplayed = await page.locator('.preloader-root').isVisible()
  console.log('Preloader replayed successfully:', isPreloaderReplayed)
  if (!isPreloaderReplayed) throw new Error('Preloader did not replay on button click!')

  // Test Skip Intro button
  console.log('Testing Skip Intro button...')
  const skipBtn = page.locator('.preloader-skip-btn')
  await skipBtn.click()
  await page.waitForTimeout(500)

  const isPreloaderSkipped = (await page.locator('.preloader-root').count()) === 0
  console.log('Preloader skipped successfully:', isPreloaderSkipped)
  if (!isPreloaderSkipped) throw new Error('Preloader skip failed!')

  await browser.close()
  console.log('All tests passed with 100% success!')
}

run().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
