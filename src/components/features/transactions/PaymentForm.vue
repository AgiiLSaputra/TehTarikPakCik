<script setup>
import { computed, ref, watch } from 'vue'
import { formatRupiah } from '@/utils/format'
import { validatePayment } from '@/utils/validators'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseIcon from '@/components/common/BaseIcon.vue'

const props = defineProps({
  total: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  code: { type: String, default: '' }
})

const emit = defineEmits(['submit'])

const METHODS = [
  { value: 'cash', label: 'Tunai', icon: 'cash', note: 'Hitung kembalian otomatis' },
  { value: 'qris', label: 'QRIS', icon: 'phone', note: 'Pindai kode QR di gerobak' },
  { value: 'transfer', label: 'Transfer', icon: 'wallet', note: 'Transfer bank / e-wallet' }
]

const method = ref('cash')
const amount = ref('')
const error = ref('')

const change = computed(() => Math.max(0, Number(amount.value || 0) - props.total))

const quickAmounts = computed(() => {
  const base = [props.total, 20000, 50000, 100000, 150000]
  return [...new Set(base.filter((value) => value >= props.total))].slice(0, 4)
})

function pick(value) {
  amount.value = String(value)
  error.value = ''
}

function submit() {
  const errors = validatePayment(
    { method: method.value, amount_received: amount.value },
    props.total
  )
  error.value = errors.amount_received || errors.method || ''
  if (error.value) return

  emit('submit', {
    method: method.value,
    amount_received: method.value === 'cash' ? Number(amount.value) : props.total
  })
}

watch(method, () => {
  error.value = ''
  if (method.value !== 'cash') amount.value = ''
})
</script>

<template>
  <div class="payment">
    <div class="payment-total">
      <div>
        <span class="label">Total tagihan</span>
        <strong>{{ formatRupiah(total) }}</strong>
        <small v-if="code">Kode {{ code }}</small>
      </div>
      <span class="total-icon"><BaseIcon name="receipt" :size="22" /></span>
    </div>

    <div class="method-grid">
      <button
        v-for="item in METHODS"
        :key="item.value"
        type="button"
        class="method"
        :class="{ 'is-active': method === item.value }"
        @click="method = item.value"
      >
        <BaseIcon :name="item.icon" :size="19" />
        <strong>{{ item.label }}</strong>
        <small>{{ item.note }}</small>
      </button>
    </div>

    <div v-if="method === 'cash'" class="cash-block">
      <label class="cash-label" for="amount-received">Uang diterima</label>
      <div class="cash-input" :class="{ 'has-error': error }">
        <span>Rp</span>
        <input
          id="amount-received"
          v-model="amount"
          type="number"
          inputmode="numeric"
          min="0"
          step="1000"
          placeholder="0"
          @keyup.enter="submit"
        />
      </div>
      <p v-if="error" class="error-text">{{ error }}</p>

      <div class="quick-row">
        <button v-for="value in quickAmounts" :key="value" type="button" class="quick-chip" @click="pick(value)">
          {{ formatRupiah(value) }}
        </button>
      </div>

      <div class="change-row">
        <span>Kembalian</span>
        <strong :class="{ 'is-empty': !amount }">{{ formatRupiah(change) }}</strong>
      </div>
    </div>

    <div v-else class="info-note">
      <BaseIcon name="info" :size="17" />
      <p>
        Pembayaran {{ method === 'qris' ? 'QRIS' : 'transfer' }} dicatat manual setelah dana diterima.
        Nominal otomatis sama dengan total tagihan.
      </p>
    </div>

    <BaseButton size="lg" block :loading="loading" @click="submit">
      <BaseIcon name="check-circle" :size="18" />
      Konfirmasi Pembayaran
    </BaseButton>
  </div>
</template>

<style scoped>
.payment {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-top: 4px;
}

.payment-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-radius: var(--radius);
  background: linear-gradient(135deg, #4a2c14 0%, #2f1b0a 100%);
  color: #f7ead6;
}

.payment-total .label {
  display: block;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(247, 234, 214, 0.6);
}

.payment-total strong {
  display: block;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffe3b8;
}

.payment-total small {
  font-size: 0.72rem;
  color: rgba(247, 234, 214, 0.55);
}

.total-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-accent-soft);
}

.method-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.method {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-text-muted);
  text-align: left;
  transition: all 0.18s ease;
}

.method strong {
  font-size: 0.86rem;
  color: var(--color-text);
}

.method small {
  font-size: 0.68rem;
  line-height: 1.3;
  color: var(--color-text-light);
}

.method:hover {
  border-color: var(--color-primary-soft);
}

.method.is-active {
  border-color: var(--color-primary);
  background: var(--color-surface-muted);
  box-shadow: 0 0 0 3px rgba(139, 90, 43, 0.1);
}

.method.is-active strong {
  color: var(--color-primary-dark);
}

.cash-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cash-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary-dark);
}

.cash-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  min-height: 52px;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.cash-input:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(139, 90, 43, 0.12);
}

.cash-input.has-error {
  border-color: var(--color-danger);
}

.cash-input span {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.cash-input input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  min-width: 0;
}

.error-text {
  font-size: 0.78rem;
  color: var(--color-danger);
}

.quick-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-chip {
  padding: 8px 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--color-primary-dark);
  transition: all 0.16s ease;
}

.quick-chip:hover {
  background: var(--color-secondary);
  border-color: var(--color-primary-soft);
}

.change-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-muted);
  border: 1px dashed var(--color-border-strong);
}

.change-row span {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.change-row strong {
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--color-success);
}

.change-row strong.is-empty {
  color: var(--color-text-light);
}

.info-note {
  display: flex;
  gap: 10px;
  padding: 14px;
  border-radius: var(--radius-sm);
  background: var(--color-info-soft);
  color: #235e88;
  font-size: 0.83rem;
  line-height: 1.55;
}

@media (max-width: 480px) {
  .method-grid {
    grid-template-columns: 1fr;
  }

  .method {
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }

  .method small {
    margin-left: auto;
  }
}
</style>
