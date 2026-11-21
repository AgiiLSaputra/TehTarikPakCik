<script setup>
import { onMounted } from 'vue'
import ToastContainer from '@/components/common/ToastContainer.vue'
import { useAuthStore } from '@/stores/auth'
import { useCategoryStore } from '@/stores/category'
import { useProductStore } from '@/stores/product'
import { useTransactionStore } from '@/stores/transaction'

const auth = useAuthStore()
const category = useCategoryStore()
const product = useProductStore()
const transaction = useTransactionStore()

onMounted(() => {
  auth.restoreSession()
  category.load()
  product.load()
  transaction.load()
})
</script>

<template>
  <RouterView />
  <ToastContainer />
</template>
