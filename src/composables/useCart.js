import { computed } from 'vue'
import { useTransactionStore } from '@/stores/transaction'
import { QTY_MAX } from '@/utils/validators'

/**
 * Logika keranjang untuk halaman kasir (dipakai CashierView & CartPanel).
 */
export function useCart() {
  const store = useTransactionStore()

  const cart = computed(() => store.cart)
  const total = computed(() => store.cartTotal)
  const count = computed(() => store.cartCount)
  const isEmpty = computed(() => store.cartIsEmpty)

  return {
    cart,
    total,
    count,
    isEmpty,
    maxQty: QTY_MAX,
    add: store.addToCart,
    increase: (id) => store.changeQty(id, 1),
    decrease: (id) => store.changeQty(id, -1),
    remove: store.removeFromCart,
    clear: store.clearCart
  }
}
