<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  categories: { type: Array, default: () => [] },
  counts: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

const totalCount = computed(() =>
  Object.values(props.counts).reduce((sum, value) => sum + Number(value || 0), 0)
)

function select(id) {
  emit('update:modelValue', id)
}
</script>

<template>
  <div class="category-filter" role="group" aria-label="Filter kategori">
    <button
      type="button"
      class="chip"
      :class="{ 'is-active': modelValue === '' }"
      @click="select('')"
    >
      Semua
      <span v-if="Object.keys(counts).length" class="count">{{ totalCount }}</span>
    </button>

    <button
      v-for="category in categories"
      :key="category.id"
      type="button"
      class="chip"
      :class="{ 'is-active': modelValue === category.id }"
      @click="select(category.id)"
    >
      {{ category.name }}
      <span v-if="Object.keys(counts).length" class="count">{{ counts[category.id] || 0 }}</span>
    </button>
  </div>
</template>

<style scoped>
.category-filter {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
}

.count {
  display: inline-grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  padding-inline: 5px;
  border-radius: var(--radius-pill);
  background: rgba(139, 90, 43, 0.1);
  font-size: 0.68rem;
  font-weight: 600;
}

.chip.is-active .count {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}
</style>
