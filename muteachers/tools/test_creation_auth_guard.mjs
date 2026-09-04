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

  // 1. Visit landing page with cleared storage (logged out)
  console.log('1. Testing Landing page when logged out...')
  await page.goto('http://localhost:5175/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload()
  await page.waitForTimeout(1000)

  await page.screenshot({ path: `${SHOTS}/auth-guard-01-landing-loggedout.png` })
  console.log('Screenshot 1 captured: Logged out landing')

  // 2. Click "Create a Card"
  console.log('2. Clicking "Create a Card" while logged out...')
  const ctaBtn = page.locator('.ld-cta a:has-text("Create a Card")')
  await ctaBtn.click()
  await page.waitForTimeout(600)

  // Auth modal should be visible
  const modal = page.locator('.auth-modal')
  const isModalVisible = await modal.isVisible()
  console.log('Auth modal visible after clicking Create a Card:', isModalVisible)
  if (!isModalVisible) throw new Error('Auth modal did not appear!')

  await page.screenshot({ path: `${SHOTS}/auth-guard-02-modal-from-cta.png` })
  console.log('Screenshot 2 captured: Auth modal opened from hero CTA')

  // 3. Switch between Sign In and Sign Up tabs
  console.log('3. Testing Sign In / Sign Up tabs...')
  const signInTab = page.locator('.auth-tab:has-text("Sign In")')
  const signUpTab = page.locator('.auth-tab:has-text("Sign Up")')
  await signInTab.click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${SHOTS}/auth-guard-03-modal-signin-tab.png` })

  await signUpTab.click()
  await page.waitForTimeout(300)

  // 4. Click "Sign Up as Demo Student" to authenticate
  console.log('4. Authenticating via Demo Student...')
  const demoBtn = page.locator('.auth-btn--demo')
  await demoBtn.click()
  await page.waitForTimeout(1200)

  // User should now be logged in and routed to /pick
  const urlAfterLogin = page.url()
  console.log('URL after authenticating:', urlAfterLogin)
  await page.screenshot({ path: `${SHOTS}/auth-guard-04-routed-to-pick.png` })

  // 5. Test Template Card click when logged out
  console.log('5. Logging out and testing template click on /pick...')
  await page.evaluate(() => {
    localStorage.removeItem('mulearn_demo_user')
    sessionStorage.clear()
  })
  await page.reload()
  await page.waitForTimeout(800)

  // Click on the first card template
  const firstCard = page.locator('.pk-card').first()
  await firstCard.click()
  await page.waitForTimeout(600)

  const isModalVisibleOnPick = await modal.isVisible()
  console.log('Auth modal visible after picking template while logged out:', isModalVisibleOnPick)
  if (!isModalVisibleOnPick) throw new Error('Auth modal did not appear on template pick!')

  await page.screenshot({ path: `${SHOTS}/auth-guard-05-modal-from-pick.png` })

  // 6. Sign in from this modal
  console.log('6. Authenticating from PickCard modal...')
  const demoBtnPick = page.locator('.auth-btn--demo')
  await demoBtnPick.click()
  await page.waitForTimeout(1500)

  const urlAfterPickAuth = page.url()
  console.log('URL after authenticating from template pick:', urlAfterPickAuth)
  await page.screenshot({ path: `${SHOTS}/auth-guard-06-routed-to-photo.png` })

  await browser.close()
  console.log('All tests passed successfully!')
}

run().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
