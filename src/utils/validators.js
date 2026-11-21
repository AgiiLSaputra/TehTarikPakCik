/**
 * Aturan validasi bersama (dipakai form & service api.js)
 * sesuai PRD bagian 3.1.
 */

export const PRODUCT_NAME_MIN = 3
export const PRODUCT_NAME_MAX = 60
export const QTY_MIN = 1
export const QTY_MAX = 99
export const PRICE_MAX = 10000000

export function validateLogin({ username, password } = {}) {
  const errors = {}
  if (!String(username ?? '').trim()) errors.username = 'Username wajib diisi'
  if (!String(password ?? '').trim()) errors.password = 'Kata sandi wajib diisi'
  return errors
}

export function validateProduct(payload = {}) {
  const errors = {}
  const name = String(payload.name ?? '').trim()
  const price = Number(payload.price)

  if (!name) {
    errors.name = 'Nama produk wajib diisi'
  } else if (name.length < PRODUCT_NAME_MIN) {
    errors.name = `Nama produk minimal ${PRODUCT_NAME_MIN} karakter`
  } else if (name.length > PRODUCT_NAME_MAX) {
    errors.name = `Nama produk maksimal ${PRODUCT_NAME_MAX} karakter`
  }

  if (!payload.category_id) {
    errors.category_id = 'Kategori wajib dipilih'
  }

  if (payload.price === '' || payload.price === null || payload.price === undefined) {
    errors.price = 'Harga wajib diisi'
  } else if (!Number.isInteger(price)) {
    errors.price = 'Harga harus bilangan bulat'
  } else if (price <= 0) {
    errors.price = 'Harga harus lebih dari 0'
  } else if (price > PRICE_MAX) {
    errors.price = `Harga maksimal ${PRICE_MAX}`
  }

  if (payload.description && String(payload.description).length > 160) {
    errors.description = 'Deskripsi maksimal 160 karakter'
  }

  return errors
}

export function validateTransactionItems(items = []) {
  const errors = {}
  if (!Array.isArray(items) || items.length === 0) {
    errors.items = 'Pesanan minimal berisi 1 item'
    return errors
  }

  const invalidQty = items.find((item) => {
    const qty = Number(item.qty)
    return !Number.isInteger(qty) || qty < QTY_MIN || qty > QTY_MAX
  })

  if (invalidQty) {
    errors.items = `Jumlah item harus bilangan bulat ${QTY_MIN}–${QTY_MAX}`
  }

  return errors
}

export function validatePayment({ method, amount_received: amountReceived } = {}, total = 0) {
  const errors = {}
  if (!['cash', 'qris', 'transfer'].includes(method)) {
    errors.method = 'Metode pembayaran tidak valid'
    return errors
  }

  if (method === 'cash') {
    const received = Number(amountReceived)
    if (amountReceived === '' || amountReceived === null || amountReceived === undefined) {
      errors.amount_received = 'Uang diterima wajib diisi'
    } else if (!Number.isFinite(received)) {
      errors.amount_received = 'Nominal tidak valid'
    } else if (received < total) {
      errors.amount_received = `Minimal Rp${new Intl.NumberFormat('id-ID').format(total)}`
    }
  }

  return errors
}

export function hasErrors(errors) {
  return Object.keys(errors || {}).length > 0
}
