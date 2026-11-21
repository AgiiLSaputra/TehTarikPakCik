import puppeteer from 'puppeteer-core'

const BASE = 'http://127.0.0.1:5173'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const failures = []
const logs = []
function check(name, condition, detail = '') {
  if (condition) {
    console.log(`PASS  ${name}`)
  } else {
    failures.push(name + (detail ? ` :: ${detail}` : ''))
    console.log(`FAIL  ${name}${detail ? ` :: ${detail}` : ''}`)
  }
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,1000']
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 1000 })

page.on('console', (msg) => {
  if (msg.type() === 'error') logs.push(`console: ${msg.text()}`)
})
page.on('pageerror', (err) => logs.push(`pageerror: ${err.message}`))
page.on('requestfailed', (req) => {
  if (req.url().startsWith(BASE)) logs.push(`requestfailed: ${req.url()} ${req.failure()?.errorText}`)
})

async function text() {
  return page.evaluate(() => document.body.innerText)
}
async function hasText(value) {
  return (await text()).toLowerCase().includes(value.toLowerCase())
}
async function waitText(value, timeout = 8000) {
  await page.waitForFunction(
    (needle) => document.body.innerText.toLowerCase().includes(needle.toLowerCase()),
    { timeout },
    value
  )
}
async function clickText(selector, value) {
  await page.waitForFunction(
    (sel, needle) =>
      [...document.querySelectorAll(sel)].some((el) => el.textContent.trim().includes(needle)),
    { timeout: 8000 },
    selector,
    value
  )
  const ok = await page.evaluate(
    (sel, needle) => {
      const el = [...document.querySelectorAll(sel)].find((node) =>
        node.textContent.trim().includes(needle)
      )
      if (!el) return false
      el.click()
      return true
    },
    selector,
    value
  )
  if (!ok) throw new Error(`Tombol "${value}" tidak ditemukan (${selector})`)
}
async function loginWith(index) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' })
  await page.waitForSelector('.demo-btn')
  await page.evaluate((i) => {
    document.querySelectorAll('.demo-btn')[i].click()
  }, index)
  await page.waitForFunction(
    () => document.querySelector('input[autocomplete="username"]')?.value.length > 0
  )
  await page.evaluate(() => {
    document.querySelector('button[type="submit"]').click()
  })
}

