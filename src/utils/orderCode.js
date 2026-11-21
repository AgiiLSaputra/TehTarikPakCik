/**
 * Pembentukan kode pesanan: TTP-YYYYMMDD-NNN (urut per hari).
 */

export function orderDateStamp(date = new Date()) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

/**
 * @param {string[]} existingCodes daftar kode pesanan yang sudah ada
 * @param {Date} date tanggal transaksi
 */
export function buildOrderCode(existingCodes = [], date = new Date()) {
  const prefix = `TTP-${orderDateStamp(date)}-`
  let max = 0

  existingCodes.forEach((code) => {
    if (typeof code === 'string' && code.startsWith(prefix)) {
      const seq = Number.parseInt(code.slice(prefix.length), 10)
      if (Number.isInteger(seq) && seq > max) max = seq
    }
  })

  return `${prefix}${String(max + 1).padStart(3, '0')}`
}

export function isValidOrderCode(code = '') {
  return /^TTP-\d{8}-\d{3}$/.test(String(code).trim().toUpperCase())
}
