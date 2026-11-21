<script setup>
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  rows: { type: Number, default: 3 },
  maxlength: { type: [Number, String], default: undefined },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: '' }
})

defineEmits(['update:modelValue'])

const areaId = props.id || `textarea-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <label class="field" :for="areaId">
    <span v-if="label" class="field-label">{{ label }}</span>
    <textarea
      :id="areaId"
      class="form-control"
      :class="{ 'has-error': error }"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :disabled="disabled"
      v-bind="$attrs"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <span v-if="error" class="field-error">{{ error }}</span>
    <span v-else-if="hint" class="field-hint">{{ hint }}</span>
  </label>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 600;
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
