/**
 * Service layer lokal — meniru kontrak REST pada PRD bagian 5
 * tanpa backend. Semua operasi membaca/menulis localStorage.
 *
 * Format respons:
 *   sukses : { success: true, status, data }
 *   gagal  : { success: false, status, message, errors? }
 */
import {
  readCollection,
  writeCollection,
  readSession,
  writeSession,
  clearSession
} from './storage'
import { buildOrderCode } from '@/utils/orderCode'
import {
  validateLogin,
  validateProduct,
  validatePayment,
  validateTransactionItems,
  hasErrors,
  QTY_MAX
} from '@/utils/validators'
import { toDateInput, isValidDateInput } from '@/utils/format'

const LATENCY = 70
const delay = (ms = LATENCY) => new Promise((resolve) => setTimeout(resolve, ms))

const success = (data, status = 200) => ({ success: true, status, data })
const failure = (message, status = 400, errors = null) => ({
  success: false,
  status,
  message,
  ...(errors ? { errors } : {})
})

const ORDER_STATUSES = ['diterima', 'diproses', 'siap', 'selesai', 'dibatalkan']
const PAYMENT_METHODS = ['cash', 'qris', 'transfer']
const TERMINAL_STATUSES = ['selesai', 'dibatalkan']
const STATUS_FLOW = {
  diterima: ['diproses', 'dibatalkan'],
  diproses: ['siap', 'dibatalkan'],
  siap: ['selesai', 'dibatalkan'],
  selesai: [],
  dibatalkan: []
}

function nextId(list, prefix, pad = 3) {
  const max = list.reduce((acc, item) => {
    const num = Number.parseInt(String(item.id).slice(prefix.length + 1), 10)
    return Number.isInteger(num) && num > acc ? num : acc
  }, 0)
  return `${prefix}-${String(max + 1).padStart(pad, '0')}`
}

function safeUser(user) {
  if (!user) return null
  const { password, ...rest } = user
  return rest
}

function attachItems(transaction, allItems) {
  return {
    ...transaction,
    items: allItems.filter((item) => item.transaction_id === transaction.id)
  }
}

function isRevenue(transaction) {
  return transaction.payment_status === 'paid' && transaction.order_status !== 'dibatalkan'
}

function revenueDate(transaction) {
  return transaction.paid_at || transaction.created_at
}

function readTransactionsWithItems() {
  const transactions = readCollection('transactions')
  const items = readCollection('transactionItems')
  return transactions.map((trx) => attachItems(trx, items))
}

/* ============================================================
   AUTH
   ============================================================ */
export async function login({ username, password } = {}) {
  await delay()
  const errors = validateLogin({ username, password })
  if (hasErrors(errors)) return failure('Validasi gagal', 400, errors)

  const users = readCollection('users')
  const normalized = String(username).trim().toLowerCase()
  const user = users.find(
    (item) => String(item.username).toLowerCase() === normalized && item.password === password
  )

  if (!user || !user.is_active) {
    return failure('Username atau kata sandi salah', 401)
  }

  const safe = safeUser(user)
  writeSession(safe)
  return success({ user: safe })
}

export function findUserById(id) {
  const user = readCollection('users').find((item) => item.id === id)
  return safeUser(user)
}

export function getSessionSnapshot() {
  return readSession()
}

export async function logout() {
  await delay(40)
  clearSession()
  return success({ loggedOut: true })
}

/* ============================================================
   CATEGORIES
   ============================================================ */
export async function getCategories() {
  await delay()
  return success(readCollection('categories'))
}

/* ============================================================
   PRODUCTS
   ============================================================ */
function duplicateNameError(payload, products, excludeId) {
  const name = String(payload.name || '').trim().toLowerCase()
  return products.some(
    (product) =>
      product.id !== excludeId &&
      product.category_id === payload.category_id &&
      String(product.name).trim().toLowerCase() === name
  )
}

