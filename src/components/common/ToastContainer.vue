<script setup>
import BaseIcon from './BaseIcon.vue'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()

const ICONS = {
  success: 'check-circle',
  error: 'alert',
  info: 'info'
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" role="status" aria-live="polite">
      <TransitionGroup name="toast">
        <div v-for="toast in ui.toasts" :key="toast.id" class="toast" :class="`toast-${toast.type}`">
          <BaseIcon :name="ICONS[toast.type] || 'info'" :size="18" />
          <span class="toast-message">{{ toast.message }}</span>
          <button type="button" class="toast-close" aria-label="Tutup notifikasi" @click="ui.dismiss(toast.id)">
            <BaseIcon name="x" :size="15" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  z-index: 220;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(360px, calc(100vw - 32px));
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px 14px;
  border-radius: var(--radius);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-info);
  box-shadow: var(--shadow-md);
  pointer-events: auto;
  font-size: 0.86rem;
  line-height: 1.45;
  animation: pop 0.25s var(--ease);
}

.toast-success {
  border-left-color: var(--color-success);
  color: #1c5c3a;
}

.toast-error {
  border-left-color: var(--color-danger);
  color: #8e2a1f;
}

.toast-info {
  border-left-color: var(--color-info);
  color: #245a80;
}

.toast-message {
  flex: 1;
  color: var(--color-text);
}

.toast-close {
  border: none;
  background: transparent;
  color: var(--color-text-light);
  display: grid;
  place-items: center;
  padding: 2px;
  border-radius: 4px;
}

.toast-close:hover {
  color: var(--color-text);
  background: var(--color-surface-muted);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s var(--ease);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
</style>
