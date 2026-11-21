<script setup>
import { computed } from 'vue'
import { formatRupiah } from '@/utils/format'
import { getProductImage } from '@/data/images'
import BaseIcon from '@/components/common/BaseIcon.vue'
import { QTY_MAX } from '@/utils/validators'

const props = defineProps({
  item: { type: Object, required: true }
})

const emit = defineEmits(['increase', 'decrease', 'remove'])

const image = computed(() => getProductImage(props.item))
const subtotal = computed(() => props.item.price * props.item.qty)
</script>

<template>
  <div class="cart-item">
    <span class="thumb" :class="`tone-${item.tone || 'caramel'}`">
      <img v-if="image" :src="image" :alt="item.name" />
      <template v-else>{{ item.emoji || '🍽️' }}</template>
    </span>

    <div class="info">
      <strong class="name">{{ item.name }}</strong>
      <span class="unit">{{ formatRupiah(item.price) }}</span>
      <div class="qty">
        <button
          type="button"
          class="qty-btn"
          aria-label="Kurangi jumlah"
          :disabled="item.qty <= 1"
          @click="emit('decrease', item.product_id)"
        >
          <BaseIcon name="minus" :size="14" />
        </button>
        <span class="qty-value">{{ item.qty }}</span>
        <button
          type="button"
          class="qty-btn"
          aria-label="Tambah jumlah"
          :disabled="item.qty >= QTY_MAX"
          @click="emit('increase', item.product_id)"
        >
          <BaseIcon name="plus" :size="14" />
        </button>
        <span v-if="item.qty >= QTY_MAX" class="qty-max">maks</span>
      </div>
    </div>

    <div class="right">
      <span class="subtotal">{{ formatRupiah(subtotal) }}</span>
      <button type="button" class="remove" aria-label="Hapus item" @click="emit('remove', item.product_id)">
        <BaseIcon name="trash" :size="15" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.cart-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px dashed var(--color-border);
}

.cart-item:last-child {
  border-bottom: none;
}

.thumb {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 10px;
  overflow: hidden;
  font-size: 22px;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tone-caramel {
  background: linear-gradient(140deg, #f9e7c9, #e2b782);
}
.tone-choco {
  background: linear-gradient(140deg, #eed9c0, #bb8b5f);
}
.tone-cream {
  background: linear-gradient(140deg, #fdf4e3, #ecd2a8);
}
.tone-sunset {
  background: linear-gradient(140deg, #fcdcc0, #e79a63);
}
.tone-mint {
  background: linear-gradient(140deg, #e4f0dc, #a8c793);
}
.tone-berry {
  background: linear-gradient(140deg, #f6dcda, #cf8d88);
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name {
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.35;
}

.unit {
  font-size: 0.75rem;
  color: var(--color-text-light);
}

.qty {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.qty-btn {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 1px solid var(--color-border-strong);
  border-radius: 7px;
  background: var(--color-surface);
  color: var(--color-primary-dark);
  transition: all 0.16s ease;
}

.qty-btn:hover:not(:disabled) {
  background: var(--color-surface-muted);
  border-color: var(--color-primary-soft);
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-value {
  min-width: 22px;
  text-align: center;
  font-size: 0.86rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.qty-max {
  font-size: 0.66rem;
  color: var(--color-warning);
}

.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.subtotal {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-primary-dark);
  font-variant-numeric: tabular-nums;
}

.remove {
  border: none;
  background: transparent;
  padding: 3px;
  border-radius: 5px;
  color: var(--color-text-light);
}

.remove:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}
</style>
