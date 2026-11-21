<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useReportStore } from '@/stores/report'
import { useUiStore } from '@/stores/ui'
import { formatNumber, formatRupiah, monthStartInput, todayInput } from '@/utils/format'
import BaseIcon from '@/components/common/BaseIcon.vue'
import DateRangeFilter from '@/components/features/reports/DateRangeFilter.vue'
import ExportButton from '@/components/features/reports/ExportButton.vue'
import SalesTable from '@/components/features/reports/SalesTable.vue'
import SummaryCard from '@/components/features/reports/SummaryCard.vue'

const report = useReportStore()
const ui = useUiStore()

const range = ref({ from: monthStartInput(), to: todayInput() })

const totalRevenue = computed(() => report.sales.total_revenue)
const totalTransactions = computed(() => report.sales.rows.length)
const totalItems = computed(() => report.sales.total_items)
const average = computed(() =>
  totalTransactions.value ? Math.round(totalRevenue.value / totalTransactions.value) : 0
)

const topInRange = computed(() => {
  const map = new Map()
  report.sales.rows.forEach((trx) => {
    trx.items.forEach((item) => {
      const current = map.get(item.product_id) || {
        product_id: item.product_id,
        name: item.name,
        qty: 0,
        revenue: 0
      }
      current.qty += item.qty
      current.revenue += item.subtotal
      current.name = item.name
      map.set(item.product_id, current)
    })
  })
  return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5)
})

const topMax = computed(() => Math.max(...topInRange.value.map((item) => item.qty), 1))

async function load() {
  await report.loadSales(range.value.from, range.value.to)
}

function exportCsv() {
  if (!report.sales.rows.length) {
    ui.error('Tidak ada data untuk diunduh pada rentang ini')
    return
  }
  const count = report.exportSalesCsv()
  ui.success(`Laporan CSV berisi ${count} transaksi berhasil diunduh`)
}

watch(
  range,
  () => {
    load()
  },
  { deep: true }
)

onMounted(load)
</script>

<template>
  <div class="report-page">
    <header class="page-head">
      <div>
        <h1>Laporan Penjualan</h1>
        <p>Rekap transaksi lunas pada rentang tanggal yang dipilih.</p>
      </div>
      <ExportButton
        :disabled="Boolean(report.error) || report.sales.rows.length === 0"
        :loading="report.loading"
        @export="exportCsv"
      />
    </header>

    <section class="filter-panel card">
      <DateRangeFilter v-model="range" :error="report.error" />
    </section>

    <section class="summary-grid">
      <SummaryCard
        title="Total pendapatan"
        :value="formatRupiah(totalRevenue)"
        icon="cash"
        tone="dark"
        caption="Hanya transaksi lunas"
      />
      <SummaryCard
        title="Transaksi"
        :value="formatNumber(totalTransactions)"
        icon="receipt"
        tone="cream"
        caption="Tidak termasuk yang dibatalkan"
      />
      <SummaryCard
        title="Item terjual"
        :value="formatNumber(totalItems)"
        icon="box"
        tone="accent"
        caption="Akumulasi seluruh qty"
      />
      <SummaryCard
        title="Rata-rata / transaksi"
        :value="formatRupiah(average)"
        icon="chart"
        tone="green"
        caption="Pendapatan dibagi transaksi"
      />
    </section>

    <section class="report-grid">
      <div class="table-card panel">
        <div class="panel-head">
          <div>
            <h2>Rincian penjualan</h2>
            <p>{{ range.from }} sampai {{ range.to }}</p>
          </div>
          <span class="csv-note">CSV memakai pemisah koma</span>
        </div>

        <SalesTable
          :rows="report.sales.rows"
          :total-revenue="totalRevenue"
          :loading="report.loading"
        />
      </div>

      <aside class="side">
        <div class="panel">
          <div class="panel-head">
            <div>
              <h2>Produk terlaris</h2>
              <p>Pada rentang tanggal ini.</p>
            </div>
            <BaseIcon name="star" :size="18" class="side-icon" />
          </div>

          <ul v-if="topInRange.length" class="top-list">
            <li v-for="(item, index) in topInRange" :key="item.product_id">
              <span class="rank">{{ index + 1 }}</span>
              <div class="top-info">
                <div class="top-line">
                  <strong>{{ item.name }}</strong>
                  <span>{{ item.qty }} pcs</span>
                </div>
                <div class="bar">
                  <span :style="{ width: `${(item.qty / topMax) * 100}%` }" />
                </div>
                <small>{{ formatRupiah(item.revenue) }}</small>
              </div>
            </li>
          </ul>
          <p v-else class="muted small">Belum ada data penjualan.</p>
        </div>

        <div class="panel note-panel">
          <BaseIcon name="info" :size="18" />
          <div>
            <h3>Catatan laporan</h3>
            <p>
              Pendapatan dihitung dari transaksi berstatus <strong>lunas</strong> dan tidak
              dibatalkan. Transaksi tunai memakai nominal tagihan, bukan uang diterima.
            </p>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<style scoped>
.report-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-panel {
  padding: 18px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.report-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

@media (min-width: 1680px) {
  .report-grid {
    grid-template-columns: minmax(0, 1.65fr) minmax(280px, 1fr);
  }
}

.table-card {
  overflow: hidden;
}

.panel-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;
}

.panel-head h2 {
  font-size: 0.98rem;
}

.panel-head p {
  margin-top: 2px;
  font-size: 0.74rem;
  color: var(--color-text-muted);
}

.csv-note {
  font-size: 0.68rem;
  color: var(--color-text-light);
}

.side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 760px) and (max-width: 1679px) {
  .side {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(280px, 1fr);
    align-items: start;
  }
}

.side-icon {
  color: var(--color-accent);
}

.top-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.top-list li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.rank {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  flex: none;
  margin-top: 1px;
  border-radius: 7px;
  background: var(--color-surface-muted);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

.top-info {
  flex: 1;
  min-width: 0;
}

.top-line {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 5px;
}

.top-line strong {
  font-size: 0.82rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.top-line span {
  flex: none;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-primary);
}

.bar {
  height: 5px;
  border-radius: var(--radius-pill);
  background: var(--color-surface-muted);
  overflow: hidden;
}

.bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--color-accent), var(--color-primary));
}

.top-info small {
  display: block;
  margin-top: 3px;
  font-size: 0.68rem;
  color: var(--color-text-light);
}

.note-panel {
  display: flex;
  gap: 12px;
  background: var(--color-info-soft);
  border-color: rgba(47, 111, 159, 0.18);
  color: #245a80;
}

.note-panel h3 {
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 600;
}

.note-panel p {
  margin-top: 4px;
  font-size: 0.75rem;
  line-height: 1.6;
  color: #336b90;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
