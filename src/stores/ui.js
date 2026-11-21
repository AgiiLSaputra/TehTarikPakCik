import { ref } from 'vue'
import { defineStore } from 'pinia'

let sequence = 0

export const useUiStore = defineStore('ui', () => {
  const toasts = ref([])

  function dismiss(id) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function showToast(message, type = 'success', timeout = 3600) {
    sequence += 1
    const id = sequence
    toasts.value.push({ id, message, type })

    if (timeout > 0) {
      window.setTimeout(() => dismiss(id), timeout)
    }
    return id
  }

  const success = (message) => showToast(message, 'success')
  const error = (message) => showToast(message, 'error', 4500)
  const info = (message) => showToast(message, 'info')

  return { toasts, showToast, dismiss, success, error, info }
})
