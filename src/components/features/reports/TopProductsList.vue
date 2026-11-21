<script setup>
import { computed } from 'vue'
import { formatNumber, formatRupiah } from '@/utils/format'
import BaseIcon from '@/components/common/BaseIcon.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const props = defineProps({
  items: { type: Array, default: () => [] }
})

const maxQty = computed(() => Math.max(...props.items.map((item) => item.qty), 1))
</script>

<template>
  <div v-if="items.length" class="top-products">
    <div v-for="(item, index) in items" :key="item.product_id || item.name" class="row">
      <span class="rank" :class="`rank-${index + 1}`">{{ index + 1 }}</span>
      <div class="info">
        <div class="line">
          <strong>{{ item.name }}</strong>
          <span class="qty">{{ formatNumber(item.qty) }} pcs</span>
        </div>
        <div class="bar">
          <span :style="{ width: `${Math.max((item.qty / maxQty) * 100, 6)}%` }" />
        </div>
        <span v-if="item.revenue" class="revenue">{{ formatRupiah(item.revenue) }}</span>
      </div>
    </div>
  </div>

  <EmptyState
    v-else
    icon="star"
    title="Belum ada menu terlaris"
    description="Data akan muncul setelah ada transaksi yang lunas."
  />

  <p v-if="items.length" class="foot-note">
    <BaseIcon name="info" :size="14" />
    Dihitung dari seluruh transaksi lunas yang tidak dibatalkan.
  </p>
</template>

<style scoped>
.top-products {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.rank {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  flex: none;
  margin-top: 2px;
  border-radius: 8px;
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 700;
}

.rank-1 {
  background: linear-gradient(140deg, #f6d9a5, #e5b45f);
  color: #5c3a1a;
}

.rank-2 {
  background: #ece7df;
  color: #6b5b4a;
}

.rank-3 {
  background: #f3dfcd;
  color: #8a5b34;
}

.info {
  flex: 1;
  min-width: 0;
}

.line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.line strong {
  font-size: 0.86rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qty {
  flex: none;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--color-primary);
}

.bar {
  height: 6px;
  border-radius: var(--radius-pill);
  background: var(--color-surface-muted);
  overflow: hidden;
}

.bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--color-accent), var(--color-primary));
  transition: width 0.6s var(--ease);
}

.revenue {
  display: inline-block;
  margin-top: 4px;
  font-size: 0.7rem;
  color: var(--color-text-light);
}

.foot-note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 18px;
  padding-top: 12px;
  border-top: 1px dashed var(--color-border);
  font-size: 0.7rem;
  color: var(--color-text-light);
}
</style>
