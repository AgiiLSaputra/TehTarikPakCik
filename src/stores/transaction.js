import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/services/api'
import { QTY_MAX } from '@/utils/validators'
import { toDateInput } from '@/utils/format'
import { useAuthStore } from './auth'

export const useTransactionStore = defineStore('transaction', () => {
  const items = ref([])
  const loaded = ref(false)
  const loading = ref(false)
  const cart = ref([])

  const cartTotal = computed(() => cart.value.reduce((sum, item) => sum + item.price * item.qty, 0))
  const cartCount = computed(() => cart.value.reduce((sum, item) => sum + item.qty, 0))
  const cartIsEmpty = computed(() => cart.value.length === 0)

  const todayList = computed(() => {
    const today = toDateInput(new Date())
    return items.value
      .filter((trx) => toDateInput(trx.created_at) === today)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  })

  const unpaidList = computed(() =>
    items.value.filter((trx) => trx.payment_status === 'unpaid' && trx.order_status !== 'dibatalkan')
  )

  function byId(id) {
    return items.value.find((trx) => trx.id === id) ?? null
  }

  function replaceItem(updated) {
    const index = items.value.findIndex((trx) => trx.id === updated.id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updated }
    }
  }

  async function load(force = false) {
    if (loaded.value && !force) return items.value
    loading.value = true
    try {
      const result = await api.getTransactions()
      if (result.success) {
        items.value = result.data
        loaded.value = true
      }
      return items.value
    } finally {
      loading.value = false
    }
  }

  function addToCart(product, qty = 1) {
    if (!product || product.is_active === false) return
    const existing = cart.value.find((item) => item.product_id === product.id)
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, QTY_MAX)
      return
    }
    cart.value.push({
      product_id: product.id,
      name: product.name,
      price: product.price,
      qty: Math.min(Math.max(qty, 1), QTY_MAX),
      emoji: product.emoji,
      tone: product.tone,
      image: product.image
    })
  }

  function changeQty(productId, delta) {
    const item = cart.value.find((row) => row.product_id === productId)
    if (!item) return
    item.qty = Math.min(Math.max(item.qty + delta, 1), QTY_MAX)
  }

  function removeFromCart(productId) {
    cart.value = cart.value.filter((item) => item.product_id !== productId)
  }

  function clearCart() {
    cart.value = []
  }

  async function create(payload) {
    const auth = useAuthStore()
    const result = await api.createTransaction({
      ...payload,
      created_by: auth.user?.id ?? null
    })

    if (result.success) {
      items.value.unshift(result.data)
      clearCart()
    }
    return result
  }

  async function pay(id, payload) {
    const result = await api.updatePayment(id, payload)
    if (result.success) replaceItem(result.data)
    return result
  }

  async function updateStatus(id, status) {
    const result = await api.updateOrderStatus(id, { order_status: status })
    if (result.success) replaceItem(result.data)
    return result
  }

  function findByCode(code) {
    return api.getOrderByCode(code)
  }

  return {
    items,
    loaded,
    loading,
    cart,
    cartTotal,
    cartCount,
    cartIsEmpty,
    todayList,
    unpaidList,
    byId,
    load,
    addToCart,
    changeQty,
    removeFromCart,
    clearCart,
    create,
    pay,
    updateStatus,
    findByCode
  }
})
