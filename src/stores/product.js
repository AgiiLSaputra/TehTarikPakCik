import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/services/api'

export const useProductStore = defineStore('product', () => {
  const items = ref([])
  const loaded = ref(false)
  const loading = ref(false)
  const filter = reactive({ categoryId: '', q: '' })

  const activeProducts = computed(() => items.value.filter((product) => product.is_active))

  const filtered = computed(() => {
    const needle = filter.q.trim().toLowerCase()
    return activeProducts.value.filter((product) => {
      const matchCategory = !filter.categoryId || product.category_id === filter.categoryId
      const matchQuery =
        !needle ||
        product.name.toLowerCase().includes(needle) ||
        String(product.description || '').toLowerCase().includes(needle)
      return matchCategory && matchQuery
    })
  })

  const byId = computed(() => {
    const map = {}
    items.value.forEach((product) => {
      map[product.id] = product
    })
    return map
  })

  const featured = computed(() => activeProducts.value.filter((product) => product.is_featured))

  function setFilter(patch) {
    Object.assign(filter, patch)
  }

  function resetFilter() {
    filter.categoryId = ''
    filter.q = ''
  }

  async function load(force = false) {
    if (loaded.value && !force) return items.value
    loading.value = true
    try {
      const result = await api.getProducts()
      if (result.success) {
        items.value = result.data
        loaded.value = true
      }
      return items.value
    } finally {
      loading.value = false
    }
  }

  async function add(payload) {
    const result = await api.createProduct(payload)
    if (result.success) items.value.push(result.data)
    return result
  }

  async function update(id, payload) {
    const result = await api.updateProduct(id, payload)
    if (result.success) {
      const index = items.value.findIndex((product) => product.id === id)
      if (index !== -1) items.value[index] = result.data
    }
    return result
  }

  async function remove(id) {
    const result = await api.deleteProduct(id)
    if (result.success) {
      const index = items.value.findIndex((product) => product.id === id)
      if (index === -1) return result
      if (result.data.deleted) items.value.splice(index, 1)
      else items.value[index] = { ...items.value[index], is_active: false }
    }
    return result
  }

  return {
    items,
    loaded,
    loading,
    filter,
    activeProducts,
    filtered,
    byId,
    featured,
    setFilter,
    resetFilter,
    load,
    add,
    update,
    remove
  }
})
