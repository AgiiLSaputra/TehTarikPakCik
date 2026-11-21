<script setup>
import { computed } from 'vue'
import { formatRupiah } from '@/utils/format'
import { getProductImage } from '@/data/images'
import { useCategoryStore } from '@/stores/category'
import BaseIcon from '@/components/common/BaseIcon.vue'

const props = defineProps({
  product: { type: Object, required: true },
  showAdd: { type: Boolean, default: false },
  compact: { type: Boolean, default: false }
})

const emit = defineEmits(['add'])

const categoryStore = useCategoryStore()
const image = computed(() => getProductImage(props.product))
const categoryName = computed(() => categoryStore.nameOf(props.product.category_id))
</script>

<template>
  <article class="product-card" :class="{ compact, 'is-inactive': !product.is_active }">
    <div class="media" :class="`tone-${product.tone || 'caramel'}`">
      <img v-if="image" :src="image" :alt="product.name" loading="lazy" />
      <span v-else class="emoji" aria-hidden="true">{{ product.emoji || '🍽️' }}</span>

      <span v-if="product.is_featured" class="flag">
        <BaseIcon name="star" :size="12" />
        Favorit
      </span>
      <span v-if="!product.is_active" class="flag flag-off">Nonaktif</span>
    </div>

    <div class="body">
      <span class="category">{{ categoryName }}</span>
      <h3 class="name">{{ product.name }}</h3>
      <p v-if="!compact" class="desc">{{ product.description }}</p>
      <div class="foot">
        <span class="price">{{ formatRupiah(product.price) }}</span>
        <button
          v-if="showAdd && product.is_active"
          type="button"
          class="add-btn"
          :aria-label="`Tambahkan ${product.name} ke keranjang`"
          @click="emit('add', product)"
        >
          <BaseIcon name="plus" :size="18" />
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform 0.24s var(--ease), box-shadow 0.24s ease, border-color 0.24s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-strong);
}

.product-card.is-inactive {
  opacity: 0.72;
}

.media {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s var(--ease);
}

.product-card:hover .media img {
  transform: scale(1.045);
}

.media::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.45) 1px, transparent 1px);
  background-size: 14px 14px;
  opacity: 0.35;
  pointer-events: none;
  mix-blend-mode: soft-light;
}

.emoji {
  font-size: 66px;
  line-height: 1;
  filter: drop-shadow(0 10px 14px rgba(92, 58, 26, 0.24));
  transform: translateY(-2px);
}

.tone-caramel {
  background: linear-gradient(140deg, #f9e7c9 0%, #e2b782 100%);
}

.tone-choco {
  background: linear-gradient(140deg, #eed9c0 0%, #bb8b5f 100%);
}

.tone-cream {
  background: linear-gradient(140deg, #fdf4e3 0%, #ecd2a8 100%);
}

.tone-sunset {
  background: linear-gradient(140deg, #fcdcc0 0%, #e79a63 100%);
}

.tone-mint {
  background: linear-gradient(140deg, #e4f0dc 0%, #a8c793 100%);
}

.tone-berry {
  background: linear-gradient(140deg, #f6dcda 0%, #cf8d88 100%);
}

.flag {
  position: absolute;
  top: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: var(--radius-pill);
  background: rgba(43, 27, 14, 0.78);
  color: #ffe9c4;
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  backdrop-filter: blur(4px);
}

.flag-off {
  left: auto;
  right: 12px;
  background: rgba(192, 57, 43, 0.9);
  color: #fff;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 18px 18px;
  flex: 1;
}

.category {
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.name {
  font-size: 1.02rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.83rem;
  line-height: 1.55;
  color: var(--color-text-muted);
  min-height: 2.6em;
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  padding-top: 10px;
}

.price {
  font-family: var(--font-display);
  font-size: 1.06rem;
  font-weight: 700;
  color: var(--color-primary-dark);
}

.add-btn {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: var(--color-primary-dark);
  color: #fff;
  box-shadow: 0 8px 16px -10px rgba(92, 58, 26, 0.9);
  transition: background 0.18s ease, transform 0.18s var(--ease);
}

.add-btn:hover {
  background: var(--color-accent);
  transform: scale(1.06);
}

.add-btn:active {
  transform: scale(0.96);
}

/* Varian ringkas untuk halaman kasir */
.compact .media {
  aspect-ratio: 16 / 9;
}

.compact .emoji {
  font-size: 42px;
}

.compact .media img {
  height: 100%;
}

.compact .body {
  padding: 12px 14px 14px;
  gap: 4px;
}

.compact .name {
  font-size: 0.9rem;
  line-height: 1.3;
}

.compact .price {
  font-size: 0.94rem;
}

.compact .add-btn {
  width: 32px;
  height: 32px;
}

.compact .flag {
  top: 8px;
  left: 8px;
  font-size: 0.6rem;
  padding: 3px 7px;
}
</style>
