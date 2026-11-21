<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useFormValidation } from '@/composables/useFormValidation'
import { validateLogin } from '@/utils/validators'
import { BRAND } from '@/data/images'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseIcon from '@/components/common/BaseIcon.vue'
import BaseInput from '@/components/common/BaseInput.vue'

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const router = useRouter()

const form = reactive({ username: '', password: '' })
const apiError = ref('')
const showPassword = ref(false)
const submitting = ref(false)

const { errors, validate, setErrors, clear } = useFormValidation({
  username: (values) => validateLogin(values).username || '',
  password: (values) => validateLogin(values).password || ''
})

const DEMO_ACCOUNTS = [
  { label: 'Pemilik', username: 'owner', password: 'owner123', icon: 'chart' },
  { label: 'Kasir', username: 'kasir1', password: 'kasir123', icon: 'cart' }
]

function fill(account) {
  form.username = account.username
  form.password = account.password
  apiError.value = ''
  clear()
}

async function submit() {
  apiError.value = ''
  if (!validate(form)) return

  submitting.value = true
  const result = await auth.login({ ...form })
  submitting.value = false

  if (!result.success) {
    apiError.value = result.message
    if (result.errors) setErrors(result.errors)
    return
  }

  ui.success(`Selamat datang, ${result.data.user.name}`)
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  let destination = redirect.startsWith('/') && !redirect.startsWith('/login') ? redirect : auth.homePath

  // Jangan kirim pengguna ke halaman yang role-nya tidak diizinkan (mis. owner ke /kasir).
  const roles = router.resolve(destination).meta.roles
  if (Array.isArray(roles) && roles.length > 0 && !roles.includes(auth.role)) {
    destination = auth.homePath
  }

  router.push(destination)
}
</script>

<template>
  <div class="login-page">
    <section class="login-visual">
      <div class="visual-bg" :style="{ backgroundImage: `url(${BRAND.heroNight})` }" />
      <div class="visual-shade" />

      <div class="visual-content">
        <RouterLink to="/" class="visual-brand">
          <img :src="BRAND.logo" alt="Logo Teh Tarik Pak Cik" />
          <span>
            <strong>{{ BRAND.name }}</strong>
            <small>{{ BRAND.location }}</small>
          </span>
        </RouterLink>

        <div class="visual-copy">
          <span class="eyebrow">Sistem manajemen warung</span>
          <h1>Kelola pesanan, pembayaran, dan laporan dalam satu tempat.</h1>
          <p>
            Dirancang untuk kasir dan pemilik Teh Tarik Pak Cik. Semua data tersimpan otomatis
            di perangkat ini, jadi tetap ada setelah browser dimuat ulang.
          </p>

          <ul class="visual-points">
            <li>
              <BaseIcon name="cart" :size="17" />
              Pesan dan bayar kurang dari satu menit
            </li>
            <li>
              <BaseIcon name="chart" :size="17" />
              Rekap pendapatan harian otomatis
            </li>
            <li>
              <BaseIcon name="box" :size="17" />
              Menu dan harga bisa diubah sendiri
            </li>
          </ul>
        </div>

        <p class="visual-foot">© {{ new Date().getFullYear() }} {{ BRAND.name }} · {{ BRAND.instagram }}</p>
      </div>
    </section>

    <section class="login-form-side">
      <div class="form-wrap">
        <RouterLink to="/" class="back-link">
          <BaseIcon name="arrow-left" :size="16" />
          Kembali ke katalog
        </RouterLink>

        <div class="form-card">
          <div class="form-head">
            <span class="form-logo">
              <img :src="BRAND.logo" alt="" aria-hidden="true" />
            </span>
            <h2>Masuk ke sistem</h2>
            <p>Gunakan akun kasir atau pemilik untuk melanjutkan.</p>
          </div>

          <div v-if="apiError" class="error-banner" role="alert">
            <BaseIcon name="alert" :size="17" />
            <span>{{ apiError }}</span>
          </div>

          <form class="login-form" @submit.prevent="submit">
            <BaseInput
              v-model="form.username"
              label="Username"
              placeholder="kasir1"
              autocomplete="username"
              :error="errors.username"
              required
              @update:model-value="clear('username')"
            >
              <template #icon>
                <BaseIcon name="user" :size="18" class="field-icon" />
              </template>
            </BaseInput>

            <BaseInput
              v-model="form.password"
              label="Kata sandi"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="current-password"
              :error="errors.password"
              required
              @update:model-value="clear('password')"
            >
              <template #icon>
                <BaseIcon name="lock" :size="18" class="field-icon" />
              </template>
              <template #trailing>
                <button
                  type="button"
                  class="field-trailing"
                  :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                  @click="showPassword = !showPassword"
                >
                  <BaseIcon :name="showPassword ? 'ban' : 'eye'" :size="17" />
                </button>
              </template>
            </BaseInput>

            <BaseButton type="submit" size="lg" block :loading="submitting">
              Masuk
              <BaseIcon name="arrow-right" :size="18" />
            </BaseButton>
          </form>

          <div class="demo">
            <div class="demo-head">
              <span>Akun demo</span>
              <small>Klik untuk mengisi otomatis</small>
            </div>
            <div class="demo-grid">
              <button
                v-for="account in DEMO_ACCOUNTS"
                :key="account.username"
                type="button"
                class="demo-btn"
                @click="fill(account)"
              >
                <BaseIcon :name="account.icon" :size="17" />
                <span>
                  <strong>{{ account.label }}</strong>
                  <small>{{ account.username }} / {{ account.password }}</small>
                </span>
              </button>
            </div>
          </div>

          <p class="demo-note">
            <BaseIcon name="info" :size="14" />
            Demo akademik: kata sandi disimpan apa adanya di localStorage.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.login-page {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  min-height: 100vh;
  background: var(--color-bg);
}