export async function getProducts(query = {}) {
  await delay(40)
  const { category_id: categoryId, q, active } = query
  let list = readCollection('products')

  if (categoryId) list = list.filter((product) => product.category_id === categoryId)
  if (active === true || active === 'true') list = list.filter((product) => product.is_active)
  if (active === false || active === 'false') list = list.filter((product) => !product.is_active)
  if (q) {
    const needle = String(q).toLowerCase()
    list = list.filter(
      (product) =>
        product.name.toLowerCase().includes(needle) ||
        String(product.description || '').toLowerCase().includes(needle)
    )
  }

  return success(list)
}

export async function createProduct(payload = {}) {
  await delay()
  const products = readCollection('products')
  const errors = validateProduct(payload)

  if (!errors.name && duplicateNameError(payload, products)) {
    errors.name = 'Nama produk sudah ada di kategori ini'
  }
  if (hasErrors(errors)) return failure('Validasi gagal', 400, errors)

  const product = {
    id: nextId(products, 'prd', 3),
    category_id: payload.category_id,
    name: String(payload.name).trim(),
    price: Number(payload.price),
    description: String(payload.description || '').trim(),
    emoji: payload.emoji || '🍽️',
    tone: payload.tone || 'caramel',
    image: payload.image || null,
    is_active: payload.is_active !== false,
    is_featured: Boolean(payload.is_featured),
    created_at: new Date().toISOString()
  }

  products.push(product)
  writeCollection('products', products)
  return success(product, 201)
}

export async function updateProduct(id, payload = {}) {
  await delay()
  const products = readCollection('products')
  const index = products.findIndex((product) => product.id === id)
  if (index === -1) return failure('Produk tidak ditemukan', 404)

  const current = products[index]
  const merged = { ...current, ...payload, id: current.id, name: String(payload.name ?? current.name).trim() }
  const errors = validateProduct(merged)

  if (!errors.name && duplicateNameError(merged, products, id)) {
    errors.name = 'Nama produk sudah ada di kategori ini'
  }
  if (hasErrors(errors)) return failure('Validasi gagal', 400, errors)

  const updated = {
    ...current,
    ...merged,
    price: Number(merged.price),
    is_active: merged.is_active !== false,
    is_featured: Boolean(merged.is_featured)
  }

  products[index] = updated
  writeCollection('products', products)
  return success(updated)
}

export async function deleteProduct(id) {
  await delay()
  const products = readCollection('products')
  const index = products.findIndex((product) => product.id === id)
  if (index === -1) return failure('Produk tidak ditemukan', 404)

  const usedItems = readCollection('transactionItems')
  const isUsed = usedItems.some((item) => item.product_id === id)

  if (isUsed) {
    products[index] = { ...products[index], is_active: false }
    writeCollection('products', products)
    return success({ id, deleted: false, deactivated: true })
  }

  products.splice(index, 1)
  writeCollection('products', products)
  return success({ id, deleted: true, deactivated: false })
}

/* ============================================================
   TRANSACTIONS
   ============================================================ */
export async function getTransactions(query = {}) {
  await delay(50)
  const { date_from: dateFrom, date_to: dateTo, order_status: orderStatus, payment_status: paymentStatus, q } = query
  let list = readTransactionsWithItems()

  if (isValidDateInput(dateFrom)) {
    list = list.filter((trx) => toDateInput(trx.created_at) >= dateFrom)
  }
  if (isValidDateInput(dateTo)) {
    list = list.filter((trx) => toDateInput(trx.created_at) <= dateTo)
  }
  if (orderStatus) list = list.filter((trx) => trx.order_status === orderStatus)
  if (paymentStatus) list = list.filter((trx) => trx.payment_status === paymentStatus)
  if (q) {
    const needle = String(q).toLowerCase()
    list = list.filter(
      (trx) =>
        trx.code.toLowerCase().includes(needle) ||
        String(trx.customer_name || '').toLowerCase().includes(needle)
    )
  }

  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return success(list)
}

