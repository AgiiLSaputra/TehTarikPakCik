<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCategoryStore } from '@/stores/category'
import { useProductStore } from '@/stores/product'
import { useReportStore } from '@/stores/report'
import { useTransactionStore } from '@/stores/transaction'
import { useUiStore } from '@/stores/ui'
import { resetData, writeSession } from '@/services/storage'
import { formatDate, formatNumber, formatRupiah, formatTime, greeting } from '@/utils/format'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseIcon from '@/components/common/BaseIcon.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import SummaryCard from '@/components/features/reports/SummaryCard.vue'
import TopProductsList from '@/components/features/reports/TopProductsList.vue'
import { BRAND } from '@/data/images'

const auth = useAuthStore()
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const transactionStore = useTransactionStore()
const report = useReportStore()
const ui = useUiStore()

const resetOpen = ref(false)
const resetting = ref(false)

const greetingText = computed(() => greeting())
const recent = computed(() => transactionStore.items.slice(0, 5))
const unpaid = computed(() => transactionStore.unpaidList.length)
const weekTotal = computed(() => report.last7Days.reduce((sum, day) => sum + day.revenue, 0))
const chartMax = computed(() => Math.max(...report.last7Days.map((day) => day.revenue), 1))

function barHeight(revenue) {
  if (!revenue) return '0%'
  return `${Math.max((revenue / chartMax.value) * 100, 8)}%`
}

async function refresh() {
  await Promise.all([report.loadSummary(), transactionStore.load(true)])
  ui.info('Ringkasan diperbarui')
}

async function confirmReset() {
  resetting.value = true
  resetData()
  await Promise.all([
    categoryStore.load(true),
    productStore.load(true),
    transactionStore.load(true),
    report.loadSummary()
  ])
  if (auth.user) writeSession(auth.user)
  resetting.value = false
  resetOpen.value = false
  ui.success('Data demo direset ke seed awal')
}

onMounted(() => {
  report.loadSummary()
})
</script>

