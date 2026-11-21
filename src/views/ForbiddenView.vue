<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { BRAND } from '@/data/images'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseIcon from '@/components/common/BaseIcon.vue'

const auth = useAuthStore()

const isLoggedIn = computed(() => auth.isLoggedIn)
const homePath = computed(() => (isLoggedIn.value ? auth.homePath : '/'))
const homeLabel = computed(() => {
  if (!isLoggedIn.value) return 'Kembali ke Menu'
  return auth.isOwner ? 'Ke Dashboard' : 'Ke Kasir'
})
</script>

<template>
  <div class="error-page">
    <div class="error-card">
      <RouterLink to="/" class="brand">
        <img :src="BRAND.logo" :alt="BRAND.name" class="brand-logo" />
        <span class="brand-name">{{ BRAND.name }}</span>
      </RouterLink>

      <div class="code-wrap" aria-hidden="true">
        <span class="code">403</span>
        <span class="code-icon">
          <BaseIcon name="lock" :size="30" />
        </span>
      </div>

      <h1>Akses ditolak</h1>
      <p class="lead">
        Halaman ini khusus untuk peran tertentu. Akun yang sedang aktif
        <template v-if="isLoggedIn">
          (<strong>{{ auth.displayName }}</strong> &middot; {{ auth.role === 'owner' ? 'Owner' : 'Kasir' }})
        </template>
        tidak memiliki izin untuk membukanya.
      </p>

      <div class="actions">
        <BaseButton size="lg" @click="$router.push(homePath)">
          <BaseIcon name="home" :size="18" />
          {{ homeLabel }}
        </BaseButton>
        <BaseButton
          v-if="!isLoggedIn"
          variant="secondary"
          size="lg"
          @click="$router.push('/login')"
        >
          <BaseIcon name="user" :size="18" />
          Masuk
        </BaseButton>
      </div>

      <p class="hint">
        Ingin berganti akun?
        <RouterLink to="/login" class="hint-link">Masuk dengan akun lain</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 32px 20px;
  background:
    radial-gradient(700px 420px at 15% 0%, rgba(217, 131, 36, 0.14), transparent 60%),
    radial-gradient(800px 500px at 100% 100%, rgba(155, 27, 30, 0.1), transparent 55%),
    var(--color-bg);
}

.error-card {
  width: 100%;
  max-width: 560px;
  padding: clamp(28px, 5vw, 48px);
  text-align: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  animation: pop 0.4s var(--ease) both;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
}

.brand-logo {
  width: 46px;
  height: 46px;
  object-fit: contain;
}

.brand-name {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-primary-darker);
}

.code-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.code {
  font-family: var(--font-display);
  font-size: clamp(4rem, 3rem + 6vw, 6.5rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.05em;
  background: linear-gradient(140deg, var(--color-accent) 0%, var(--color-brand) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.code-icon {
  position: absolute;
  right: -6px;
  bottom: 10px;
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  color: var(--color-brand);
  background: #fff;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
}

h1 {
  margin-top: 8px;
  font-size: clamp(1.5rem, 1.2rem + 1.1vw, 1.95rem);
}

.lead {
  max-width: 42ch;
  margin: 12px auto 0;
  color: var(--color-text-muted);
  font-size: 0.96rem;
}

.lead strong {
  color: var(--color-text);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
}

.hint {
  margin-top: 22px;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.hint-link {
  font-weight: 600;
  color: var(--color-primary-dark);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.hint-link:hover {
  color: var(--color-accent);
}
</style>
