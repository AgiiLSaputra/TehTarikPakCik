<script setup>
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: '' },
  label: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: '' }
})

defineEmits(['update:modelValue', 'change'])

const selectId = props.id || `select-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <label class="field" :for="selectId">
    <span v-if="label" class="field-label">
      {{ label }}
      <em v-if="required" aria-hidden="true">*</em>
    </span>
    <select
      :id="selectId"
      class="form-control"
      :class="{ 'has-error': error }"
      :value="modelValue"
      :disabled="disabled"
      :aria-invalid="Boolean(error)"
      v-bind="$attrs"
      @change="$emit('update:modelValue', $event.target.value); $emit('change', $event)"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <span v-if="error" class="field-error">{{ error }}</span>
    <span v-else-if="hint" class="field-hint">{{ hint }}</span>
  </label>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-primary-dark);
}

.field-label em {
  color: var(--color-danger);
  font-style: normal;
}

.field-error,
.field-hint {
  font-size: 0.76rem;
  line-height: 1.4;
}

.field-error {
  color: var(--color-danger);
}

.field-hint {
  color: var(--color-text-muted);
}
</style>
