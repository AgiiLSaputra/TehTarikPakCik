import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/services/api'
import { downloadCsv } from '@/utils/csv'
import { formatDate, formatDateTime, formatWeekday, toDateInput } from '@/utils/format'
import { useTransactionStore } from './transaction'

const EMPTY_SUMMARY = {
  revenue_today: 0,
  revenue_month: 0,
  transaction_count_today: 0,
  unpaid_count: 0,
  top_products: []
}

const PAYMENT_LABEL = { cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer' }

export const useReportStore = defineStore('report', () => {
  const summary = ref({ ...EMPTY_SUMMARY })
  const sales = ref({ rows: [], total_revenue: 0, total_items: 0 })
  const loading = ref(false)
  const error = ref('')

  const revenueToday = computed(() => summary.value.revenue_today)
  const revenueMonth = computed(() => summary.value.revenue_month)
  const transactionCountToday = computed(() => summary.value.transaction_count_today)
  const unpaidCount = computed(() => summary.value.unpaid_count)
  const topProducts = computed(() => summary.value.top_products || [])

  const last7Days = computed(() => {
    const transactionStore = useTransactionStore()
    const days = []

    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - offset)
      const key = toDateInput(date)

      const revenue = transactionStore.items
        .filter(
          (trx) =>
            trx.payment_status === 'paid' &&
            trx.order_status !== 'dibatalkan' &&
            toDateInput(trx.paid_at || trx.created_at) === key
        )
        .reduce((sum, trx) => sum + trx.total, 0)

      days.push({ key, label: formatWeekday(date), date: formatDate(date), revenue })
    }

    return days
  })

  async function loadSummary() {
    loading.value = true
    try {
      const result = await api.getSummary()
      if (result.success) summary.value = result.data
      return result
    } finally {
      loading.value = false
    }
  }

  async function loadSales(dateFrom, dateTo) {
    loading.value = true
    error.value = ''
    try {
      const result = await api.getSales({ date_from: dateFrom, date_to: dateTo })
      if (result.success) {
        sales.value = result.data
      } else {
        sales.value = { rows: [], total_revenue: 0, total_items: 0 }
        error.value = result.errors?.date || result.message
      }
      return result
    } finally {
      loading.value = false
    }
  }

  function exportSalesCsv(rows = sales.value.rows) {
    const data = rows.map((trx) => ({
      code: trx.code,
      date: formatDateTime(trx.created_at),
      customer: trx.customer_name || '-',
      items: trx.items.map((item) => `${item.name} x${item.qty}`).join('; '),
      qty: trx.items.reduce((sum, item) => sum + item.qty, 0),
      payment: PAYMENT_LABEL[trx.payment_method] || '-',
      status: trx.order_status,
      total: trx.total
    }))

    downloadCsv(
      `laporan-teh-tarik-pak-cik-${toDateInput(new Date())}`,
      [
        { key: 'code', label: 'Kode Pesanan' },
        { key: 'date', label: 'Waktu' },
        { key: 'customer', label: 'Pelanggan' },
        { key: 'items', label: 'Item' },
        { key: 'qty', label: 'Total Qty' },
        { key: 'payment', label: 'Metode Bayar' },
        { key: 'status', label: 'Status' },
        { key: 'total', label: 'Total (Rp)' }
      ],
      data
    )

    return data.length
  }

  return {
    summary,
    sales,
    loading,
    error,
    revenueToday,
    revenueMonth,
    transactionCountToday,
    unpaidCount,
    topProducts,
    last7Days,
    loadSummary,
    loadSales,
    exportSalesCsv
  }
})
