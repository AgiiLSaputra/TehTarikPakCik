<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTransactionStore } from '@/stores/transaction'
import { useUiStore } from '@/stores/ui'
import { formatRupiah, toDateInput } from '@/utils/format'
import BaseIcon from '@/components/common/BaseIcon.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import PaymentForm from '@/components/features/transactions/PaymentForm.vue'
import ReceiptModal from '@/components/features/transactions/ReceiptModal.vue'
import TransactionFilter from '@/components/features/transactions/TransactionFilter.vue'
import TransactionTable from '@/components/features/transactions/TransactionTable.vue'

const auth = useAuthStore()
const transactionStore = useTransactionStore()
const ui = useUiStore()

const filters = ref({
  q: '',
  date_from: '',
  date_to: '',
  payment_status: '',
  order_status: ''
})

const receiptOpen = ref(false)
const paymentOpen = ref(false)
const selected = ref(null)
const paying = ref(false)
const updating = ref(false)

const confirmOpen = ref(false)
const pendingCancel = ref(null)

const filtered = computed(() => {
  const f = filters.value
  const needle = f.q.trim().toLowerCase()

  return transactionStore.items.filter((trx) => {
    const date = toDateInput(trx.created_at)
    if (f.date_from && date < f.date_from) return false
    if (f.date_to && date > f.date_to) return false
    if (f.payment_status && trx.payment_status !== f.payment_status) return false
    if (f.order_status && trx.order_status !== f.order_status) return false
    if (needle) {
      const matchCode = trx.code.toLowerCase().includes(needle)
      const matchCustomer = String(trx.customer_name || '').toLowerCase().includes(needle)
      if (!matchCode && !matchCustomer) return false
    }
    return true
  })
})

const paidTotal = computed(() =>
  filtered.value
    .filter((trx) => trx.payment_status === 'paid' && trx.order_status !== 'dibatalkan')
    .reduce((sum, trx) => sum + trx.total, 0)
)

const unpaidCount = computed(
  () =>
    filtered.value.filter(
      (trx) => trx.payment_status === 'unpaid' && trx.order_status !== 'dibatalkan'
    ).length
)

const canManage = computed(() => auth.isCashier)

function openReceipt(transaction) {
  selected.value = transaction
  receiptOpen.value = true
}

function openPayment(transaction) {
  selected.value = transaction
  receiptOpen.value = false
  paymentOpen.value = true
}

async function submitPayment(payload) {
  if (!selected.value || paying.value) return
  paying.value = true
  const result = await transactionStore.pay(selected.value.id, payload)
  paying.value = false

  if (!result.success) {
    ui.error(result.errors?.amount_received || result.message)
    return
  }

  paymentOpen.value = false
  selected.value = transactionStore.byId(selected.value.id)
  receiptOpen.value = true
  ui.success('Pembayaran berhasil dicatat')
}

async function applyStatus(transaction, status) {
  if (updating.value) return
  updating.value = true
  const result = await transactionStore.updateStatus(transaction.id, status)
  updating.value = false

  if (!result.success) {
    ui.error(result.message)
    return
  }
  ui.success(`Status pesanan ${transaction.code} diperbarui`)
}

function handleStatus({ transaction, status }) {
  if (status === 'dibatalkan') {
    pendingCancel.value = transaction
    confirmOpen.value = true
    return
  }
  applyStatus(transaction, status)
}

async function confirmCancel() {
  if (!pendingCancel.value) return
  await applyStatus(pendingCancel.value, 'dibatalkan')
  confirmOpen.value = false
  pendingCancel.value = null
}
</script>

<template>
  <div class="transactions-page">
    <header class="page-head">
      <div>
        <h1>Riwayat Transaksi</h1>
        <p>Semua pesanan yang tercatat di perangkat ini.</p>
      </div>

      <div class="head-stats">
        <span class="stat">
          <small>Transaksi</small>
          <strong>{{ filtered.length }}</strong>
        </span>
        <span class="stat">
          <small>Belum dibayar</small>
          <strong>{{ unpaidCount }}</strong>
        </span>
        <span class="stat is-dark">
          <small>Total lunas</small>
          <strong>{{ formatRupiah(paidTotal) }}</strong>
        </span>
      </div>
    </header>

    <TransactionFilter v-model="filters" />

    <div class="table-card card">
      <div class="table-head">
        <div class="table-title">
          <BaseIcon name="receipt" :size="18" />
          <span>Daftar transaksi</span>
        </div>
        <span class="table-hint">
          {{ canManage ? 'Kasir dapat membayar dan mengubah status pesanan.' : 'Mode lihat saja untuk pemilik.' }}
        </span>
      </div>

      <TransactionTable
        :transactions="filtered"
        :can-manage="canManage"
        @receipt="openReceipt"
        @pay="openPayment"
        @status="handleStatus"
      />
    </div>

    <ReceiptModal v-model="receiptOpen" :transaction="selected" show-pay @pay="openPayment" />

    <BaseModal
      v-model="paymentOpen"
      title="Pembayaran Pesanan"
      :subtitle="selected ? `Kode ${selected.code} · ${selected.customer_name || 'Tamu'}` : ''"
    >
      <PaymentForm
        v-if="selected"
        :total="selected.total"
        :code="selected.code"
        :loading="paying"
        @submit="submitPayment"
      />
    </BaseModal>

    <ConfirmDialog
      v-model="confirmOpen"
      title="Batalkan pesanan?"
      :message="`Pesanan ${pendingCancel?.code || ''} akan ditandai dibatalkan dan tidak dihitung dalam pendapatan. Tindakan ini tidak dapat dikembalikan.`"
      confirm-text="Ya, batalkan"
      :loading="updating"
      @confirm="confirmCancel"
    />
  </div>
</template>

<style scoped>
.transactions-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.head-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 9px 16px;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  min-width: 108px;
}

.stat small {
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  color: var(--color-text-light);
}

.stat strong {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--color-primary-dark);
}

.stat.is-dark {
  background: linear-gradient(135deg, #43280f, #2a1707);
  border-color: transparent;
}

.stat.is-dark small {
  color: rgba(247, 234, 214, 0.6);
}

.stat.is-dark strong {
  color: #ffe3b8;
}

.table-card {
  overflow: hidden;
}

.table-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-muted);
}

.table-title {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-primary-dark);
}

.table-hint {
  font-size: 0.72rem;
  color: var(--color-text-light);
}

@media (max-width: 700px) {
  .head-stats {
    width: 100%;
  }

  .stat {
    flex: 1;
    min-width: 0;
  }

  .stat.is-dark {
    flex-basis: 100%;
  }
}
</style>