/* Panel kiri */
.login-visual {
  position: relative;
  overflow: hidden;
  color: #fdf4e6;
  background: #23140a;
}

.visual-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transform: scale(1.02);
}

.visual-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(24, 13, 5, 0.7) 0%, rgba(24, 13, 5, 0.86) 55%, rgba(24, 13, 5, 0.96) 100%),
    radial-gradient(560px 320px at 20% 20%, rgba(217, 131, 36, 0.3), transparent 70%);
}

.visual-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: clamp(28px, 4vw, 52px);
}

.visual-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  width: fit-content;
}

.visual-brand img {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.visual-brand strong {
  display: block;
  font-family: var(--font-display);
  font-size: 1rem;
}

.visual-brand small {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(253, 244, 230, 0.5);
}

.visual-copy {
  margin-top: auto;
  margin-bottom: auto;
  max-width: 480px;
  padding-block: 40px;
}

.visual-copy .eyebrow {
  color: var(--color-accent-soft);
}

.visual-copy h1 {
  margin-top: 14px;
  font-size: clamp(1.8rem, 1.3rem + 1.9vw, 2.65rem);
  line-height: 1.15;
  color: #fff8ec;
  letter-spacing: -0.03em;
}

.visual-copy p {
  margin-top: 16px;
  font-size: 0.92rem;
  line-height: 1.75;
  color: rgba(253, 244, 230, 0.68);
}

.visual-points {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 28px;
}

.visual-points li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.86rem;
  color: rgba(253, 244, 230, 0.82);
}

.visual-points :deep(.base-icon) {
  color: var(--color-accent-soft);
}

.visual-foot {
  font-size: 0.72rem;
  color: rgba(253, 244, 230, 0.42);
}

/* Panel kanan */
.login-form-side {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(24px, 4vw, 48px) 24px;
}

.form-wrap {
  width: 100%;
  max-width: 420px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--color-text-muted);
  transition: color 0.18s ease;
}

.back-link:hover {
  color: var(--color-primary-dark);
}

.form-card {
  padding: clamp(24px, 3vw, 32px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
}

.form-head {
  text-align: center;
  margin-bottom: 22px;
}

.form-logo {
  display: inline-grid;
  place-items: center;
  width: 62px;
  height: 62px;
  margin-bottom: 12px;
  border-radius: 50%;
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
}

.form-logo img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.form-head h2 {
  font-size: 1.35rem;
}

.form-head p {
  margin-top: 6px;
  font-size: 0.84rem;
  color: var(--color-text-muted);
}

.error-banner {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-bottom: 16px;
  padding: 11px 13px;
  border-radius: var(--radius-sm);
  background: var(--color-danger-soft);
  color: #982b20;
  font-size: 0.82rem;
  line-height: 1.5;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px dashed var(--color-border);
}

.demo-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.demo-head span {
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-light);
}

.demo-head small {
  font-size: 0.7rem;
  color: var(--color-text-light);
}

.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.demo-btn {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface-muted);
  text-align: left;
  color: var(--color-primary-dark);
  transition: all 0.18s ease;
}

.demo-btn:hover {
  border-color: var(--color-primary-soft);
  background: var(--color-secondary);
}

.demo-btn span {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.demo-btn strong {
  font-size: 0.8rem;
}

.demo-btn small {
  font-size: 0.66rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.demo-note {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 16px;
  font-size: 0.7rem;
  line-height: 1.5;
  color: var(--color-text-light);
}

@media (max-width: 900px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-visual {
    display: none;
  }

  .login-form-side {
    min-height: 100vh;
    padding-block: 32px;
  }
}
</style>