<template>
  <div class="dashboard">
    <section class="welcome">
      <div class="welcome-copy">
        <span class="eyebrow">Ringkasan usaha</span>
        <h1>{{ greetingText }}, {{ auth.displayName }}</h1>
        <p>{{ formatDate(new Date()) }} · Data tersimpan otomatis di perangkat ini.</p>

        <div class="welcome-actions">
          <RouterLink to="/owner/produk" class="quick-btn">
            <BaseIcon name="box" :size="16" />
            Kelola produk
          </RouterLink>
          <RouterLink to="/owner/laporan" class="quick-btn">
            <BaseIcon name="list" :size="16" />
            Lihat laporan
          </RouterLink>
          <button type="button" class="quick-btn is-ghost" @click="refresh">
            <BaseIcon name="refresh" :size="16" />
            Muat ulang data
          </button>
        </div>
      </div>

      <div class="welcome-card">
        <div class="wc-brand">
          <img :src="BRAND.logo" alt="Logo Teh Tarik Pak Cik" />
          <div>
            <strong>{{ BRAND.name }}</strong>
            <span>{{ BRAND.location }}</span>
          </div>
        </div>
        <div class="wc-status">
          <span class="dot" />
          Sistem aktif · data lokal
        </div>
        <RouterLink v-if="unpaid" to="/transaksi" class="wc-alert">
          <BaseIcon name="cash" :size="17" />
          <span><strong>{{ unpaid }}</strong> pesanan belum dibayar</span>
          <BaseIcon name="chevron-right" :size="16" />
        </RouterLink>
        <p v-else class="wc-ok">
          <BaseIcon name="check-circle" :size="16" />
          Semua pesanan sudah dibayar
        </p>
      </div>
    </section>

    <section class="summary-grid">
      <SummaryCard
        title="Pendapatan hari ini"
        :value="formatRupiah(report.revenueToday)"
        icon="cash"
        tone="dark"
        :caption="`${report.transactionCountToday} transaksi hari ini`"
      />
      <SummaryCard
        title="Pendapatan bulan ini"
        :value="formatRupiah(report.revenueMonth)"
        icon="chart"
        tone="accent"
        caption="Transaksi lunas, tanpa yang dibatalkan"
      />
      <SummaryCard
        title="Transaksi hari ini"
        :value="formatNumber(report.transactionCountToday)"
        icon="receipt"
        tone="cream"
        :caption="`${unpaid} pesanan menunggu pembayaran`"
      />
      <SummaryCard
        title="Menu terlaris"
        :value="report.topProducts[0]?.name || 'Belum ada'"
        icon="star"
        tone="green"
        :caption="report.topProducts[0] ? `${formatNumber(report.topProducts[0].qty)} porsi terjual` : 'Belum ada penjualan'"
      />
    </section>

    <section class="mid-grid">
      <div class="panel chart-panel">
        <div class="panel-head">
          <div>
            <h2>7 hari terakhir</h2>
            <p>Total {{ formatRupiah(weekTotal) }} dari transaksi lunas.</p>
          </div>
          <span class="panel-tag">Harian</span>
        </div>

        <div class="chart">
          <div v-for="day in report.last7Days" :key="day.key" class="bar-col">
            <span class="bar-value">{{ day.revenue ? formatNumber(day.revenue) : '–' }}</span>
            <div class="bar-track">
              <span
                class="bar"
                :class="{ 'is-empty': !day.revenue }"
                :style="{ height: barHeight(day.revenue) }"
                :title="`${day.date}: ${formatRupiah(day.revenue)}`"
              />
            </div>
            <span class="bar-label">{{ day.label }}</span>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Menu terlaris</h2>
            <p>Berdasarkan jumlah porsi terjual.</p>
          </div>
        </div>
        <TopProductsList :items="report.topProducts" />
      </div>
    </section>

    <section class="bottom-grid">
      <div class="panel recent-panel">
        <div class="panel-head">
          <div>
            <h2>Transaksi terbaru</h2>
            <p>5 pesanan terakhir yang tercatat.</p>
          </div>
          <RouterLink to="/transaksi" class="see-all">
            Lihat semua
            <BaseIcon name="arrow-right" :size="15" />
          </RouterLink>
        </div>

        <ul v-if="recent.length" class="recent-list">
          <li v-for="trx in recent" :key="trx.id">
            <div class="recent-main">
              <strong>{{ trx.code }}</strong>
              <small>{{ formatTime(trx.created_at) }} · {{ trx.customer_name || 'Tamu' }}</small>
            </div>
            <StatusBadge :status="trx.order_status" />
            <span class="recent-total">{{ formatRupiah(trx.total) }}</span>
          </li>
        </ul>
        <p v-else class="muted small">Belum ada transaksi.</p>
      </div>

      <div class="panel settings-panel">
        <div class="panel-head">
          <div>
            <h2>Data demo</h2>
            <p>Kembalikan seluruh data ke kondisi seed awal.</p>
          </div>
        </div>
        <p class="settings-text">
          Reset akan menghapus produk, transaksi, dan akun yang Anda tambahkan, lalu memuat ulang
          data contoh dari file seed. Berguna saat presentasi atau pengujian QA.
        </p>
        <div class="settings-meta">
          <span><strong>{{ productStore.items.length }}</strong> produk</span>
          <span><strong>{{ transactionStore.items.length }}</strong> transaksi</span>
          <span><strong>{{ categoryStore.items.length }}</strong> kategori</span>
        </div>
        <BaseButton variant="danger" size="sm" @click="resetOpen = true">
          <BaseIcon name="refresh" :size="16" />
          Reset data demo
        </BaseButton>
      </div>
    </section>

    <ConfirmDialog
      v-model="resetOpen"
      title="Reset semua data?"
      message="Seluruh produk, transaksi, dan akun tambahan akan dihapus lalu diganti data seed. Sesi login Anda tetap dipertahankan."
      confirm-text="Ya, reset data"
      :loading="resetting"
      @confirm="confirmReset"
    />
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Welcome */
.welcome {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 20px;
  padding: 28px;
  border-radius: var(--radius-xl);
  background:
    radial-gradient(480px 240px at 88% 10%, rgba(217, 131, 36, 0.25), transparent 70%),
    linear-gradient(120deg, #43280f 0%, #2a1707 100%);
  color: #fdf4e6;
  overflow: hidden;
}

.welcome-copy h1 {
  margin-top: 8px;
  font-size: clamp(1.35rem, 1.1rem + 1vw, 1.85rem);
  color: #fff8ec;
}

.welcome-copy > p {
  margin-top: 6px;
  font-size: 0.85rem;
  color: rgba(253, 244, 230, 0.62);
}

.welcome-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}

