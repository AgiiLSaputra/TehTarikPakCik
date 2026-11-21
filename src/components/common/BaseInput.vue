<script setup>
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' }
})

defineEmits(['update:modelValue', 'blur', 'enter'])

const inputId = props.id || `input-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <label class="field" :for="inputId">
    <span v-if="label" class="field-label">
      {{ label }}
      <em v-if="required" aria-hidden="true">*</em>
    </span>
    <span class="field-wrap">
      <slot name="icon" />
      <input
        :id="inputId"
        class="form-control"
        :class="{ 'has-error': error, 'with-icon': $slots.icon, 'with-trailing': $slots.trailing }"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :aria-invalid="Boolean(error)"
        v-bind="$attrs"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @keyup.enter="$emit('enter', $event)"
      />
      <slot name="trailing" />
    </span>
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
  letter-spacing: 0.01em;
}

.field-label em {
  color: var(--color-danger);
  font-style: normal;
}

.field-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-wrap :deep(.field-icon) {
  position: absolute;
  left: 14px;
  color: var(--color-text-light);
  pointer-events: none;
}

.field-wrap :deep(.form-control.with-icon) {
  padding-left: 42px;
}

.field-wrap :deep(.form-control.with-trailing) {
  padding-right: 46px;
}

.field-wrap :deep(.field-trailing) {
  position: absolute;
  right: 8px;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-light);
}

.field-wrap :deep(.field-trailing:hover) {
  background: var(--color-surface-muted);
  color: var(--color-primary-dark);
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