export async function createTransaction(payload = {}) {
  await delay()
  const errors = validateTransactionItems(payload.items)
  if (hasErrors(errors)) return failure('Validasi gagal', 400, errors)

  const products = readCollection('products')
  const transactions = readCollection('transactions')
  const allItems = readCollection('transactionItems')

  const snapshot = []
  for (const item of payload.items) {
    const product = products.find((p) => p.id === item.product_id)
    if (!product) {
      return failure('Produk tidak ditemukan', 400, { items: 'Ada produk yang tidak valid' })
    }
    const qty = Math.min(Math.max(Number(item.qty), 1), QTY_MAX)
    snapshot.push({
      product_id: product.id,
      name: product.name,
      price: product.price,
      qty,
      subtotal: product.price * qty
    })
  }

  if (snapshot.length === 0) {
    return failure('Validasi gagal', 400, { items: 'Pesanan minimal berisi 1 item' })
  }

  const now = new Date()
  const transactionId = nextId(transactions, 'trx', 4)
  const code = buildOrderCode(
    transactions.map((trx) => trx.code),
    now
  )

  const transaction = {
    id: transactionId,
    code,
    customer_name: String(payload.customer_name || '').trim(),
    note: String(payload.note || '').trim(),
    total: snapshot.reduce((sum, item) => sum + item.subtotal, 0),
    payment_status: 'unpaid',
    payment_method: null,
    amount_received: null,
    change: null,
    order_status: 'diterima',
    created_by: payload.created_by || readSession()?.id || null,
    created_at: now.toISOString(),
    paid_at: null
  }

  const createdItems = snapshot.map((item) => {
    const id = nextId(allItems, 'tin', 4)
    const row = { id, transaction_id: transaction.id, ...item }
    allItems.push(row)
    return row
  })

  transactions.push(transaction)
  writeCollection('transactions', transactions)
  writeCollection('transactionItems', allItems)

  return success({ ...transaction, items: createdItems }, 201)
}

export async function updatePayment(id, payload = {}) {
  await delay()
  const transactions = readCollection('transactions')
  const index = transactions.findIndex((trx) => trx.id === id)
  if (index === -1) return failure('Transaksi tidak ditemukan', 404)

  const transaction = transactions[index]
  if (transaction.order_status === 'dibatalkan') {
    return failure('Transaksi yang dibatalkan tidak dapat dibayar', 409)
  }
  if (transaction.payment_status === 'paid') {
    return failure('Transaksi ini sudah dibayar', 409)
  }

  const method = payload.method
  if (!PAYMENT_METHODS.includes(method)) {
    return failure('Validasi gagal', 400, { method: 'Metode pembayaran tidak valid' })
  }

  const errors = validatePayment({ method, amount_received: payload.amount_received }, transaction.total)
  if (hasErrors(errors)) {
    return failure('Uang diterima kurang dari total', 400, errors)
  }

  const amountReceived = method === 'cash' ? Number(payload.amount_received) : transaction.total
  const updated = {
    ...transaction,
    payment_status: 'paid',
    payment_method: method,
    amount_received: amountReceived,
    change: method === 'cash' ? amountReceived - transaction.total : 0,
    paid_at: new Date().toISOString()
  }

  transactions[index] = updated
  writeCollection('transactions', transactions)
  return success(updated)
}

export async function updateOrderStatus(id, { order_status: nextStatus } = {}) {
  await delay()
  const transactions = readCollection('transactions')
  const index = transactions.findIndex((trx) => trx.id === id)
  if (index === -1) return failure('Transaksi tidak ditemukan', 404)

  const transaction = transactions[index]
  if (TERMINAL_STATUSES.includes(transaction.order_status)) {
    return failure('Pesanan yang sudah selesai atau dibatalkan tidak dapat diubah', 409)
  }
  if (!ORDER_STATUSES.includes(nextStatus)) {
    return failure('Status pesanan tidak valid', 400)
  }

  const allowed = STATUS_FLOW[transaction.order_status] || []
  if (!allowed.includes(nextStatus)) {
    return failure(`Status tidak dapat diubah dari "${transaction.order_status}" ke "${nextStatus}"`, 409)
  }

  const updated = { ...transaction, order_status: nextStatus }
  transactions[index] = updated
  writeCollection('transactions', transactions)
  return success(updated)
}

