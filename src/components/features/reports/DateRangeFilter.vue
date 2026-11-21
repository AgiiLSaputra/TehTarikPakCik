<script setup>
import { computed } from 'vue'
import { daysAgoInput, monthStartInput, todayInput } from '@/utils/format'
import BaseIcon from '@/components/common/BaseIcon.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ from: monthStartInput(), to: todayInput() })
  },
  error: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'apply'])

const dateFrom = computed({
  get: () => props.modelValue.from,
  set: (value) => emit('update:modelValue', { ...props.modelValue, from: value })
})

const dateTo = computed({
  get: () => props.modelValue.to,
  set: (value) => emit('update:modelValue', { ...props.modelValue, to: value })
})

const PRESETS = [
  { label: 'Hari ini', from: () => todayInput(), to: () => todayInput() },
  { label: '7 hari', from: () => daysAgoInput(6), to: () => todayInput() },
  { label: 'Bulan ini', from: () => monthStartInput(), to: () => todayInput() }
]

function applyPreset(preset) {
  emit('update:modelValue', { from: preset.from(), to: preset.to() })
  emit('apply')
}
</script>

<template>
  <div class="date-filter">
    <div class="fields">
      <label class="date-field">
        <span>Dari tanggal</span>
        <input v-model="dateFrom" type="date" class="form-control" />
      </label>
      <span class="dash">—</span>
      <label class="date-field">
        <span>Sampai tanggal</span>
        <input v-model="dateTo" type="date" class="form-control" />
      </label>
    </div>

    <div class="presets">
      <BaseIcon name="filter" :size="15" class="preset-icon" />
      <button
        v-for="preset in PRESETS"
        :key="preset.label"
        type="button"
        class="preset"
        @click="applyPreset(preset)"
      >
        {{ preset.label }}
      </button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style scoped>
.date-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.fields {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.date-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-field span {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.date-field .form-control {
  width: 168px;
  min-height: 42px;
  font-size: 0.85rem;
}

.dash {
  padding-bottom: 12px;
  color: var(--color-text-light);
}

.presets {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.preset-icon {
  color: var(--color-text-light);
  margin-right: 2px;
}

.preset {
  padding: 8px 13px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--color-text-muted);
  transition: all 0.16s ease;
}

.preset:hover {
  border-color: var(--color-primary-soft);
  background: var(--color-surface-muted);
  color: var(--color-primary-dark);
}

.error {
  flex-basis: 100%;
  font-size: 0.78rem;
  color: var(--color-danger);
}

@media (max-width: 560px) {
  .date-field .form-control {
    width: 100%;
  }

  .date-field {
    flex: 1;
    min-width: 130px;
  }
}
</style>