.quick-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.08);
  color: #fdf4e6;
  font-size: 0.78rem;
  font-weight: 500;
  transition: background 0.18s ease;
  backdrop-filter: blur(6px);
}

.quick-btn:hover {
  background: rgba(255, 255, 255, 0.16);
}

.quick-btn.is-ghost {
  background: transparent;
  border-style: dashed;
  color: rgba(253, 244, 230, 0.7);
}

.welcome-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
}

.wc-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.wc-brand img {
  width: 42px;
  height: 42px;
  object-fit: contain;
}

.wc-brand strong {
  display: block;
  font-size: 0.84rem;
  color: #fff8ec;
}

.wc-brand span {
  font-size: 0.7rem;
  color: rgba(253, 244, 230, 0.5);
}

.wc-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  color: rgba(253, 244, 230, 0.65);
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #7fd6a4;
  box-shadow: 0 0 0 4px rgba(127, 214, 164, 0.16);
}

.wc-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: rgba(242, 183, 5, 0.16);
  color: #ffdc8a;
  font-size: 0.75rem;
}

.wc-alert span {
  flex: 1;
}

.wc-ok {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  font-size: 0.74rem;
  color: #a9e3c0;
}

/* Summary */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

/* Panels */
.mid-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
  gap: 16px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 16px;
}

.panel {
  padding: 20px;
}

.panel-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 18px;
}

.panel-head h2 {
  font-size: 0.98rem;
  font-weight: 600;
}

.panel-head p {
  margin-top: 2px;
  font-size: 0.76rem;
  color: var(--color-text-muted);
}

.panel-tag {
  padding: 4px 9px;
  border-radius: var(--radius-pill);
  background: var(--color-surface-muted);
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-text-light);
}

/* Chart */
.chart {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 210px;
  padding-top: 10px;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  height: 100%;
}

.bar-value {
  font-size: 0.62rem;
  font-weight: 600;
  color: var(--color-text-light);
  white-space: nowrap;
}

.bar-track {
  flex: 1;
  width: 100%;
  max-width: 44px;
  display: flex;
  align-items: flex-end;
  background: linear-gradient(180deg, rgba(245, 230, 204, 0.35), rgba(245, 230, 204, 0.1));
  border-radius: 8px;
  overflow: hidden;
}

.bar {
  width: 100%;
  border-radius: 8px;
  background: linear-gradient(180deg, #e09a45 0%, var(--color-primary) 100%);
  transition: height 0.5s var(--ease);
  min-height: 0;
}

.bar.is-empty {
  height: 3px !important;
  background: var(--color-border-strong);
}

.bar-label {
  font-size: 0.68rem;
  color: var(--color-text-muted);
}

/* Recent */
.see-all {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--color-primary);
}

.recent-list li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 100px;
  align-items: center;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px dashed var(--color-border);
}

.recent-list li:last-child {
  border-bottom: none;
}

.recent-main strong {
  display: block;
  font-size: 0.82rem;
  font-family: var(--font-display);
  color: var(--color-primary-dark);
}

.recent-main small {
  font-size: 0.7rem;
  color: var(--color-text-light);
}

.recent-total {
  text-align: right;
  font-size: 0.82rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* Settings */
.settings-text {
  font-size: 0.8rem;
  line-height: 1.65;
  color: var(--color-text-muted);
}

.settings-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 14px 0 16px;
}

.settings-meta span {
  padding: 4px 9px;
  border-radius: var(--radius-pill);
  background: var(--color-surface-muted);
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

.settings-meta strong {
  color: var(--color-primary-dark);
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .welcome {
    grid-template-columns: 1fr;
  }

  .welcome-card {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  .wc-alert,
  .wc-ok {
    margin-top: 0;
    margin-left: auto;
  }

  .mid-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .welcome {
    padding: 20px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .recent-list li {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .recent-total {
    grid-column: 1 / -1;
    text-align: left;
  }
}
</style>
