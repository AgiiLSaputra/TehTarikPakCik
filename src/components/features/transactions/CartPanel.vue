<script setup>
import { ref } from 'vue'
import { useCart } from '@/composables/useCart'
import { formatRupiah } from '@/utils/format'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseIcon from '@/components/common/BaseIcon.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import CartItem from './CartItem.vue'

const emit = defineEmits(['checkout'])

const props = defineProps({
  saving: { type: Boolean, default: false }
})

const { cart, total, count, isEmpty, increase, decrease, remove, clear } = useCart()

const customer = ref('')
const note = ref('')

function submit() {
  if (isEmpty.value) return
  emit('checkout', {
    customer_name: customer.value.trim(),
    note: note.value.trim(),
    items: cart.value.map((item) => ({
      product_id: item.product_id,
      qty: item.qty
    }))
  })
}

function reset() {
  customer.value = ''
  note.value = ''
  clear()
}

function clearCart() {
  reset()
}

defineExpose({ reset })
</script>

<template>
  <aside id="keranjang" class="cart-panel card">
    <header class="cart-head">
      <div class="cart-title">
        <span class="cart-icon"><BaseIcon name="cart" :size="19" /></span>
        <div>
          <h2>Keranjang</h2>
          <p>{{ count }} item · pesanan baru</p>
        </div>
      </div>
      <button v-if="!isEmpty" type="button" class="clear-btn" @click="clearCart">Kosongkan</button>
    </header>

    <div class="cart-body">
      <div v-if="!isEmpty" class="cart-list">
        <CartItem
          v-for="item in cart"
          :key="item.product_id"
          :item="item"
          @increase="increase"
          @decrease="decrease"
          @remove="remove"
        />
      </div>

      <EmptyState
        v-else
        icon="cart"
        title="Keranjang masih kosong"
        description="Pilih menu di sebelah kiri untuk mulai membuat pesanan."
      />
    </div>

    <div class="cart-form">
      <BaseInput v-model="customer" label="Nama pelanggan" placeholder="Opsional, contoh: Budi" maxlength="40" />
      <BaseTextarea
        v-model="note"
        label="Catatan pesanan"
        placeholder="Contoh: teh tarik kurang manis, dibungkus"
        :rows="2"
        maxlength="120"
      />
    </div>

    <footer class="cart-foot">
      <div class="total-row">
        <span>Total</span>
        <strong>{{ formatRupiah(total) }}</strong>
      </div>
      <BaseButton size="lg" block :disabled="isEmpty || saving" :loading="saving" @click="submit">
        <BaseIcon name="receipt" :size="18" />
        Simpan Pesanan
      </BaseButton>
      <p class="hint">Kode pesanan dibuat otomatis setelah pesanan disimpan.</p>
    </footer>
  </aside>
</template>

<style scoped>
.cart-panel {
  position: sticky;
  top: calc(var(--topbar-height) + 16px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-muted);
}

.cart-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: var(--color-primary-dark);
  color: var(--color-accent-soft);
}

.cart-title h2 {
  font-size: 1rem;
  font-weight: 600;
}

.cart-title p {
  font-size: 0.76rem;
  color: var(--color-text-muted);
}

.clear-btn {
  border: none;
  background: transparent;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--color-danger);
  padding: 6px 8px;
  border-radius: 6px;
}

.clear-btn:hover {
  background: var(--color-danger-soft);
}

.cart-body {
  max-height: 38vh;
  overflow-y: auto;
  padding: 4px 20px;
}

.cart-list {
  padding-block: 4px;
}

.cart-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
}

.cart-foot {
  padding: 16px 20px 20px;
  background: var(--color-surface-muted);
  border-top: 1px solid var(--color-border);
}

.total-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 14px;
}

.total-row span {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.total-row strong {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-primary-dark);
  font-variant-numeric: tabular-nums;
}

.hint {
  margin-top: 10px;
  text-align: center;
  font-size: 0.72rem;
  color: var(--color-text-light);
}

@media (max-width: 1100px) {
  .cart-panel {
    position: static;
  }

  .cart-body {
    max-height: none;
  }
}
</style>
