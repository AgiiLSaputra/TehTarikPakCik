<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { BRAND } from '@/data/images'
import { useAuthStore } from '@/stores/auth'
import BaseIcon from '@/components/common/BaseIcon.vue'

const auth = useAuthStore()
const route = useRoute()

const open = ref(false)
const scrolled = ref(false)

const links = [
  { label: 'Menu', to: { path: '/', hash: '#menu' } },
  { label: 'Tentang', to: { path: '/', hash: '#tentang' } },
  { label: 'Galeri', to: { path: '/', hash: '#galeri' } },
  { label: 'Cek Pesanan', to: '/cek-pesanan' }
]

function onScroll() {
  scrolled.value = window.scrollY > 12
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

watch(
  () => route.fullPath,
  () => {
    open.value = false
  }
)
</script>

<template>
  <header class="navbar" :class="{ 'is-scrolled': scrolled, 'is-open': open }">
    <div class="container navbar-inner">
      <RouterLink to="/" class="brand" aria-label="Teh Tarik Pak Cik - Beranda">
        <img :src="BRAND.logo" alt="Logo Teh Tarik Pak Cik" class="brand-logo" width="46" height="46" />
        <span class="brand-text">
          <strong>{{ BRAND.name }}</strong>
          <small>{{ BRAND.location }}</small>
        </span>
      </RouterLink>

      <nav class="nav-links" aria-label="Navigasi utama">
        <RouterLink v-for="link in links" :key="link.label" :to="link.to" class="nav-link">
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="nav-actions">
        <RouterLink v-if="auth.isLoggedIn" :to="auth.homePath" class="login-btn">
          <BaseIcon name="chart" :size="17" />
          Dashboard
        </RouterLink>
        <RouterLink v-else to="/login" class="login-btn">
          <BaseIcon name="user" :size="17" />
          Masuk
        </RouterLink>
        <button
          type="button"
          class="menu-toggle"
          :aria-expanded="open"
          aria-label="Buka menu navigasi"
          @click="open = !open"
        >
          <BaseIcon :name="open ? 'x' : 'menu'" :size="22" />
        </button>
      </div>
    </div>

    <Transition name="drawer">
      <div v-if="open" class="mobile-nav">
        <div class="container mobile-inner">
          <RouterLink v-for="link in links" :key="link.label" :to="link.to" class="mobile-link">
            {{ link.label }}
            <BaseIcon name="chevron-right" :size="17" />
          </RouterLink>
          <RouterLink :to="auth.isLoggedIn ? auth.homePath : '/login'" class="mobile-link is-strong">
            {{ auth.isLoggedIn ? 'Buka Dashboard' : 'Masuk sebagai staf' }}
            <BaseIcon name="arrow-right" :size="17" />
          </RouterLink>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 251, 243, 0.82);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid transparent;
  transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.navbar.is-scrolled,
.navbar.is-open {
  background: rgba(255, 251, 243, 0.96);
  border-bottom-color: var(--color-border);
  box-shadow: 0 8px 24px -20px rgba(61, 37, 16, 0.5);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 76px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.brand-logo {
  width: 46px;
  height: 46px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(155, 27, 30, 0.22));
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-text strong {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-primary-darker);
}

.brand-text small {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-light);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  position: relative;
  padding: 9px 14px;
  border-radius: var(--radius-pill);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-muted);
  transition: color 0.18s ease, background 0.18s ease;
}

.nav-link:hover {
  color: var(--color-primary-dark);
  background: rgba(139, 90, 43, 0.07);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.login-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 18px;
  border-radius: var(--radius-pill);
  background: var(--color-primary-dark);
  color: #fff;
  font-size: 0.86rem;
  font-weight: 600;
  transition: background 0.18s ease, transform 0.18s var(--ease);
}

.login-btn:hover {
  background: var(--color-primary-darker);
  transform: translateY(-1px);
}

.menu-toggle {
  display: none;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid var(--color-border-strong);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-primary-dark);
}

.mobile-nav {
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
  overflow: hidden;
}

.mobile-inner {
  display: flex;
  flex-direction: column;
  padding-block: 8px;
}

.mobile-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 4px;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
}

.mobile-link:last-child {
  border-bottom: none;
}

.mobile-link.is-strong {
  color: var(--color-primary-dark);
  font-weight: 600;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease, transform 0.22s var(--ease);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 900px) {
  .nav-links {
    display: none;
  }

  .menu-toggle {
    display: grid;
  }
}

@media (max-width: 560px) {
  .brand-text small {
    display: none;
  }

  .login-btn {
    height: 40px;
    padding: 0 14px;
    font-size: 0.8rem;
  }
}
</style>
