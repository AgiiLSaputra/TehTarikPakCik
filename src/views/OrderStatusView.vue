<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useTransactionStore } from '@/stores/transaction'
import { useUiStore } from '@/stores/ui'
import { formatDateTime, formatRupiah } from '@/utils/format'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseIcon from '@/components/common/BaseIcon.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import StatusStepper from '@/components/features/transactions/StatusStepper.vue'

const transactionStore = useTransactionStore()
const ui = useUiStore()
const route = useRoute()

const code = ref('')
const loading = ref(false)
const error = ref('')
const order = ref(null)
const searched = ref(false)
const copied = ref(false)

async function submit() {
  const value = code.value.trim().toUpperCase()
  code.value = value

  if (!value) {
    error.value = 'Kode pesanan wajib diisi'
    order.value = null
    return
  }

  loading.value = true
  error.value = ''
  searched.value = true

  const result = await transactionStore.findByCode(value)
  loading.value = false

  if (result.success) {
    order.value = result.data
  } else {
    order.value = null
    error.value = result.message
  }
}

async function copyCode() {
  if (!order.value) return
  try {
    await navigator.clipboard.writeText(order.value.code)
    copied.value = true
    ui.success('Kode pesanan disalin')
    window.setTimeout(() => {
      copied.value = false
    }, 2200)
  } catch (err) {
    ui.error('Gagal menyalin kode. Salin manual dari layar.')
  }
}

function reset() {
  order.value = null
  searched.value = false
  error.value = ''
  code.value = ''
}

onMounted(() => {
  const fromQuery = route.query.kode
  if (typeof fromQuery === 'string' && fromQuery) {
    code.value = fromQuery
    submit()
  }
})
</script>

<template>
  <div class="status-page">
    <div class="page-hero">
      <div class="hero-glow" />
      <div class="container">
        <span class="eyebrow">Lacak pesanan</span>
        <h1>Cek status pesanan</h1>
        <p>
          Masukkan kode pesanan yang tertera di nota (contoh: <strong>TTP-20261120-001</strong>)
          untuk melihat status terbaru dan rincian item.
        </p>
      </div>
    </div>

    <div class="container narrow">
      <form class="lookup card" @submit.prevent="submit">
        <BaseInput
          v-model="code"
          label="Kode pesanan"
          placeholder="TTP-YYYYMMDD-XXX"
          :error="error"
          class="lookup-input"
        >
          <template #icon>
            <BaseIcon name="receipt" :size="18" class="field-icon" />
          </template>
        </BaseInput>
        <BaseButton type="submit" size="lg" :loading="loading">
          <BaseIcon name="search" :size="18" />
          Cek Status
        </BaseButton>
      </form>

      <Transition name="fade" mode="out-in">
        <div v-if="order" key="result" class="result">
          <div class="result-head">
            <div>
              <span class="result-label">Kode pesanan</span>
              <div class="code-row">
                <h2>{{ order.code }}</h2>
                <button type="button" class="copy-btn" @click="copyCode">
                  <BaseIcon :name="copied ? 'check' : 'receipt'" :size="15" />
                  {{ copied ? 'Tersalin' : 'Salin' }}
                </button>
              </div>
              <span class="result-time">Dibuat {{ formatDateTime(order.created_at) }}</span>
            </div>
            <div class="head-badges">
              <StatusBadge :status="order.order_status" />
              <StatusBadge :status="order.payment_status" type="payment" />
            </div>
          </div>

          <div class="result-body">
            <StatusStepper :current-status="order.order_status" />

            <div class="result-meta">
              <div>
                <span>Pelanggan</span>
                <strong>{{ order.customer_name || 'Tamu' }}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>{{ formatRupiah(order.total) }}</strong>
              </div>
              <div>
                <span>Pembayaran</span>
                <strong>{{ order.payment_status === 'paid' ? 'Sudah dibayar' : 'Belum dibayar' }}</strong>
              </div>
            </div>

            <div class="items">
              <h3>Rincian pesanan</h3>
              <ul>
                <li v-for="(item, index) in order.items" :key="index">
                  <span class="item-name">
                    <span class="item-qty">{{ item.qty }}×</span>
                    {{ item.name }}
                  </span>
                  <span class="item-price">{{ formatRupiah(item.subtotal) }}</span>
                </li>
              </ul>
              <div class="items-total">
                <span>Total</span>
                <strong>{{ formatRupiah(order.total) }}</strong>
              </div>
            </div>

            <div v-if="order.order_note" class="order-note">
              <BaseIcon name="info" :size="16" />
              <p><strong>Catatan:</strong> {{ order.order_note }}</p>
            </div>
          </div>

          <div class="result-foot">
            <p>Simpan kode ini untuk mengecek pesanan kembali.</p>
            <BaseButton variant="secondary" size="sm" @click="reset">Cek kode lain</BaseButton>
          </div>
        </div>

        <div v-else-if="searched && error" key="error" class="not-found card">
          <span class="nf-icon"><BaseIcon name="search" :size="24" /></span>
          <h2>Pesanan tidak ditemukan</h2>
          <p>
            Kode <strong>{{ code || 'kosong' }}</strong> tidak ada di sistem. Periksa kembali nota
            atau tanyakan langsung ke kasir.
          </p>
          <BaseButton variant="secondary" size="sm" @click="reset">Coba lagi</BaseButton>
        </div>

        <div v-else key="tips" class="tips">
          <article class="tip card">
            <span class="tip-icon"><BaseIcon name="receipt" :size="19" /></span>
            <h3>Dapatkan kode</h3>
            <p>Kode pesanan tercetak di nota setelah kasir menyimpan pesanan.</p>
          </article>
          <article class="tip card">
            <span class="tip-icon"><BaseIcon name="search" :size="19" /></span>
            <h3>Masukkan kode</h3>
            <p>Format kode TTP-YYYYMMDD-NNN, huruf besar dan kecil sama saja.</p>
          </article>
          <article class="tip card">
            <span class="tip-icon"><BaseIcon name="clock" :size="19" /></span>
            <h3>Pantau status</h3>
            <p>Status berubah dari diterima, diproses, siap, sampai selesai.</p>
          </article>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.status-page {
  padding-bottom: 72px;
}

