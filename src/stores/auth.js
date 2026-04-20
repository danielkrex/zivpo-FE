import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('authToken') || null)
  const adminInfo = ref(JSON.parse(localStorage.getItem('adminInfo') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const isSuperuser = computed(() => adminInfo.value?.isSuperuser || false)

  function authHeaders() {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  async function login(email, password) {
    const base = import.meta.env.VITE_API_URL || '/api'
    const res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Login failed')
    }

    const data = await res.json()
    token.value = data.token
    adminInfo.value = data.admin
    localStorage.setItem('authToken', data.token)
    localStorage.setItem('adminInfo', JSON.stringify(data.admin))
  }

  function logout() {
    token.value = null
    adminInfo.value = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('adminInfo')
  }

  return { token, adminInfo, isAuthenticated, isSuperuser, login, logout, authHeaders }
})
