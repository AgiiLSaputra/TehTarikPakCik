<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { BRAND } from '@/data/images'
import BaseIcon from '@/components/common/BaseIcon.vue'

defineProps({
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const auth = useAuthStore()

const NAV = {
  owner: [
    { label: 'Dashboard', to: '/owner/dashboard', icon: 'chart' },
    { label: 'Riwayat Transaksi', to: '/transaksi', icon: 'receipt' },
    { label: 'Kelola Produk', to: '/owner/produk', icon: 'box' },
    { label: 'Laporan Penjualan', to: '/owner/laporan', icon: 'list' }
  ],
  cashier: [
    { label: 'Kasir', to: '/kasir', icon: 'cart' },
    { label: 'Riwayat Transaksi', to: '/transaksi', icon: 'receipt' }
  ]
}

const navItems = computed(() => NAV[auth.role] || [])
const roleLabel = computed(() => (auth.isOwner ? 'Pemilik' : auth.isCashier ? 'Kasir' : 'Pengunjung'))

function close() {
  emit('close')
}
</script>

<template>
  <div v-if="open" class="sidebar-overlay" @click="close" />

  <aside class="sidebar" :class="{ 'is-open': open }">
    <RouterLink to="/" class="side-brand" @click="close">
      <img :src="BRAND.logo" alt="Logo Teh Tarik Pak Cik" width="46" height="46" />
      <span class="side-brand-text">
        <strong>Teh Tarik</strong>
        <small>Pak Cik</small>
      </span>
    </RouterLink>

    <span class="role-pill">{{ roleLabel }}</span>

    <nav class="side-nav" aria-label="Navigasi dashboard">
      <p class="nav-label">Menu Utama</p>
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="side-link"
        @click="close"
      >
        <BaseIcon :name="item.icon" :size="19" />
        <span>{{ item.label }}</span>
      </RouterLink>

      <p class="nav-label nav-label-second">Lainnya</p>
      <RouterLink to="/" class="side-link" @click="close">
        <BaseIcon name="store" :size="19" />
        <span>Katalog publik</span>
      </RouterLink>
      <RouterLink to="/cek-pesanan" class="side-link" @click="close">
        <BaseIcon name="search" :size="19" />
        <span>Cek pesanan</span>
      </RouterLink>
    </nav>

    <div class="side-spacer" />

    <div class="side-card">
      <BaseIcon name="coffee" :size="20" />
      <div>
        <strong>{{ BRAND.name }}</strong>
        <span>{{ BRAND.location }}</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  inset-block: 0;
  left: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  padding: 24px 18px;
  background: linear-gradient(180deg, #3d2510 0%, #251407 100%);
  color: #f3e6d3;
  overflow-y: auto;
}

.side-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 8px 18px;
}

.side-brand img {
  width: 46px;
  height: 46px;
  object-fit: contain;
}

.side-brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.side-brand-text strong {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}

.side-brand-text small {
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(243, 230, 211, 0.55);
}

.role-pill {
  align-self: flex-start;
  margin: 0 8px 24px;
  padding: 5px 12px;
  border: 1px solid rgba(243, 230, 211, 0.22);
  border-radius: var(--radius-pill);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-accent-soft);
  background: rgba(255, 255, 255, 0.05);
}

.side-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-label {
  padding: 0 10px;
  margin-bottom: 8px;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(243, 230, 211, 0.4);
}

.nav-label-second {
  margin-top: 22px;
}

.side-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 500;
  color: rgba(243, 230, 211, 0.72);
  transition: background 0.18s ease, color 0.18s ease;
}

.side-link:hover {
  background: rgba(255, 255, 255, 0.07);
  color: #fff;
}

.side-link.router-link-active {
  background: linear-gradient(135deg, rgba(217, 131, 36, 0.95), rgba(196, 111, 25, 0.9));
  color: #2b1607;
  font-weight: 600;
  box-shadow: 0 12px 22px -16px rgba(0, 0, 0, 0.8);
}

.side-spacer {
  flex: 1;
  min-height: 28px;
}

.side-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(243, 230, 211, 0.1);
  color: var(--color-accent-soft);
}

.side-card strong {
  display: block;
  font-size: 0.82rem;
  color: #f8ecd9;
}

.side-card span {
  font-size: 0.72rem;
  color: rgba(243, 230, 211, 0.5);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: 55;
  background: rgba(26, 15, 6, 0.55);
  backdrop-filter: blur(2px);
}

@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.28s var(--ease);
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.4);
  }

  .sidebar.is-open {
    transform: none;
  }
}

@media (min-width: 1025px) {
  .sidebar-overlay {
    display: none;
  }
}
</style>