.page-hero {
  position: relative;
  padding: clamp(40px, 6vw, 72px) 0 clamp(52px, 6vw, 72px);
  background: linear-gradient(130deg, #3d2510 0%, #241407 70%);
  color: #fdf4e6;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  top: -40%;
  right: -10%;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(217, 131, 36, 0.35), transparent 65%);
}

.page-hero .container {
  position: relative;
}

.page-hero .eyebrow {
  color: var(--color-accent-soft);
}

.page-hero h1 {
  margin-top: 10px;
  font-size: clamp(1.8rem, 1.4rem + 2vw, 2.7rem);
  color: #fff8ec;
}

.page-hero p {
  margin-top: 12px;
  max-width: 58ch;
  font-size: 0.94rem;
  line-height: 1.7;
  color: rgba(253, 244, 230, 0.68);
}

.page-hero strong {
  color: #ffe3b8;
  font-weight: 600;
}

.narrow {
  max-width: 780px;
}

.lookup {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  margin-top: -34px;
  position: relative;
  z-index: 2;
  padding: 22px;
  box-shadow: var(--shadow-lg);
}

.lookup-input {
  flex: 1;
}

.result {
  margin-top: 22px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  animation: fadeUp 0.4s var(--ease) both;
}

.result-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px;
  background: var(--color-surface-muted);
  border-bottom: 1px solid var(--color-border);
}

.result-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-light);
}

.code-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.code-row h2 {
  font-size: clamp(1.2rem, 1rem + 0.8vw, 1.55rem);
  letter-spacing: -0.01em;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border: 1px solid var(--color-border-strong);
  border-radius: 6px;
  background: var(--color-surface);
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--color-primary-dark);
}

.copy-btn:hover {
  background: var(--color-surface);
  border-color: var(--color-primary-soft);
}

.result-time {
  display: block;
  margin-top: 5px;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.head-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.result-body {
  padding: 26px 24px;
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.result-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius);
  background: var(--color-surface-muted);
}

.result-meta span {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-light);
}

.result-meta strong {
  display: block;
  margin-top: 3px;
  font-size: 0.9rem;
}

.items h3 {
  font-size: 0.95rem;
  margin-bottom: 10px;
}

.items ul {
  display: flex;
  flex-direction: column;
}

.items li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px dashed var(--color-border);
  font-size: 0.88rem;
}

.item-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-qty {
  display: inline-grid;
  place-items: center;
  min-width: 26px;
  padding: 1px 6px;
  border-radius: 5px;
  background: var(--color-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-primary-dark);
}

.item-price {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.items-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 12px;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.items-total strong {
  font-family: var(--font-display);
  font-size: 1.15rem;
  color: var(--color-primary-dark);
}

.order-note {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: var(--color-warning-soft);
  color: #7a5500;
  font-size: 0.82rem;
  line-height: 1.55;
}

.result-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-muted);
}

.result-foot p {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  margin-top: 22px;
  padding: 44px 24px;
}

.nf-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-danger-soft);
  color: var(--color-danger);
  margin-bottom: 4px;
}

.not-found h2 {
  font-size: 1.1rem;
}

.not-found p {
  max-width: 44ch;
  font-size: 0.87rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.not-found strong {
  color: var(--color-text);
}

.not-found .btn {
  margin-top: 10px;
}

.tips {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 26px;
}

.tip {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: var(--color-secondary);
  color: var(--color-primary-dark);
}

.tip h3 {
  font-size: 0.9rem;
}

.tip p {
  font-size: 0.8rem;
  line-height: 1.6;
  color: var(--color-text-muted);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 760px) {
  .lookup {
    flex-direction: column;
    align-items: stretch;
    margin-top: -28px;
  }

  .result-meta {
    grid-template-columns: 1fr;
  }

  .tips {
    grid-template-columns: 1fr;
  }
}
</style>
