<script setup>
import { computed } from 'vue'
import { formatDate, formatRupiah } from '@/utils/format'
import { useCategoryStore } from '@/stores/category'
import { getProductImage } from '@/data/images'
import BaseIcon from '@/components/common/BaseIcon.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const props = defineProps({
  products: { type: Array, default: () => [] }
})

const emit = defineEmits(['edit', 'delete'])

const categoryStore = useCategoryStore()
const images = computed(() =>
  Object.fromEntries(props.products.map((product) => [product.id, getProductImage(product)]))
)
</script>

<template>
  <div v-if="products.length" class="table-wrap">
    <table class="table product-table">
      <thead>
        <tr>
          <th>Produk</th>
          <th>Kategori</th>
          <th class="num">Harga</th>
          <th>Status</th>
          <th>Dibuat</th>
          <th class="actions-head">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>
            <div class="product-cell">
              <span class="thumb" :class="`tone-${product.tone || 'caramel'}`">
                <img v-if="images[product.id]" :src="images[product.id]" :alt="product.name" />
                <template v-else>{{ product.emoji || '🍽️' }}</template>
              </span>
              <div class="product-meta">
                <strong>{{ product.name }}</strong>
                <small>{{ product.description || 'Tanpa deskripsi' }}</small>
              </div>
            </div>
          </td>
          <td>{{ categoryStore.nameOf(product.category_id) }}</td>
          <td class="num strong">{{ formatRupiah(product.price) }}</td>
          <td><StatusBadge :status="product.is_active" type="active" /></td>
          <td class="muted small">{{ formatDate(product.created_at) }}</td>
          <td>
            <div class="row-actions">
              <button type="button" class="icon-action" title="Ubah produk" @click="emit('edit', product)">
                <BaseIcon name="edit" :size="16" />
              </button>
              <button
                type="button"
                class="icon-action is-danger"
                title="Hapus produk"
                @click="emit('delete', product)"
              >
                <BaseIcon name="trash" :size="16" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <EmptyState
    v-else
    icon="box"
    title="Belum ada produk"
    description="Tambahkan produk pertama atau ubah kata kunci pencarian Anda."
  />
</template>

<style scoped>
.product-table {
  min-width: 780px;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
}

.thumb {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: none;
  border-radius: 10px;
  overflow: hidden;
  font-size: 20px;
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

.product-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 300px;
}

.product-meta strong {
  font-size: 0.9rem;
  font-weight: 600;
}

.product-meta small {
  font-size: 0.76rem;
  color: var(--color-text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actions-head {
  text-align: right;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.icon-action {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text-muted);
  transition: all 0.16s ease;
}

.icon-action:hover {
  border-color: var(--color-primary-soft);
  background: var(--color-surface-muted);
  color: var(--color-primary-dark);
}

.icon-action.is-danger:hover {
  border-color: rgba(192, 57, 43, 0.35);
  background: var(--color-danger-soft);
  color: var(--color-danger);
}
</style>
