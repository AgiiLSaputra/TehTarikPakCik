<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { validateProduct } from '@/utils/validators'
import { formatRupiah } from '@/utils/format'
import { useCategoryStore } from '@/stores/category'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  product: { type: Object, default: null },
  saving: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const categoryStore = useCategoryStore()

const TONES = [
  { value: 'caramel', label: 'Karamel' },
  { value: 'choco', label: 'Cokelat' },
  { value: 'cream', label: 'Krim' },
  { value: 'sunset', label: 'Senja' },
  { value: 'mint', label: 'Mint' },
  { value: 'berry', label: 'Beri' }
]

const categoryOptions = computed(() =>
  categoryStore.items.map((category) => ({ value: category.id, label: category.name }))
)

const form = reactive({
  name: '',
  category_id: '',
  price: '',
  description: '',
  emoji: '🍽️',
  tone: 'caramel',
  is_active: true
})

const errors = ref({})

const isEdit = computed(() => Boolean(props.product))
const previewPrice = computed(() => Number(form.price) || 0)

function reset() {
  const product = props.product
  form.name = product?.name ?? ''
  form.category_id = product?.category_id ?? categoryStore.items[0]?.id ?? ''
  form.price = product ? String(product.price) : ''
  form.description = product?.description ?? ''
  form.emoji = product?.emoji ?? '🍽️'
  form.tone = product?.tone ?? 'caramel'
  form.is_active = product ? product.is_active !== false : true
  errors.value = {}
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) reset()
  }
)

watch(
  () => props.product,
  () => {
    if (props.modelValue) reset()
  }
)

function submit() {
  const next = validateProduct({
    ...form,
    price: form.price === '' ? '' : Number(form.price)
  })
  errors.value = next
  if (Object.keys(next).length > 0) return

  emit('submit', {
    ...form,
    name: form.name.trim(),
    description: form.description.trim(),
    price: Number(form.price)
  })
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    size="lg"
    :title="isEdit ? 'Ubah Produk' : 'Tambah Produk Baru'"
    :subtitle="
      isEdit
        ? 'Perubahan harga tidak mengubah riwayat transaksi yang sudah ada.'
        : 'Produk baru langsung tampil di katalog publik dan halaman kasir.'
    "
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="product-form" @submit.prevent="submit">
      <div class="form-grid">
        <div class="span-2">
          <BaseInput
            v-model="form.name"
            label="Nama Produk"
            placeholder="Contoh: Teh Tarik Original"
            :error="errors.name"
            hint="3–60 karakter, tidak boleh sama dalam satu kategori."
            required
            maxlength="60"
          />
        </div>

        <BaseSelect
          v-model="form.category_id"
          label="Kategori"
          placeholder="Pilih kategori"
          :options="categoryOptions"
          :error="errors.category_id"
          required
        />

        <BaseInput
          v-model="form.price"
          label="Harga (Rupiah)"
          type="number"
          min="1"
          step="500"
          placeholder="8000"
          :error="errors.price"
          :hint="`Tampil sebagai ${formatRupiah(previewPrice)}`"
          required
        />

        <div class="span-2">
          <BaseTextarea
            v-model="form.description"
            label="Deskripsi"
            placeholder="Deskripsi singkat produk..."
            :rows="3"
            maxlength="160"
            :error="errors.description"
            :hint="`${form.description.length}/160 karakter`"
          />
        </div>

        <BaseInput
          v-model="form.emoji"
          label="Ilustrasi (emoji)"
          placeholder="🍽️"
          maxlength="4"
          hint="Dipakai bila produk belum punya foto."
        />

        <BaseSelect v-model="form.tone" label="Warna Kartu" :options="TONES" />

        <div class="span-2 toggle-row">
          <label class="switch">
            <input v-model="form.is_active" type="checkbox" />
            <span class="switch-track" aria-hidden="true"><span class="switch-dot" /></span>
            <span class="switch-text">
              <strong>Produk aktif</strong>
              <small>Produk nonaktif tidak muncul di katalog dan kasir.</small>
            </span>
          </label>
        </div>

        <div class="span-2 preview">
          <span class="preview-media" :class="`tone-${form.tone}`">
            <span class="preview-emoji">{{ form.emoji || '🍽️' }}</span>
          </span>
          <div class="preview-meta">
            <span class="preview-label">Pratinjau kartu</span>
            <strong>{{ form.name || 'Nama produk' }}</strong>
            <small>{{ form.description || 'Deskripsi produk akan tampil di sini.' }}</small>
            <span class="preview-price">{{ formatRupiah(previewPrice) }}</span>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <BaseButton variant="secondary" size="sm" :disabled="saving" @click="emit('update:modelValue', false)">
        Batal
      </BaseButton>
      <BaseButton size="sm" :loading="saving" @click="submit">
        {{ isEdit ? 'Simpan Perubahan' : 'Tambah Produk' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.product-form {
  padding-top: 4px;
}

.toggle-row {
  padding: 4px 0;
}

.switch {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.switch input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-track {
  position: relative;
  width: 44px;
  height: 25px;
  flex: none;
  border-radius: var(--radius-pill);
  background: var(--color-border-strong);
  transition: background 0.2s ease;
}

.switch-dot {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s var(--ease);
}

.switch input:checked + .switch-track {
  background: var(--color-success);
}

.switch input:checked + .switch-track .switch-dot {
  transform: translateX(19px);
}

.switch input:focus-visible + .switch-track {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.switch-text strong {
  display: block;
  font-size: 0.85rem;
}

.switch-text small {
  font-size: 0.76rem;
  color: var(--color-text-muted);
}

.preview {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 14px;
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius);
  background: var(--color-surface-muted);
}

.preview-media {
  display: grid;
  place-items: center;
  width: 92px;
  height: 76px;
  border-radius: 10px;
  flex: none;
  overflow: hidden;
}

.preview-emoji {
  font-size: 34px;
  filter: drop-shadow(0 6px 8px rgba(92, 58, 26, 0.22));
}

.preview-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.preview-label {
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.preview-meta strong {
  font-family: var(--font-display);
  font-size: 0.95rem;
}

.preview-meta small {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.preview-price {
  margin-top: 4px;
  font-weight: 700;
  color: var(--color-primary-dark);
}

.tone-caramel {
  background: linear-gradient(140deg, #f9e7c9, #e2b782);
}
.tone-choco {
  background: linear-gradient(140deg, #eed9c0, #bb8b5f);
}
.tone-cream {
  background: linear-gradient(140deg, #fdf4e3, #ecd2a8);
}
.tone-sunset {
  background: linear-gradient(140deg, #fcdcc0, #e79a63);
}
.tone-mint {
  background: linear-gradient(140deg, #e4f0dc, #a8c793);
}
.tone-berry {
  background: linear-gradient(140deg, #f6dcda, #cf8d88);
}

@media (max-width: 560px) {
  .preview {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
