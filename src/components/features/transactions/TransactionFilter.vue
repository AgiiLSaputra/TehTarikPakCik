<script setup>
import { daysAgoInput, todayInput } from '@/utils/format'
import BaseIcon from '@/components/common/BaseIcon.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ q: '', date_from: '', date_to: '', payment_status: '', order_status: '' })
  }
})

const emit = defineEmits(['update:modelValue'])

const PAYMENT_OPTIONS = [
  { value: '', label: 'Semua pembayaran' },
  { value: 'unpaid', label: 'Belum dibayar' },
  { value: 'paid', label: 'Lunas' }
]

const STATUS_OPTIONS = [
  { value: '', label: 'Semua status' },
  { value: 'diterima', label: 'Diterima' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'siap', label: 'Siap' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'dibatalkan', label: 'Dibatalkan' }
]

function update(patch) {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}

function preset(from, to) {
  update({ date_from: from, date_to: to })
}

function reset() {
  emit('update:modelValue', {
    q: '',
    date_from: '',
    date_to: '',
    payment_status: '',
    order_status: ''
  })
}

const hasFilter = () =>
  Boolean(
    props.modelValue.q ||
      props.modelValue.date_from ||
      props.modelValue.date_to ||
      props.modelValue.payment_status ||
      props.modelValue.order_status
  )
</script>

<template>
  <div class="filter-card card">
    <div class="filter-top">
      <label class="search-field">
        <BaseIcon name="search" :size="17" class="search-icon" />
        <input
          :value="modelValue.q"
          type="search"
          class="form-control"
          placeholder="Cari kode pesanan atau nama pelanggan..."
          @input="update({ q: $event.target.value })"
        />
      </label>

      <div class="presets">
        <button
          type="button"
          class="preset"
          @click="preset(todayInput(), todayInput())"
        >
          Hari ini
        </button>
        <button type="button" class="preset" @click="preset(daysAgoInput(6), todayInput())">
          7 hari
        </button>
        <button type="button" class="preset" @click="preset('', '')">Semua</button>
        <button v-if="hasFilter()" type="button" class="preset preset-reset" @click="reset">
          Reset
        </button>
      </div>
    </div>

    <div class="filter-grid">
      <label class="filter-field">
        <span>Dari tanggal</span>
        <input
          :value="modelValue.date_from"
          type="date"
          class="form-control"
          @input="update({ date_from: $event.target.value })"
        />
      </label>
      <label class="filter-field">
        <span>Sampai tanggal</span>
        <input
          :value="modelValue.date_to"
          type="date"
          class="form-control"
          @input="update({ date_to: $event.target.value })"
        />
      </label>
      <label class="filter-field">
        <span>Pembayaran</span>
        <select
          :value="modelValue.payment_status"
          class="form-control"
          @change="update({ payment_status: $event.target.value })"
        >
          <option v-for="option in PAYMENT_OPTIONS" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
      <label class="filter-field">
        <span>Status pesanan</span>
        <select
          :value="modelValue.order_status"
          class="form-control"
          @change="update({ order_status: $event.target.value })"
        >
          <option v-for="option in STATUS_OPTIONS" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </div>
  </div>
</template>

<style scoped>
.filter-card {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.filter-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.search-field {
  position: relative;
  flex: 1;
  min-width: 240px;
}

.search-icon {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-light);
  pointer-events: none;
}

.search-field .form-control {
  padding-left: 40px;
  min-height: 42px;
  font-size: 0.88rem;
}

.presets {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.preset {
  padding: 8px 13px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  font-size: 0.76rem;
  font-weight: 500;
  color: var(--color-text-muted);
  transition: all 0.16s ease;
}

.preset:hover {
  border-color: var(--color-primary-soft);
  background: var(--color-surface-muted);
  color: var(--color-primary-dark);
}

.preset-reset {
  color: var(--color-danger);
  border-color: rgba(192, 57, 43, 0.28);
}

.preset-reset:hover {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-field span {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-text-light);
}

.filter-field .form-control {
  min-height: 40px;
  font-size: 0.84rem;
}

@media (max-width: 900px) {
  .filter-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
