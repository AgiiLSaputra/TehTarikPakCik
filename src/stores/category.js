import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/services/api'

export const useCategoryStore = defineStore('category', () => {
  const items = ref([])
  const loaded = ref(false)

  const byId = computed(() => {
    const map = {}
    items.value.forEach((category) => {
      map[category.id] = category
    })
    return map
  })

  const options = computed(() =>
    items.value.map((category) => ({ value: category.id, label: category.name }))
  )

  function nameOf(id) {
    return byId.value[id]?.name ?? 'Tanpa kategori'
  }

  async function load(force = false) {
    if (loaded.value && !force) return items.value
    const result = await api.getCategories()
    if (result.success) {
      items.value = result.data
      loaded.value = true
    }
    return items.value
  }

  return { items, loaded, byId, options, nameOf, load }
})