export async function getOrderByCode(code) {
  await delay(120)
  const needle = String(code || '').trim().toUpperCase()
  if (!needle) return failure('Kode pesanan wajib diisi', 400, { code: 'Kode pesanan wajib diisi' })

  const transaction = readTransactionsWithItems().find((trx) => trx.code === needle)
  if (!transaction) return failure('Kode pesanan tidak ditemukan', 404)

  return success({
    code: transaction.code,
    customer_name: transaction.customer_name,
    order_status: transaction.order_status,
    payment_status: transaction.payment_status,
    total: transaction.total,
    created_at: transaction.created_at,
    order_note: transaction.note,
    items: transaction.items.map((item) => ({
      name: item.name,
      qty: item.qty,
      price: item.price,
      subtotal: item.subtotal
    }))
  })
}

/* ============================================================
   REPORTS
   ============================================================ */
export async function getSummary() {
  await delay(60)
  const transactions = readTransactionsWithItems()
  const today = toDateInput(new Date())
  const monthPrefix = today.slice(0, 7)

  const paid = transactions.filter(isRevenue)
  const paidToday = paid.filter((trx) => toDateInput(revenueDate(trx)) === today)
  const paidMonth = paid.filter((trx) => toDateInput(revenueDate(trx)).startsWith(monthPrefix))

  const todayTransactions = transactions.filter(
    (trx) => toDateInput(trx.created_at) === today && trx.order_status !== 'dibatalkan'
  )

  const productMap = new Map()
  paid.forEach((trx) => {
    trx.items.forEach((item) => {
      const current = productMap.get(item.product_id) || {
        product_id: item.product_id,
        name: item.name,
        qty: 0,
        revenue: 0
      }
      current.qty += item.qty
      current.revenue += item.subtotal
      current.name = item.name
      productMap.set(item.product_id, current)
    })
  })

  const topProducts = [...productMap.values()].sort((a, b) => b.qty - a.qty).slice(0, 5)

  return success({
    revenue_today: paidToday.reduce((sum, trx) => sum + trx.total, 0),
    revenue_month: paidMonth.reduce((sum, trx) => sum + trx.total, 0),
    transaction_count_today: todayTransactions.length,
    unpaid_count: transactions.filter(
      (trx) => trx.payment_status === 'unpaid' && trx.order_status !== 'dibatalkan'
    ).length,
    top_products: topProducts
  })
}

export async function getSales({ date_from: dateFrom, date_to: dateTo } = {}) {
  await delay(60)
  if (!isValidDateInput(dateFrom) || !isValidDateInput(dateTo)) {
    return failure('Rentang tanggal tidak valid', 400, { date: 'Tanggal awal dan akhir wajib diisi' })
  }
  if (dateFrom > dateTo) {
    return failure('Rentang tanggal terbalik', 400, {
      date: 'Tanggal awal tidak boleh melebihi tanggal akhir'
    })
  }

  const rows = readTransactionsWithItems()
    .filter((trx) => isRevenue(trx))
    .filter((trx) => {
      const date = toDateInput(revenueDate(trx))
      return date >= dateFrom && date <= dateTo
    })
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  const totalRevenue = rows.reduce((sum, trx) => sum + trx.total, 0)
  const totalItems = rows.reduce(
    (sum, trx) => sum + trx.items.reduce((acc, item) => acc + item.qty, 0),
    0
  )

  return success({ rows, total_revenue: totalRevenue, total_items: totalItems })
}

export { ORDER_STATUSES, PAYMENT_METHODS, STATUS_FLOW, TERMINAL_STATUSES }
