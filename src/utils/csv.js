/**
 * Ekspor data ke CSV (dipakai laporan pemilik).
 */

function escapeCell(value) {
  const text = value === null || value === undefined ? '' : String(value)
  if (/[",\n;]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function toCsv(headers = [], rows = []) {
  const head = headers.map((h) => escapeCell(h.label ?? h)).join(',')
  const body = rows.map((row) =>
    headers
      .map((h) => escapeCell(typeof h === 'object' && h.key ? row[h.key] : row[h]))
      .join(',')
  )
  return [head, ...body].join('\r\n')
}

export function downloadCsv(filename, headers, rows) {
  const content = `\uFEFF${toCsv(headers, rows)}`
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