try {
  /* ---------- 1. Katalog publik ---------- */
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle2' })
  await waitText('Mie Rebus')
  check('Katalog publik tampil dengan menu seed', await hasText('Nasi Ayam Black Pepper'))
  check('Kategori minuman tampil', await hasText('Milo Malaysia'))
  check('Galeri & brand tampil', await hasText('Gerobak kami'))

  /* ---------- 2. Guard & halaman error ---------- */
  await page.goto(`${BASE}/kasir`, { waitUntil: 'networkidle2' })
  check('Tamu diarahkan ke login', page.url().includes('/login'), page.url())

  await page.goto(`${BASE}/tidak-ada`, { waitUntil: 'networkidle2' })
  check('Halaman 404 tampil', await hasText('Halaman tidak ditemukan'))

  /* ---------- 3. Login kasir ---------- */
  await loginWith(1)
  await page.waitForFunction(() => location.pathname === '/kasir', { timeout: 8000 })
  check('Login kasir berhasil', await hasText('Kasir'))

  /* ---------- 4. Buat pesanan ---------- */
  await page.waitForSelector('.add-btn')
  await page.evaluate((name) => {
    const card = [...document.querySelectorAll('.product-card')].find((node) =>
      node.innerText.includes(name)
    )
    card.querySelector('.add-btn').click()
  }, 'Mie Rebus')
  await page.waitForFunction(
    () => document.querySelector('#keranjang')?.innerText.includes('1 item'),
    { timeout: 5000 }
  )
  await page.evaluate((name) => {
    const card = [...document.querySelectorAll('.product-card')].find((node) =>
      node.innerText.includes(name)
    )
    card.querySelector('.add-btn').click()
  }, 'Teh Tarik')
  await page.waitForFunction(
    () => document.querySelector('#keranjang')?.innerText.includes('2 item'),
    { timeout: 5000 }
  )
  const cartText = await page.$eval('#keranjang', (el) => el.innerText)
  check('Item masuk keranjang', cartText.includes('2 item'), cartText.slice(0, 80))

  await clickText('#keranjang button', 'Simpan Pesanan')
  await page.waitForSelector('.receipt-print', { timeout: 10000 })
  const receiptText = await page.$eval('.receipt-print', (el) => el.innerText)
  const code = (receiptText.match(/TTP-\d{8}-\d{3}/) || [])[0]
  check('Pesanan tersimpan & nota tampil', Boolean(code), receiptText.slice(0, 120))

  /* ---------- 5. Pembayaran tunai ---------- */
  await clickText('.modal-foot button', 'Bayar Sekarang')
  await page.waitForSelector('#amount-received')
  await page.evaluate(() => document.querySelector('.quick-chip').click())
  await clickText('.modal-body button', 'Konfirmasi Pembayaran')
  await page.waitForFunction(
    () => document.querySelector('.receipt-print')?.innerText.includes('Tunai'),
    { timeout: 10000 }
  )
  const paidText = await page.$eval('.receipt-print', (el) => el.innerText)
  check('Pembayaran tunai tercatat', paidText.includes('Tunai'), paidText.slice(0, 120))
  await clickText('.modal-foot button', 'Tutup')
  await page.waitForFunction(() => !document.querySelector('.receipt-print'))

  /* ---------- 6. Riwayat transaksi & ubah status ---------- */
  await page.goto(`${BASE}/transaksi`, { waitUntil: 'networkidle2' })
  await waitText(code)
  const row = await page.evaluateHandle((needle) => {
    return [...document.querySelectorAll('.transaction-table tbody tr')].find((tr) =>
      tr.innerText.includes(needle)
    )
  }, code)
  const select = await row.asElement().$('select')
  check('Transaksi baru ada di riwayat', Boolean(select))
  await select.select('diproses')
  await page.waitForFunction(
    (needle) => {
      const tr = [...document.querySelectorAll('.transaction-table tbody tr')].find((row) =>
        row.innerText.includes(needle)
      )
      return tr && tr.innerText.includes('Diproses')
    },
    { timeout: 8000 },
    code
  )
  check('Status pesanan berubah ke Diproses', true)

  /* ---------- 7. Logout ---------- */
  await page.evaluate(() => document.querySelector('.user-btn').click())
  await page.waitForSelector('.dropdown')
  await clickText('.dropdown button', 'Keluar')
  await page.waitForFunction(() => location.pathname === '/login', { timeout: 8000 })
  check('Logout kembali ke halaman login', true)

  /* ---------- 8. Login owner & dashboard ---------- */
  await loginWith(0)
  await page.waitForFunction(() => location.pathname === '/owner/dashboard', { timeout: 8000 })
  await waitText('Ringkasan usaha')
  check('Dashboard owner tampil', await hasText('Pendapatan hari ini'))
  check('Transaksi kasir tercatat di dashboard', await hasText(code))

  /* ---------- 9. Owner dilarang ke kasir ---------- */
  await page.goto(`${BASE}/kasir`, { waitUntil: 'networkidle2' })
  check('Owner dialihkan ke halaman 403', page.url().endsWith('/403'), page.url())

  /* ---------- 10. CRUD produk ---------- */
  await page.goto(`${BASE}/owner/produk`, { waitUntil: 'networkidle2' })
  await waitText('Kelola Produk')
  await clickText('.page-head button', 'Tambah Produk')
  await page.waitForSelector('.modal-card')
  await new Promise((resolve) => setTimeout(resolve, 450))
  await page.evaluate(() => {
    const set = (selector, value) => {
      const el = document.querySelector(selector)
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
    set('input[placeholder="Contoh: Teh Tarik Original"]', 'Uji Coba Otomatis')
    set('input[placeholder="8000"]', '9000')
    set('textarea[placeholder="Deskripsi singkat produk..."]', 'Produk untuk pengujian.')
  })
  await clickText('.modal-foot button', 'Tambah Produk')
  await page.waitForFunction(
    () => !document.querySelector('.modal-card') && document.body.innerText.includes('Uji Coba Otomatis'),
    { timeout: 10000 }
  )
  check('Produk baru berhasil dibuat', true)

  await page.evaluate(() => {
    const tr = [...document.querySelectorAll('tbody tr')].find((row) =>
      row.innerText.includes('Uji Coba Otomatis')
    )
    tr.querySelector('button[title="Hapus produk"]').click()
  })
  await page.waitForSelector('.modal-card')
  await clickText('.modal-foot button', 'Ya, hapus')
  await page.waitForFunction(
    () => !document.body.innerText.includes('Uji Coba Otomatis'),
    { timeout: 10000 }
  )
  check('Produk berhasil dihapus', true)

  /* ---------- 11. Laporan + CSV ---------- */
  await page.goto(`${BASE}/owner/laporan`, { waitUntil: 'networkidle2' })
  await waitText('Laporan Penjualan')
  await page.evaluate(() => {
    window.__downloads = []
    const original = HTMLAnchorElement.prototype.click
    HTMLAnchorElement.prototype.click = function () {
      if (this.download) {
        window.__downloads.push(this.download)
        return
      }
      return original.call(this)
    }
  })
  await clickText('.page-head button', 'Unduh CSV')
  await page.waitForFunction(() => window.__downloads.length > 0, { timeout: 8000 })
  const downloads = await page.evaluate(() => window.__downloads)
  check('Ekspor CSV terunduh', downloads.some((name) => name.endsWith('.csv')), downloads.join(', '))

  /* ---------- 12. Cek pesanan publik ---------- */
  await page.goto(`${BASE}/cek-pesanan`, { waitUntil: 'networkidle2' })
  await page.evaluate((value) => {
    const el = document.querySelector('input[placeholder="TTP-YYYYMMDD-XXX"]')
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, value)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }, code)

  await page.evaluate(() => document.querySelector('form.lookup').requestSubmit())
  await waitText(code)
  check('Pelacakan kode pesanan berhasil', await hasText('Diproses'))

  /* ---------- 13. Persistensi sesi ---------- */
  await page.reload({ waitUntil: 'networkidle2' })
  check('Sesi owner bertahan setelah reload', page.url().includes('/cek-pesanan') || (await hasText('Cek status pesanan')))
  await page.goto(`${BASE}/owner/dashboard`, { waitUntil: 'networkidle2' })
  check('Masih login sebagai owner setelah reload', await hasText('Ringkasan usaha'))
} catch (error) {
  failures.push(`EXCEPTION: ${error.message}`)
  console.log(`FAIL  EXCEPTION: ${error.stack}`)
} finally {
  console.log('\n--- Console / runtime issues ---')
  if (logs.length === 0) console.log('(none)')
  logs.forEach((line) => console.log(line))
  console.log('\n--- Result ---')
  console.log(`${failures.length} failure(s)`)
  failures.forEach((name) => console.log(` - ${name}`))
  await browser.close()
  process.exit(failures.length ? 1 : 0)
}
