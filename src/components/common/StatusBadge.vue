<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: [String, Boolean], default: '' },
  type: { type: String, default: 'order' },
  dot: { type: Boolean, default: true }
})

const MAPS = {
  order: {
    diterima: { label: 'Diterima', tone: 'neutral' },
    diproses: { label: 'Diproses', tone: 'accent' },
    siap: { label: 'Siap', tone: 'info' },
    selesai: { label: 'Selesai', tone: 'success' },
    dibatalkan: { label: 'Dibatalkan', tone: 'danger' }
  },
  payment: {
    unpaid: { label: 'Belum dibayar', tone: 'warning' },
    paid: { label: 'Lunas', tone: 'success' }
  },
  active: {
    true: { label: 'Aktif', tone: 'success' },
    false: { label: 'Nonaktif', tone: 'neutral' }
  }
}

const meta = computed(() => {
  const map = MAPS[props.type] || MAPS.order
  return map[String(props.status)] || { label: String(props.status ?? '-'), tone: 'neutral' }
})
</script>

<template>
  <span class="badge" :class="`tone-${meta.tone}`">
    <span v-if="dot" class="badge-dot" aria-hidden="true" />
    {{ meta.label }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.tone-neutral {
  background: #f0e9de;
  color: #6d5b47;
}

.tone-success {
  background: var(--color-success-soft);
  color: #1e6b41;
}

.tone-warning {
  background: var(--color-warning-soft);
  color: #8f6400;
}

.tone-accent {
  background: #fcecd8;
  color: #a05f14;
}

.tone-info {
  background: var(--color-info-soft);
  color: #235e88;
}

.tone-danger {
  background: var(--color-danger-soft);
  color: #9c2d22;
}
</style>
