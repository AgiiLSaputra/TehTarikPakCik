<script setup>
import BaseIcon from './BaseIcon.vue'

defineProps({
  title: { type: String, default: 'Belum ada data' },
  description: { type: String, default: '' },
  icon: { type: String, default: 'info' }
})
</script>

<template>
  <div class="empty">
    <span class="empty-icon">
      <BaseIcon :name="icon" :size="26" />
    </span>
    <h3 class="empty-title">{{ title }}</h3>
    <p v-if="description" class="empty-desc">{{ description }}</p>
    <div v-if="$slots.default" class="empty-action">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 48px 24px;
}

.empty-icon {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  margin-bottom: 4px;
  border-radius: 50%;
  background: var(--color-secondary);
  color: var(--color-primary-dark);
}

.empty-title {
  font-size: 1rem;
  font-weight: 600;
}

.empty-desc {
  max-width: 38ch;
  font-size: 0.88rem;
  color: var(--color-text-muted);
}

.empty-action {
  margin-top: 12px;
}
</style>
