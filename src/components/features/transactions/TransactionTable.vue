<script setup>
import { formatDateTime, formatRupiah } from '@/utils/format'
import { STATUS_FLOW, TERMINAL_STATUSES } from '@/services/api'
import BaseIcon from '@/components/common/BaseIcon.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

defineProps({
  transactions: { type: Array, default: () => [] },
  canManage: { type: Boolean, default: false }
})

const emit = defineEmits(['pay', 'status', 'receipt'])

const STATUS_LABEL = {
  diproses: 'Proses',
  siap: 'Siap',
  selesai: 'Selesai',
  dibatalkan: 'Batalkan'
}

const PAYMENT_LABEL = {
  cash: 'Tunai',
  qris: 'QRIS',
  transfer: 'Transfer'
}

function isTerminal(transaction) {
  return TERMINAL_STATUSES.includes(transaction.order_status)
}

function nextOptions(transaction) {
  return (STATUS_FLOW[transaction.order_status] || []).map((status) => ({
    value: status,
    label: STATUS_LABEL[status] || status
  }))
}

function itemSummary(transaction) {
  const count = transaction.items.reduce((sum, item) => sum + item.qty, 0)
  const first = transaction.items[0]?.name || '-'
  return transaction.items.length > 1 ? `${first} +${transaction.items.length - 1} lagi · ${count} pcs` : `${first} · ${count} pcs`
}

function onStatusChange(transaction, event) {
  const status = event.target.value
  event.target.value = ''
  if (!status) return
  emit('status', { transaction, status })
}
</script>

<template>
  <div v-if="transactions.length" class="table-wrap">
    <table class="table transaction-table">
      <thead>
        <tr>
          <th>Kode</th>
          <th>Waktu</th>
          <th>Pelanggan</th>
          <th>Item</th>
          <th class="num">Total</th>
          <th>Pembayaran</th>
          <th>Status</th>
          <th class="actions-head">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="transaction in transactions" :key="transaction.id">
          <td>
            <span class="code">{{ transaction.code }}</span>
            <small v-if="transaction.note" class="note">{{ transaction.note }}</small>
          </td>
          <td class="muted small nowrap">{{ formatDateTime(transaction.created_at) }}</td>
          <td class="nowrap">{{ transaction.customer_name || 'Tamu' }}</td>
          <td class="items-cell">{{ itemSummary(transaction) }}</td>
          <td class="num strong nowrap">{{ formatRupiah(transaction.total) }}</td>
          <td>
            <div class="payment-cell">
              <StatusBadge :status="transaction.payment_status" type="payment" />
              <small v-if="transaction.payment_method" class="method">
                {{ PAYMENT_LABEL[transaction.payment_method] }}
              </small>
            </div>
          </td>
          <td><StatusBadge :status="transaction.order_status" /></td>
          <td>
            <div class="row-actions">
              <button type="button" class="mini-btn" @click="emit('receipt', transaction)">
                <BaseIcon name="receipt" :size="15" />
                Nota
              </button>

              <button
                v-if="
                  canManage &&
                  transaction.payment_status === 'unpaid' &&
                  transaction.order_status !== 'dibatalkan'
                "
                type="button"
                class="mini-btn is-primary"
                @click="emit('pay', transaction)"
              >
                <BaseIcon name="cash" :size="15" />
                Bayar
              </button>

              <select
                v-if="canManage && !isTerminal(transaction)"
                class="status-select"
                aria-label="Ubah status pesanan"
                @change="onStatusChange(transaction, $event)"
              >
                <option value="">Ubah status</option>
                <option v-for="option in nextOptions(transaction)" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <EmptyState
    v-else
    icon="receipt"
    title="Belum ada transaksi"
    description="Transaksi baru akan muncul di sini setelah pesanan disimpan oleh kasir."
  />
</template>

<style scoped>
.transaction-table {
  min-width: 980px;
}

.nowrap {
  white-space: nowrap;
}

.code {
  display: block;
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-primary-dark);
}

.note {
  display: block;
  max-width: 190px;
  font-size: 0.7rem;
  color: var(--color-text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.items-cell {
  max-width: 220px;
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.payment-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.method {
  font-size: 0.68rem;
  color: var(--color-text-light);
}

.actions-head {
  text-align: right;
}

.row-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.mini-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 9px;
  border: 1px solid var(--color-border-strong);
  border-radius: 7px;
  background: var(--color-surface);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-primary-dark);
  white-space: nowrap;
  transition: all 0.16s ease;
}

.mini-btn:hover {
  background: var(--color-surface-muted);
  border-color: var(--color-primary-soft);
}

.mini-btn.is-primary {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  color: #fff;
}

.mini-btn.is-primary:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.status-select {
  height: 30px;
  max-width: 118px;
  padding: 0 8px;
  border: 1px solid var(--color-border-strong);
  border-radius: 7px;
  background: var(--color-surface);
  font-size: 0.72rem;
  color: var(--color-text-muted);
  cursor: pointer;
}

.status-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

@media (max-width: 640px) {
  .row-actions {
    flex-wrap: wrap;
  }
}
</style>
