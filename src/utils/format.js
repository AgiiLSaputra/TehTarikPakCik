/**
 * Utilitas format angka, rupiah, dan tanggal (locale id-ID).
 */

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
})

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
})

const weekdayFormatter = new Intl.DateTimeFormat('id-ID', { weekday: 'short' })

/** 12500 -> "Rp12.500" */
export function formatRupiah(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 'Rp0'
  return `Rp${currencyFormatter.format(n)}`
}

/** 12500 -> "12.500" */
export function formatNumber(value) {
  return currencyFormatter.format(Number(value) || 0)
}

export function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return dateFormatter.format(d)
}

export function formatTime(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`
}

export function formatDateTime(value) {
  if (!value) return '-'
  return `${formatDate(value)}, ${formatTime(value)}`
}

export function formatWeekday(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return weekdayFormatter.format(d)
}

/** Date -> "YYYY-MM-DD" memakai zona waktu lokal (bukan UTC). */
export function toDateInput(date = new Date()) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayInput() {
  return toDateInput(new Date())
}

export function monthStartInput() {
  const d = new Date()
  return toDateInput(new Date(d.getFullYear(), d.getMonth(), 1))
}

export function daysAgoInput(days = 0) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return toDateInput(d)
}

export function isSameDay(a, b) {
  const d1 = new Date(a)
  const d2 = new Date(b)
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

/** Memeriksa nilai input tanggal YYYY-MM-DD valid. */
export function isValidDateInput(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime())
}

export function greeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export function uppercaseFirst(text = '') {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
