import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as api from '@/services/api'
import { clearSession, readSession } from '@/services/storage'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isHydrated = ref(false)
  const loading = ref(false)

  const isLoggedIn = computed(() => Boolean(user.value))
  const role = computed(() => user.value?.role ?? 'guest')
  const isOwner = computed(() => role.value === 'owner')
  const isCashier = computed(() => role.value === 'cashier')
  const displayName = computed(() => user.value?.name ?? 'Pengunjung')
  const initials = computed(() =>
    displayName.value
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('')
  )
  const homePath = computed(() =>
    isOwner.value ? '/owner/dashboard' : isCashier.value ? '/kasir' : '/'
  )

  function restoreSession() {
    if (isHydrated.value) return user.value
    const session = readSession()
    if (session?.id) {
      const found = api.findUserById(session.id)
      if (found && found.is_active) user.value = found
      else clearSession()
    }
    isHydrated.value = true
    return user.value
  }

  async function login(payload) {
    loading.value = true
    try {
      const result = await api.login(payload)
      if (result.success) {
        user.value = result.data.user
        isHydrated.value = true
      }
      return result
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await api.logout()
    user.value = null
    clearSession()
  }

  function hasRole(roles = []) {
    if (!roles.length) return true
    return roles.includes(role.value)
  }

  return {
    user,
    isHydrated,
    loading,
    isLoggedIn,
    role,
    isOwner,
    isCashier,
    displayName,
    initials,
    homePath,
    restoreSession,
    login,
    logout,
    hasRole
  }
})
