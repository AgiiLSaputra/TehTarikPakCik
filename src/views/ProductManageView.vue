<script setup>
import { computed, ref } from 'vue'
import { useProductStore } from '@/stores/product'
import { useCategoryStore } from '@/stores/category'
import { useUiStore } from '@/stores/ui'
import { formatNumber } from '@/utils/format'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseIcon from '@/components/common/BaseIcon.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import ProductFormModal from '@/components/features/products/ProductFormModal.vue'
import ProductTable from '@/components/features/products/ProductTable.vue'

const productStore = useProductStore()
const categoryStore = useCategoryStore()
const ui = useUiStore()

const search = ref('')
const categoryFilter = ref('')
const statusFilter = ref('all')

const modalOpen = ref(false)
const editing = ref(null)
const saving = ref(false)

const confirmOpen = ref(false)
const deleting = ref(null)
const removing = ref(false)

const categoryOptions = computed(() => [
  { value: '', label: 'Semua kategori' },
  ...categoryStore.items.map((category) => ({ value: category.id, label: category.name }))
])

const statusOptions = [
  { value: 'all', label: 'Semua status' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Nonaktif' }
]

const filtered = computed(() => {
  const needle = search.value.trim().toLowerCase()
  return productStore.items.filter((product) => {
    if (categoryFilter.value && product.category_id !== categoryFilter.value) return false
    if (statusFilter.value === 'active' && !product.is_active) return false
    if (statusFilter.value === 'inactive' && product.is_active) return false
    if (needle && !product.name.toLowerCase().includes(needle)) return false
    return true
  })
})

const stats = computed(() => ({
  total: productStore.items.length,
  active: productStore.items.filter((product) => product.is_active).length,
  inactive: productStore.items.filter((product) => !product.is_active).length
}))

function openCreate() {
  editing.value = null
  modalOpen.value = true
}

function openEdit(product) {
  editing.value = product
  modalOpen.value = true
}

async function submit(payload) {
  saving.value = true
  const result = editing.value
    ? await productStore.update(editing.value.id, payload)
    : await productStore.add(payload)
  saving.value = false

  if (!result.success) {
    ui.error(result.errors ? Object.values(result.errors)[0] : result.message)
    return
  }

  modalOpen.value = false
  ui.success(editing.value ? 'Perubahan produk disimpan' : 'Produk baru ditambahkan')
  editing.value = null
}

function askDelete(product) {
  deleting.value = product
  confirmOpen.value = true
}

async function confirmDelete() {
  if (!deleting.value) return
  removing.value = true
  const result = await productStore.remove(deleting.value.id)
  removing.value = false
  confirmOpen.value = false

  if (!result.success) {
    ui.error(result.message)
    return
  }

  ui.success(
    result.data.deactivated
      ? `"${deleting.value.name}" sudah dipakai transaksi, jadi hanya dinonaktifkan`
      : `"${deleting.value.name}" berhasil dihapus`
  )
  deleting.value = null
}
</script>

<template>
  <div class="manage-page">
    <header class="page-head">
      <div>
        <h1>Kelola Produk</h1>
        <p>Tambah, ubah, atau nonaktifkan menu yang tampil di katalog.</p>
      </div>
      <BaseButton size="md" @click="openCreate">
        <BaseIcon name="plus" :size="17" />
        Tambah Produk
      </BaseButton>
    </header>

    <div class="stats-row">
      <span class="stat-chip">
        <BaseIcon name="box" :size="16" />
        {{ formatNumber(stats.total) }} total produk
      </span>
      <span class="stat-chip is-ok">{{ formatNumber(stats.active) }} aktif</span>
      <span class="stat-chip is-off">{{ formatNumber(stats.inactive) }} nonaktif</span>
    </div>

    <section class="toolbar card">
      <BaseInput v-model="search" placeholder="Cari nama produk..." class="toolbar-search">
        <template #icon>
          <BaseIcon name="search" :size="18" class="field-icon" />
        </template>
      </BaseInput>
      <BaseSelect v-model="categoryFilter" :options="categoryOptions" class="toolbar-select" />
      <BaseSelect v-model="statusFilter" :options="statusOptions" class="toolbar-select" />
    </section>

    <section class="table-card card">
      <div class="table-head">
        <span class="table-title">
          <BaseIcon name="list" :size="17" />
          {{ filtered.length }} produk ditampilkan
        </span>
        <span class="table-hint">Harga dan status dapat diubah kapan saja.</span>
      </div>

      <ProductTable :products="filtered" @edit="openEdit" @delete="askDelete" />
    </section>

    <ProductFormModal
      v-model="modalOpen"
      :product="editing"
      :saving="saving"
      @submit="submit"
    />

    <ConfirmDialog
      v-model="confirmOpen"
      title="Hapus produk?"
      :message="`Hapus &quot;${deleting?.name || ''}&quot;? Jika produk sudah dipakai transaksi, produk hanya dinonaktifkan agar riwayat tetap utuh.`"
      confirm-text="Ya, hapus"
      :loading="removing"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.manage-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 13px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: 0.76rem;
  color: var(--color-text-muted);
}

.stat-chip.is-ok {
  background: var(--color-success-soft);
  border-color: transparent;
  color: #1e6b41;
}

.stat-chip.is-off {
  background: var(--color-surface-muted);
  border-color: transparent;
  color: var(--color-text-light);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  padding: 16px;
}

.toolbar-search {
  flex: 1;
  min-width: 220px;
}

.toolbar-select {
  width: 180px;
}

.table-card {
  overflow: hidden;
}

.table-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 15px 20px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-muted);
}

.table-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--color-primary-dark);
}

.table-hint {
  font-size: 0.72rem;
  color: var(--color-text-light);
}

@media (max-width: 700px) {
  .toolbar-select {
    width: 100%;
  }
}
</style>
