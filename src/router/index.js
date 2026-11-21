import { createRouter, createWebHistory } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      {
        path: '',
        name: 'menu',
        component: () => import('@/views/MenuView.vue'),
        meta: { title: 'Menu' }
      },
      {
        path: 'cek-pesanan',
        name: 'order-status',
        component: () => import('@/views/OrderStatusView.vue'),
        meta: { title: 'Cek Status Pesanan' }
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/LoginView.vue'),
        meta: { title: 'Masuk', bare: true, guestOnly: true }
      }
    ]
  },
  {
    path: '/',
    component: DashboardLayout,
    children: [
      {
        path: 'kasir',
        name: 'cashier',
        component: () => import('@/views/CashierView.vue'),
        meta: { title: 'Kasir', roles: ['cashier'] }
      },
      {
        path: 'transaksi',
        name: 'transactions',
        component: () => import('@/views/TransactionListView.vue'),
        meta: { title: 'Riwayat Transaksi', roles: ['cashier', 'owner'] }
      },
      {
        path: 'owner/dashboard',
        name: 'owner-dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: 'Dashboard', roles: ['owner'] }
      },
      {
        path: 'owner/produk',
        name: 'owner-products',
        component: () => import('@/views/ProductManageView.vue'),
        meta: { title: 'Kelola Produk', roles: ['owner'] }
      },
      {
        path: 'owner/laporan',
        name: 'owner-report',
        component: () => import('@/views/ReportView.vue'),
        meta: { title: 'Laporan Penjualan', roles: ['owner'] }
      }
    ]
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/ForbiddenView.vue'),
    meta: { title: 'Akses Ditolak' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Halaman Tidak Ditemukan' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 84, behavior: 'smooth' }
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!auth.isHydrated) auth.restoreSession()

  if (to.meta.guestOnly && auth.isLoggedIn) {
    return auth.homePath
  }

  const roles = to.meta.roles
  if (Array.isArray(roles) && roles.length > 0) {
    if (!auth.isLoggedIn) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
    if (!roles.includes(auth.role)) {
      return { name: 'forbidden' }
    }
  }

  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Teh Tarik Pak Cik` : 'Teh Tarik Pak Cik'
})

export default router
