<script setup>
import { computed, ref } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import { useUiStore } from '@/stores/ui'
import { useCart } from '@/composables/useCart'
import { formatDate, formatRupiah } from '@/utils/format'
import BaseIcon from '@/components/common/BaseIcon.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import CartPanel from '@/components/features/transactions/CartPanel.vue'
import PaymentForm from '@/components/features/transactions/PaymentForm.vue'
import ProductPicker from '@/components/features/transactions/ProductPicker.vue'
import ReceiptModal from '@/components/features/transactions/ReceiptModal.vue'

const transactionStore = useTransactionStore()
const ui = useUiStore()
const { count, total } = useCart()

const cartPanel = ref(null)
const creating = ref(false)
const paying = ref(false)

const receiptOpen = ref(false)
const paymentOpen = ref(false)
const selected = ref(null)

const todayLabel = formatDate(new Date())
const todayCount = computed(() => transactionStore.todayList.length)
const unpaidCount = computed(
  () => transactionStore.todayList.filter((trx) => trx.payment_status === 'unpaid').length
)
const todayRevenue = computed(() =>
  transactionStore.todayList
    .filter((trx) => trx.payment_status === 'paid' && trx.order_status !== 'dibatalkan')
    .reduce((sum, trx) => sum + trx.total, 0)
)

function handleAdd(product) {
  transactionStore.addToCart(product)
}

async function handleCheckout(payload) {
  if (creating.value) return
  creating.value = true

  const result = await transactionStore.create(payload)
  creating.value = false

  if (!result.success) {
    ui.error(result.errors?.items || result.message)
    return
  }

  cartPanel.value?.reset()
  selected.value = result.data
  receiptOpen.value = true
  ui.success(`Pesanan ${result.data.code} berhasil dibuat`)
}

function openPayment(transaction) {
  selected.value = transaction
  receiptOpen.value = false
  paymentOpen.value = true
}

function openReceipt(transaction) {
  selected.value = transaction
  receiptOpen.value = true
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
</script>

<template>
  <div class="cashier">
    <header class="page-head">
      <div>
        <h1>Kasir</h1>
        <p>{{ todayLabel }} · {{ todayCount }} pesanan hari ini</p>
      </div>

      <div class="head-stats">
        <span v-if="unpaidCount" class="stat-chip is-warning">
          <BaseIcon name="cash" :size="16" />
          {{ unpaidCount }} belum dibayar
        </span>
        <span class="stat-chip is-dark">
          <span class="stat-label">Pendapatan hari ini</span>
          <strong>{{ formatRupiah(todayRevenue) }}</strong>
        </span>
      </div>
    </header>

    <div class="cashier-grid">
      <ProductPicker @add="handleAdd" />
      <CartPanel ref="cartPanel" :saving="creating" @checkout="handleCheckout" />
    </div>

    <div v-if="count > 0" class="mobile-bar">
      <div>
        <small>{{ count }} item</small>
        <strong>{{ formatRupiah(total) }}</strong>
      </div>
      <a href="#keranjang" class="mobile-bar-btn">Lihat keranjang</a>
    </div>

    <ReceiptModal
      v-model="receiptOpen"
      :transaction="selected"
      show-pay
      @pay="openPayment"
    />

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

    <div v-if="selected" class="quick-last">
      <button type="button" class="last-link" @click="openReceipt(selected)">
        <BaseIcon name="receipt" :size="16" />
        Lihat nota terakhir
      </button>
    </div>
  </div>
</template>

<style scoped>
.cashier {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.head-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: 500;
}

.stat-chip.is-warning {
  background: var(--color-warning-soft);
  color: #8f6400;
}

.stat-chip.is-dark {
  background: linear-gradient(135deg, #43280f, #2a1707);
  color: #f7ead6;
  gap: 10px;
  padding-block: 7px;
}

.stat-label {
  font-size: 0.7rem;
  color: rgba(247, 234, 214, 0.6);
}

.stat-chip strong {
  font-family: var(--font-display);
  font-size: 0.98rem;
  color: #ffe3b8;
}

.cashier-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 380px);
  gap: 20px;
  align-items: start;
}

.mobile-bar {
  display: none;
}

.quick-last {
  display: flex;
  justify-content: flex-end;
}

.last-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  font-size: 0.76rem;
  font-weight: 500;
  color: var(--color-text-light);
  padding: 4px;
}

.last-link:hover {
  color: var(--color-primary-dark);
}

@media (max-width: 1100px) {
  .cashier-grid {
    grid-template-columns: 1fr;
  }

  .mobile-bar {
    position: fixed;
    left: 16px;
    right: 16px;
    bottom: 16px;
    z-index: 45;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 10px 12px 10px 18px;
    border-radius: var(--radius-pill);
    background: linear-gradient(135deg, #43280f, #2a1707);
    color: #f7ead6;
    box-shadow: 0 20px 40px -18px rgba(0, 0, 0, 0.6);
    animation: fadeUp 0.3s var(--ease);
  }

  .mobile-bar small {
    display: block;
    font-size: 0.68rem;
    color: rgba(247, 234, 214, 0.6);
  }

  .mobile-bar strong {
    font-family: var(--font-display);
    font-size: 1rem;
    color: #ffe3b8;
  }

  .mobile-bar-btn {
    padding: 10px 18px;
    border-radius: var(--radius-pill);
    background: var(--color-accent);
    color: #2b1607;
    font-size: 0.8rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .cashier {
    padding-bottom: 76px;
  }

  .quick-last {
    padding-bottom: 8px;
  }
}

@media (max-width: 560px) {
  .head-stats {
    width: 100%;
  }

  .stat-chip.is-dark {
    flex: 1;
    justify-content: space-between;
  }
}
</style>
