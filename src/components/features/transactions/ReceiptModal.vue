<script setup>
import { computed } from 'vue'
import { formatDate, formatDateTime, formatRupiah } from '@/utils/format'
import { BRAND } from '@/data/images'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseIcon from '@/components/common/BaseIcon.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  transaction: { type: Object, default: null },
  showPay: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'pay'])

const METHOD_LABEL = { cash: 'Tunai', qris: 'QRIS', transfer: 'Transfer' }

const methodLabel = computed(() => METHOD_LABEL[props.transaction?.payment_method] || '-')
const isPaid = computed(() => props.transaction?.payment_status === 'paid')

function print() {
  window.print()
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    size="sm"
    title="Nota Pesanan"
    subtitle="Tampilan nota dapat dicetak atau disimpan sebagai PDF."
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="transaction" class="receipt-shell">
      <div class="receipt-print">
        <header class="receipt-head">
          <img :src="BRAND.logo" alt="Logo Teh Tarik Pak Cik" class="receipt-logo" />
          <h3>{{ BRAND.name }}</h3>
          <p>{{ BRAND.location }} · {{ BRAND.instagram }}</p>
        </header>

        <div class="receipt-meta">
          <div>
            <span>Kode</span>
            <strong>{{ transaction.code }}</strong>
          </div>
          <div>
            <span>Waktu</span>
            <span>{{ formatDateTime(transaction.created_at) }}</span>
          </div>
          <div>
            <span>Pelanggan</span>
            <span>{{ transaction.customer_name || 'Tamu' }}</span>
          </div>
        </div>

        <div class="receipt-items">
          <div v-for="item in transaction.items" :key="item.id" class="receipt-item">
            <div class="receipt-line">
              <span>{{ item.name }}</span>
              <span>{{ formatRupiah(item.subtotal) }}</span>
            </div>
            <div class="receipt-sub">{{ item.qty }} x {{ formatRupiah(item.price) }}</div>
          </div>
        </div>

        <div class="receipt-total">
          <div>
            <span>Total</span>
            <strong>{{ formatRupiah(transaction.total) }}</strong>
          </div>
          <div v-if="isPaid">
            <span>{{ methodLabel }}</span>
            <span>{{ formatRupiah(transaction.amount_received || transaction.total) }}</span>
          </div>
          <div v-if="transaction.payment_method === 'cash' && transaction.change !== null">
            <span>Kembalian</span>
            <span>{{ formatRupiah(transaction.change) }}</span>
          </div>
        </div>

        <div v-if="transaction.note" class="receipt-note">
          <span>Catatan</span>
          <p>{{ transaction.note }}</p>
        </div>

        <div class="receipt-status">
          <StatusBadge :status="transaction.payment_status" type="payment" />
          <StatusBadge :status="transaction.order_status" />
        </div>

        <footer class="receipt-foot">
          <p>Terima kasih, selamat menikmati!</p>
          <small>Dicetak {{ formatDate(new Date()) }} · Sistem Teh Tarik Pak Cik</small>
        </footer>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="print">
        <BaseIcon name="printer" :size="16" />
        Cetak
      </BaseButton>
      <BaseButton
        v-if="showPay && transaction && !isPaid"
        variant="accent"
        size="sm"
        @click="emit('pay', transaction)"
      >
        <BaseIcon name="cash" :size="16" />
        Bayar Sekarang
      </BaseButton>
      <BaseButton v-else size="sm" @click="emit('update:modelValue', false)">Tutup</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.receipt-shell {
  display: flex;
  justify-content: center;
  padding: 4px 0 12px;
}

.receipt-print {
  width: 100%;
  max-width: 320px;
  padding: 20px 18px;
  background: #fffdf8;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-family: var(--font-body);
  color: #2b1b0e;
  box-shadow: var(--shadow-sm);
}

.receipt-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #cbbba3;
  text-align: center;
}

.receipt-logo {
  width: 58px;
  height: 58px;
  object-fit: contain;
  margin-bottom: 2px;
}

.receipt-head h3 {
  font-family: var(--font-display);
  font-size: 0.98rem;
  letter-spacing: 0.02em;
}

.receipt-head p {
  font-size: 0.66rem;
  color: #7a6552;
}

.receipt-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 0;
  border-bottom: 1px dashed #cbbba3;
  font-size: 0.74rem;
}

.receipt-meta div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.receipt-meta span:first-child {
  color: #7a6552;
}

.receipt-meta strong {
  font-size: 0.76rem;
  letter-spacing: 0.02em;
}

.receipt-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
  border-bottom: 1px dashed #cbbba3;
}

.receipt-line {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.78rem;
  font-weight: 500;
}

.receipt-sub {
  font-size: 0.68rem;
  color: #7a6552;
}

.receipt-total {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px 0;
  border-bottom: 1px dashed #cbbba3;
  font-size: 0.76rem;
}

.receipt-total div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.receipt-total div:first-child {
  font-size: 0.82rem;
}

.receipt-total strong {
  font-family: var(--font-display);
  font-size: 1rem;
}

.receipt-note {
  padding: 10px 0;
  border-bottom: 1px dashed #cbbba3;
  font-size: 0.7rem;
}

.receipt-note span {
  color: #7a6552;
}

.receipt-note p {
  margin-top: 2px;
  font-weight: 500;
}

.receipt-status {
  display: flex;
  gap: 6px;
  justify-content: center;
  padding: 12px 0 0;
}

.receipt-foot {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed #cbbba3;
  text-align: center;
}

.receipt-foot p {
  font-size: 0.76rem;
  font-weight: 600;
}

.receipt-foot small {
  display: block;
  margin-top: 3px;
  font-size: 0.62rem;
  color: #7a6552;
}

@media print {
  .receipt-print {
    border: none;
    max-width: 300px;
    padding: 0;
  }
}
</style>
