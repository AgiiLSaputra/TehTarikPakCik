<script setup>
import { computed } from 'vue'
import { formatDate, formatRupiah, formatTime } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  totalRevenue: { type: Number, default: 0 },
  loading: { type: Boolean, default: false }
})

const PAYMENT_LABEL = { cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer' }

const totalQty = computed(() =>
  props.rows.reduce((sum, trx) => sum + trx.items.reduce((acc, item) => acc + item.qty, 0), 0)
)

function itemsText(trx) {
  return trx.items.map((item) => `${item.name} ×${item.qty}`).join(', ')
}
</script>

<template>
  <div class="sales-table">
    <div v-if="loading" class="loading-state">
      <span class="loader" />
      Memuat laporan...
    </div>

    <template v-else>
      <div v-if="rows.length" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Tanggal</th>
              <th>Pelanggan</th>
              <th>Item</th>
              <th>Metode</th>
              <th class="num">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td class="strong nowrap">{{ row.code }}</td>
              <td class="nowrap small">
                {{ formatDate(row.paid_at || row.created_at) }}
                <span class="muted">· {{ formatTime(row.created_at) }}</span>
              </td>
              <td class="nowrap">{{ row.customer_name || 'Tamu' }}</td>
              <td class="items">{{ itemsText(row) }}</td>
              <td class="nowrap small">{{ PAYMENT_LABEL[row.payment_method] || '-' }}</td>
              <td class="num strong nowrap">{{ formatRupiah(row.total) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="total-label">
                Total {{ rows.length }} transaksi · {{ totalQty }} item
              </td>
              <td colspan="3" class="num total-value">{{ formatRupiah(totalRevenue) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <EmptyState
        v-else
        icon="list"
        title="Tidak ada penjualan pada rentang ini"
        description="Coba pilih rentang tanggal lain atau pastikan transaksi sudah lunas."
      />
    </template>
  </div>
</template>

<style scoped>
.nowrap {
  white-space: nowrap;
}

.items {
  max-width: 300px;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

tfoot td {
  background: var(--color-surface-muted);
  font-weight: 600;
  border-top: 1px solid var(--color-border);
}

.total-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.total-value {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-primary-dark);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.loader {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border-strong);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
