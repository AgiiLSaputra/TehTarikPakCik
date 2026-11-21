<script setup>
import { computed, ref } from 'vue'
import { useProductStore } from '@/stores/product'
import { useCategoryStore } from '@/stores/category'
import BaseIcon from '@/components/common/BaseIcon.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import CategoryFilter from '@/components/features/products/CategoryFilter.vue'
import ProductCard from '@/components/features/products/ProductCard.vue'

const emit = defineEmits(['add'])

const productStore = useProductStore()
const categoryStore = useCategoryStore()

const query = ref('')
const categoryId = ref('')

const counts = computed(() => {
  const map = {}
  productStore.activeProducts.forEach((product) => {
    map[product.category_id] = (map[product.category_id] || 0) + 1
  })
  return map
})

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return productStore.activeProducts.filter((product) => {
    const matchCategory = !categoryId.value || product.category_id === categoryId.value
    const matchQuery =
      !needle ||
      product.name.toLowerCase().includes(needle) ||
      String(product.description || '').toLowerCase().includes(needle)
    return matchCategory && matchQuery
  })
})

function resetFilters() {
  query.value = ''
  categoryId.value = ''
}
</script>

<template>
  <section class="picker">
    <div class="picker-head">
      <BaseInput v-model="query" placeholder="Cari menu atau minuman..." class="search-input">
        <template #icon>
          <BaseIcon name="search" :size="18" class="field-icon" />
        </template>
      </BaseInput>
      <span class="picker-count">{{ filtered.length }} menu tersedia</span>
    </div>

    <CategoryFilter v-model="categoryId" :categories="categoryStore.items" :counts="counts" />

    <div v-if="filtered.length" class="picker-grid">
      <ProductCard
        v-for="product in filtered"
        :key="product.id"
        :product="product"
        compact
        show-add
        @add="emit('add', $event)"
      />
    </div>

    <EmptyState
      v-else
      icon="search"
      title="Menu tidak ditemukan"
      description="Coba kata kunci lain atau tampilkan semua kategori."
    >
      <button type="button" class="link-reset" @click="resetFilters">Reset filter</button>
    </EmptyState>
  </section>
</template>

<style scoped>
.picker {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.picker-head {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  flex: 1;
}

.picker-count {
  flex: none;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(178px, 1fr));
  gap: 16px;
}

.link-reset {
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 700px) {
  .picker-head {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }

  .picker-grid {
    grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
    gap: 12px;
  }
}
</style>
