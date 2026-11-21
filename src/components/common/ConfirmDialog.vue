<script setup>
import BaseButton from './BaseButton.vue'
import BaseIcon from './BaseIcon.vue'
import BaseModal from './BaseModal.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Konfirmasi' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Ya, lanjutkan' },
  cancelText: { type: String, default: 'Batal' },
  tone: { type: String, default: 'danger' },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

function cancel() {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    size="sm"
    :title="title"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="confirm-body">
      <span class="confirm-icon" :class="`tone-${tone}`">
        <BaseIcon :name="tone === 'danger' ? 'alert' : 'info'" :size="22" />
      </span>
      <p class="confirm-message">{{ message }}</p>
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="sm" :disabled="loading" @click="cancel">
        {{ cancelText }}
      </BaseButton>
      <BaseButton
        :variant="tone === 'danger' ? 'danger' : 'primary'"
        size="sm"
        :loading="loading"
        @click="emit('confirm')"
      >
        {{ confirmText }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.confirm-body {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 6px 0 10px;
}

.confirm-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: none;
  border-radius: 50%;
}

.tone-danger {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.tone-primary {
  background: var(--color-secondary);
  color: var(--color-primary-dark);
}

.confirm-message {
  color: var(--color-text-muted);
  font-size: 0.92rem;
  line-height: 1.6;
  padding-top: 3px;
}
</style>
