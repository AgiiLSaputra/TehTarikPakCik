<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
  block: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

defineEmits(['click'])
</script>

<template>
  <button
    v-bind="$attrs"
    :type="type"
    class="btn"
    :class="[`btn-${variant}`, `btn-${size}`, { 'btn-block': block, 'is-loading': loading }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  transition: transform 0.16s var(--ease), box-shadow 0.18s ease, background 0.18s ease,
    border-color 0.18s ease, color 0.18s ease;
}

.btn:active:not(:disabled) {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-sm {
  min-height: 36px;
  padding: 0 14px;
  font-size: 0.82rem;
}

.btn-md {
  min-height: 44px;
  padding: 0 20px;
}

.btn-lg {
  min-height: 52px;
  padding: 0 26px;
  font-size: 1rem;
}

.btn-block {
  width: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: #fff;
  box-shadow: 0 10px 20px -12px rgba(92, 58, 26, 0.9);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 14px 24px -12px rgba(92, 58, 26, 0.95);
  filter: brightness(1.05);
}

.btn-accent {
  background: linear-gradient(135deg, #e39540 0%, var(--color-accent) 100%);
  color: #fff;
  box-shadow: 0 10px 20px -12px rgba(217, 131, 36, 0.95);
}

.btn-accent:hover:not(:disabled) {
  filter: brightness(1.04);
}

.btn-secondary {
  background: var(--color-surface);
  border-color: var(--color-border-strong);
  color: var(--color-primary-dark);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-surface-muted);
  border-color: var(--color-primary-soft);
}

.btn-ghost {
  background: transparent;
  color: var(--color-primary-dark);
}

.btn-ghost:hover:not(:disabled) {
  background: rgba(139, 90, 43, 0.08);
}

.btn-danger {
  background: var(--color-danger);
  color: #fff;
  box-shadow: 0 10px 20px -14px rgba(192, 57, 43, 0.9);
}

.btn-danger:hover:not(:disabled) {
  background: #a93226;
}

.btn-dark {
  background: var(--color-primary-darker);
  color: #fff;
}

.btn-dark:hover:not(:disabled) {
  background: #2c1a0a;
}

.btn-light {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.35);
  color: #fff;
  backdrop-filter: blur(6px);
}

.btn-light:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.24);
}

.spinner {
  width: 15px;
  height: 15px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  opacity: 0.85;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
