<script setup>
import { computed } from 'vue'
import BaseIcon from '@/components/common/BaseIcon.vue'

const props = defineProps({
  currentStatus: { type: String, default: 'diterima' }
})

const STEPS = [
  { key: 'diterima', label: 'Diterima', hint: 'Pesanan dicatat kasir' },
  { key: 'diproses', label: 'Diproses', hint: 'Sedang dimasak' },
  { key: 'siap', label: 'Siap', hint: 'Siap diambil' },
  { key: 'selesai', label: 'Selesai', hint: 'Sudah diterima' }
]

const cancelled = computed(() => props.currentStatus === 'dibatalkan')
const activeIndex = computed(() => STEPS.findIndex((step) => step.key === props.currentStatus))

function stateOf(index) {
  if (activeIndex.value < 0) return 'pending'
  if (index < activeIndex.value) return 'done'
  if (index === activeIndex.value) return 'current'
  return 'pending'
}
</script>

<template>
  <div class="stepper-wrap">
    <div v-if="cancelled" class="cancelled">
      <BaseIcon name="ban" :size="18" />
      <div>
        <strong>Pesanan dibatalkan</strong>
        <p>Pesanan ini tidak diproses. Silakan hubungi kasir bila ada pertanyaan.</p>
      </div>
    </div>

    <ol v-else class="stepper">
      <li v-for="(step, index) in STEPS" :key="step.key" class="step" :class="`is-${stateOf(index)}`">
        <span class="dot">
          <BaseIcon v-if="stateOf(index) === 'done'" name="check" :size="14" />
          <template v-else>{{ index + 1 }}</template>
        </span>
        <div class="label">
          <strong>{{ step.label }}</strong>
          <small>{{ step.hint }}</small>
        </div>
        <span v-if="index < STEPS.length - 1" class="line" aria-hidden="true" />
      </li>
    </ol>
  </div>
</template>

<style scoped>
.stepper-wrap {
  width: 100%;
}

.stepper {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.step {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding-top: 2px;
}

.dot {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid var(--color-border-strong);
  background: var(--color-surface);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text-light);
  transition: all 0.2s ease;
}

.label strong {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-light);
}

.label small {
  display: block;
  font-size: 0.64rem;
  color: var(--color-text-light);
  opacity: 0.8;
}

.line {
  position: absolute;
  z-index: 1;
  top: 18px;
  left: calc(50% + 22px);
  width: calc(100% - 44px);
  height: 2px;
  background: var(--color-border);
}

.step.is-done .dot {
  background: var(--color-success);
  border-color: var(--color-success);
  color: #fff;
}

.step.is-done .label strong {
  color: var(--color-success);
}

.step.is-done .line {
  background: var(--color-success);
}

.step.is-current .dot {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  color: #fff;
  box-shadow: 0 0 0 5px rgba(139, 90, 43, 0.14);
}

.step.is-current .label strong {
  color: var(--color-primary-dark);
}

.step.is-current .line {
  background: linear-gradient(90deg, var(--color-primary-dark), var(--color-border));
}

.cancelled {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius);
  background: var(--color-danger-soft);
  color: #8e2a1f;
}

.cancelled strong {
  display: block;
  font-size: 0.88rem;
}

.cancelled p {
  margin-top: 2px;
  font-size: 0.78rem;
  color: #a04a3f;
}

@media (max-width: 560px) {
  .label small {
    display: none;
  }

  .dot {
    width: 30px;
    height: 30px;
    font-size: 0.72rem;
  }

  .line {
    top: 16px;
    left: calc(50% + 19px);
    width: calc(100% - 38px);
  }
}
</style>
