import puppeteer from 'puppeteer-core'
const BASE = 'http://127.0.0.1:5173'
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu']
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 1000 })
page.on('console', (m) => console.log('CONSOLE', m.type(), m.text()))
page.on('pageerror', (e) => console.log('PAGEERROR', e.message))
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle2' })
await (await page.$$('.demo-btn'))[1].click()
await page.click('button[type="submit"]')
await page.waitForFunction(() => location.pathname === '/kasir')
console.log('kasir ok')
await page.evaluate(() => document.querySelector('.user-btn').click())
await page.waitForSelector('.dropdown')
await page.evaluate(() => {
  const el = [...document.querySelectorAll('.dropdown button')].find((b) =>
    b.textContent.includes('Keluar')
  )
  el.click()
})
await page.waitForFunction(() => location.pathname === '/login')
console.log('logout ok')

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' })
const buttons = await page.$$('.demo-btn')
console.log('demo buttons:', buttons.length)
await buttons[0].click()
console.log('values:', await page.$$eval('input', (els) => els.map((e) => [e.type, e.value])))
await page.click('button[type="submit"]')
await new Promise((r) => setTimeout(r, 2500))
console.log('url:', page.url())
console.log('session:', await page.evaluate(() => localStorage.getItem('ttpc:session')))
console.log('errors visible:', await page.evaluate(() => document.querySelector('.error-banner')?.innerText))
console.log('toasts:', await page.evaluate(() => [...document.querySelectorAll('.toast')].map((t) => t.innerText)))
await browser.close()
