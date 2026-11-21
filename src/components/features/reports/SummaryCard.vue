<script setup>
import BaseIcon from '@/components/common/BaseIcon.vue'

defineProps({
  title: { type: String, required: true },
  value: { type: String, default: '-' },
  icon: { type: String, default: 'chart' },
  caption: { type: String, default: '' },
  tone: { type: String, default: 'cream' }
})
</script>

<template>
  <article class="summary-card" :class="`tone-${tone}`">
    <div class="top">
      <span class="icon"><BaseIcon :name="icon" :size="20" /></span>
      <span class="title">{{ title }}</span>
    </div>
    <strong class="value">{{ value }}</strong>
    <span v-if="caption" class="caption">{{ caption }}</span>
  </article>
</template>

<style scoped>
.summary-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 20px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.summary-card::after {
  content: '';
  position: absolute;
  right: -32px;
  bottom: -42px;
  width: 128px;
  height: 128px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  pointer-events: none;
}

.top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.75);
  color: var(--color-primary-dark);
}

.title {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--color-text-muted);
}

.value {
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 1rem + 0.8vw, 1.6rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-primary-darker);
  font-variant-numeric: tabular-nums;
}

.caption {
  font-size: 0.74rem;
  color: var(--color-text-muted);
}

.tone-cream {
  background: linear-gradient(150deg, #fffaf1 0%, #f7e8d1 100%);
}

.tone-accent {
  background: linear-gradient(150deg, #fdeed9 0%, #f6cf9d 100%);
}

.tone-green {
  background: linear-gradient(150deg, #f1f9f3 0%, #d7ecdd 100%);
}

.tone-dark {
  background: linear-gradient(150deg, #4a2c14 0%, #2c1909 100%);
  border-color: transparent;
  color: #f7ead6;
}

.tone-dark .title,
.tone-dark .caption {
  color: rgba(247, 234, 214, 0.65);
}

.tone-dark .value {
  color: #ffe3b8;
}

.tone-dark .icon {
  background: rgba(255, 255, 255, 0.12);
  color: var(--color-accent-soft);
}
</style>
