<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import BaseIcon from '@/components/common/BaseIcon.vue'

const emit = defineEmits(['toggle-sidebar'])

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const router = useRouter()

const menuOpen = ref(false)
const menuRef = ref(null)

const pageTitle = computed(() => route.meta.title || 'Dashboard')
const roleLabel = computed(() => (auth.isOwner ? 'Pemilik' : auth.isCashier ? 'Kasir' : 'Pengunjung'))

function onDocumentClick(event) {
  if (menuRef.value && !menuRef.value.contains(event.target)) menuOpen.value = false
}

async function handleLogout() {
  menuOpen.value = false
  await auth.logout()
  ui.success('Anda telah keluar dari sistem')
  router.push('/login')
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <button type="button" class="icon-btn only-mobile" aria-label="Buka menu" @click="emit('toggle-sidebar')">
        <BaseIcon name="menu" :size="21" />
      </button>
      <div class="page-meta">
        <span class="page-kicker">Panel {{ roleLabel }}</span>
        <h1>{{ pageTitle }}</h1>
      </div>
    </div>

    <div class="topbar-right">
      <RouterLink to="/" class="catalog-link">
        <BaseIcon name="store" :size="17" />
        <span>Lihat katalog</span>
      </RouterLink>

      <div ref="menuRef" class="user-menu">
        <button type="button" class="user-btn" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
          <span class="avatar">{{ auth.initials }}</span>
          <span class="user-meta">
            <strong>{{ auth.displayName }}</strong>
            <small>{{ roleLabel }}</small>
          </span>
          <BaseIcon name="chevron-down" :size="16" class="chev" />
        </button>

        <Transition name="dropdown">
          <div v-if="menuOpen" class="dropdown">
            <div class="dropdown-head">
              <span class="avatar avatar-lg">{{ auth.initials }}</span>
              <div>
                <strong>{{ auth.displayName }}</strong>
                <small>@{{ auth.user?.username }} · {{ roleLabel }}</small>
              </div>
            </div>
            <RouterLink to="/" class="dropdown-item" @click="menuOpen = false">
              <BaseIcon name="store" :size="17" />
              Katalog publik
            </RouterLink>
            <RouterLink to="/cek-pesanan" class="dropdown-item" @click="menuOpen = false">
              <BaseIcon name="search" :size="17" />
              Cek pesanan
            </RouterLink>
            <button type="button" class="dropdown-item is-danger" @click="handleLogout">
              <BaseIcon name="logout" :size="17" />
              Keluar
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: var(--topbar-height);
  padding: 12px 32px;
  background: rgba(255, 251, 243, 0.88);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--color-border);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.page-meta {
  min-width: 0;
}

.page-kicker {
  display: block;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-light);
}

.page-meta h1 {
  font-size: 1.15rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.catalog-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 14px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--color-primary-dark);
  transition: background 0.18s ease, border-color 0.18s ease;
}

.catalog-link:hover {
  background: var(--color-surface-muted);
  border-color: var(--color-primary-soft);
}

.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px 5px 5px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.user-btn:hover {
  border-color: var(--color-primary-soft);
  box-shadow: var(--shadow-sm);
}

.avatar {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent), var(--color-primary));
  color: #fff;
  font-family: var(--font-display);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.avatar-lg {
  width: 42px;
  height: 42px;
  font-size: 0.9rem;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  text-align: left;
}

.user-meta strong {
  font-size: 0.8rem;
  font-weight: 600;
}

.user-meta small {
  font-size: 0.68rem;
  color: var(--color-text-light);
}

.chev {
  color: var(--color-text-light);
}

.dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 258px;
  padding: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
}

.dropdown-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 10px 14px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 8px;
}

.dropdown-head strong {
  display: block;
  font-size: 0.86rem;
}

.dropdown-head small {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 10px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-muted);
  text-align: left;
}

.dropdown-item:hover {
  background: var(--color-surface-muted);
  color: var(--color-primary-dark);
}

.dropdown-item.is-danger {
  color: var(--color-danger);
}

.dropdown-item.is-danger:hover {
  background: var(--color-danger-soft);
}

.icon-btn {
  display: none;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 1px solid var(--color-border-strong);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-primary-dark);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.18s ease, transform 0.2s var(--ease);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 1024px) {
  .only-mobile {
    display: grid;
  }

  .topbar {
    padding-inline: 20px;
  }
}

@media (max-width: 700px) {
  .catalog-link {
    display: none;
  }

  .user-meta {
    display: none;
  }

  .user-btn {
    padding: 4px;
  }
}
</style>
