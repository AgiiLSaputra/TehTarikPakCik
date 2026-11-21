/**
 * Lapisan persistensi localStorage + inisialisasi seed (PRD 8.4).
 * Semua akses dibungkus try/catch agar JSON rusak / storage penuh
 * tidak membuat aplikasi berhenti.
 */
import usersSeed from '@/data/seed/users.json'
import categoriesSeed from '@/data/seed/categories.json'
import productsSeed from '@/data/seed/products.json'
import transactionsSeed from '@/data/seed/transactions.json'
import { buildOrderCode } from '@/utils/orderCode'

const SEED_VERSION = '1.0.0'

export const KEYS = {
  users: 'ttpc:users',
  categories: 'ttpc:categories',
  products: 'ttpc:products',
  transactions: 'ttpc:transactions',
  transactionItems: 'ttpc:transaction_items',
  session: 'ttpc:session',
  seedVersion: 'ttpc:seed_version'
}

const COLLECTIONS = ['users', 'categories', 'products', 'transactions', 'transactionItems']

function readJson(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? null : JSON.parse(raw)
  } catch (error) {
    console.warn(`[storage] Gagal membaca ${key}`, error)
    return null
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.warn(`[storage] Gagal menyimpan ${key}`, error)
    return false
  }
}

/** Membentuk transaksi + item seed dengan tanggal relatif hari ini. */
function buildSeedData() {
  const ordered = transactionsSeed.transactions
    .map((row) => {
      const [hour, minute] = String(row.time || '10:00').split(':').map(Number)
      const createdAt = new Date()
      createdAt.setHours(hour, minute, 0, 0)
      createdAt.setDate(createdAt.getDate() - Number(row.day_offset || 0))
      return { ...row, _created: createdAt }
    })
    .sort((a, b) => a._created - b._created)

  const transactions = []
  const items = []
  let itemSeq = 0

  for (const row of ordered) {
    const transactionItems = row.items.map((seedItem) => {
      const product = productsSeed.find((p) => p.id === seedItem.product_id)
      const price = product ? product.price : 0
      const qty = Number(seedItem.qty) || 1
      itemSeq += 1
      return {
        id: `tin-${String(itemSeq).padStart(4, '0')}`,
        transaction_id: row.id,
        product_id: seedItem.product_id,
        name: product ? product.name : 'Produk',
        price,
        qty,
        subtotal: price * qty
      }
    })

    const total = transactionItems.reduce((sum, item) => sum + item.subtotal, 0)
    const isPaid = row.payment_status === 'paid'
    const amountReceived = isPaid
      ? row.payment_method === 'cash'
        ? Number(row.amount_received) || total
        : total
      : null

    const paidAt = isPaid ? new Date(row._created.getTime() + 3 * 60000) : null

    transactions.push({
      id: row.id,
      code: buildOrderCode(
        transactions.map((t) => t.code),
        row._created
      ),
      customer_name: row.customer_name || '',
      note: row.note || '',
      total,
      payment_status: row.payment_status,
      payment_method: row.payment_method || null,
      amount_received: amountReceived,
      change: isPaid && row.payment_method === 'cash' ? amountReceived - total : isPaid ? 0 : null,
      order_status: row.order_status,
      created_by: row.created_by,
      created_at: row._created.toISOString(),
      paid_at: paidAt ? paidAt.toISOString() : null
    })

    items.push(...transactionItems)
  }

  return { transactions, items }
}

/**
 * Memeriksa setiap key. Key yang belum ada diisi dari seed JSON.
 * Data pengguna yang sudah ada TIDAK ditimpa.
 */
export function initSeed() {
  try {
    const version = localStorage.getItem(KEYS.seedVersion)
    const isFreshVersion = version !== SEED_VERSION
    const seed = buildSeedData()

    const defaults = {
      users: usersSeed,
      categories: categoriesSeed,
      products: productsSeed,
      transactions: seed.transactions,
      transactionItems: seed.items
    }

    COLLECTIONS.forEach((name) => {
      const key = KEYS[name]
      if (localStorage.getItem(key) === null || isFreshVersion) {
        writeJson(key, defaults[name] ?? [])
      }
    })

    localStorage.setItem(KEYS.seedVersion, SEED_VERSION)
  } catch (error) {
    console.warn('[storage] Inisialisasi seed gagal', error)
  }
}

/** Mengosongkan seluruh data ttpC:* lalu memuat ulang seed. */
export function resetData() {
  try {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key))
  } catch (error) {
    console.warn('[storage] Gagal menghapus data', error)
  }
  initSeed()
}

export function readCollection(name) {
  const value = readJson(KEYS[name])
  return Array.isArray(value) ? value : []
}

export function writeCollection(name, list) {
  return writeJson(KEYS[name], Array.isArray(list) ? list : [])
}

export function readSession() {
  const value = readJson(KEYS.session)
  return value && typeof value === 'object' ? value : null
}

export function writeSession(user) {
  return writeJson(KEYS.session, { id: user.id, role: user.role, at: new Date().toISOString() })
}

export function clearSession() {
  try {
    localStorage.removeItem(KEYS.session)
  } catch (error) {
    console.warn('[storage] Gagal menghapus sesi', error)
  }
}

export { SEED_VERSION }
