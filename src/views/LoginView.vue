<template>
  <div class="login-page">
    <div class="login-card card">
      <h1>Admin prijava</h1>
      <p class="subtitle">Upravljanje pozivnicama</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="field">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="admin@example.com"
            required
            autofocus
          />
        </div>
        <div class="field">
          <label>Lozinka</label>
          <input
            v-model="password"
            type="password"
            placeholder="Unesite lozinku"
            required
          />
        </div>
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
          {{ loading ? 'Prijava...' : 'Prijavi se' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/admin')
  } catch (err) {
    error.value = err.message || 'Greška pri prijavi'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
  font-size: 28px;
  color: var(--purple-dark);
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-light);
  margin-bottom: 28px;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 13px;
  color: var(--text-light);
  font-weight: 500;
}

.field input {
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.field input:focus {
  border-color: var(--purple);
}

.btn-full {
  width: 100%;
  justify-content: center;
}
</style>
