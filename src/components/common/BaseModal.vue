<script setup>
import { onBeforeUnmount, onMounted, watch } from 'vue'
import BaseIcon from './BaseIcon.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  size: { type: String, default: 'md' },
  closable: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'close'])

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function onKeydown(event) {
  if (event.key === 'Escape' && props.modelValue) close()
}

watch(
  () => props.modelValue,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  }
)

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-root" role="dialog" aria-modal="true" @mousedown.self="close">
        <div class="modal-card" :class="`size-${size}`">
          <header v-if="title || $slots.header" class="modal-head">
            <slot name="header">
              <div>
                <h2 class="modal-title">{{ title }}</h2>
                <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
              </div>
            </slot>
            <button v-if="closable" type="button" class="modal-close" aria-label="Tutup" @click="close">
              <BaseIcon name="x" :size="19" />
            </button>
          </header>
          <div class="modal-body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="modal-foot">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-root {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(43, 27, 14, 0.5);
  backdrop-filter: blur(3px);
  overflow-y: auto;
}

.modal-card {
  width: 100%;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.size-sm {
  max-width: 420px;
}

.size-md {
  max-width: 560px;
}

.size-lg {
  max-width: 760px;
}

.size-xl {
  max-width: 920px;
}

.modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 14px;
}

.modal-title {
  font-size: 1.15rem;
}

.modal-subtitle {
  margin-top: 4px;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.modal-close {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
  transition: background 0.18s ease, color 0.18s ease;
}

.modal-close:hover {
  background: var(--color-secondary);
  color: var(--color-primary-dark);
}

.modal-body {
  padding: 8px 24px 24px;
  overflow-y: auto;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-muted);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.22s ease;
}

.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform 0.26s var(--ease), opacity 0.22s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  transform: translateY(16px) scale(0.97);
  opacity: 0;
}

@media (max-width: 560px) {
  .modal-root {
    padding: 12px;
    align-items: flex-end;
  }

  .modal-card {
    max-height: calc(100vh - 24px);
    border-radius: var(--radius-lg);
  }

  .modal-body {
    padding-inline: 18px;
  }

  .modal-head {
    padding-inline: 18px;
  }

  .modal-foot {
    padding-inline: 18px;
  }
}
</style>
