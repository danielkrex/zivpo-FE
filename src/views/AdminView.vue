<template>
  <div class="admin-page">
    <div class="admin-header">
      <div class="header-row">
        <div>
          <h1>Projekti</h1>
          <p class="subtitle">Odaberite projekt za upravljanje pozivnicama</p>
        </div>
        <div class="header-actions">
          <router-link v-if="authStore.isSuperuser" to="/admin/superuser" class="btn btn-outline btn-sm">
            Upravljaj adminima
          </router-link>
          <button class="btn btn-outline btn-sm" @click="logout">Odjava</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="empty-state">Učitavanje...</div>

    <div v-else-if="projects.length === 0" class="empty-state">
      <p>Niste dodijeljeni ni jednom projektu.</p>
      <p class="hint">Kontaktirajte superusera da Vas doda na projekt.</p>
    </div>

    <div v-else class="projects-grid">
      <router-link
        v-for="project in projects"
        :key="project.id"
        :to="`/admin/projects/${project.id}`"
        class="project-card"
      >
        <div class="project-name">{{ project.name }}</div>
        <div v-if="project.description" class="project-desc">{{ project.description }}</div>
        <div class="project-meta">
          {{ project._count.groups }} pozivnica
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminApi } from '../stores/invitation.js'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()
const adminApi = useAdminApi()

const projects = ref([])
const loading = ref(false)

async function fetchProjects() {
  loading.value = true
  try {
    projects.value = await adminApi.getProjects()
  } finally {
    loading.value = false
  }
}

function logout() {
  authStore.logout()
  router.push('/login')
}

onMounted(fetchProjects)
</script>

<style scoped>
.admin-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px;
}

.admin-header {
  margin-bottom: 32px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.admin-header h1 {
  font-size: 36px;
  color: var(--purple-dark);
}

.subtitle {
  color: var(--text-light);
  margin-top: 4px;
}

.empty-state {
  text-align: center;
  color: var(--text-light);
  padding: 64px 24px;
}

.hint {
  font-size: 14px;
  margin-top: 8px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.project-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 2px solid transparent;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-card:hover {
  border-color: var(--purple);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.project-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--purple-dark);
}

.project-desc {
  font-size: 14px;
  color: var(--text-light);
  flex: 1;
}

.project-meta {
  font-size: 12px;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}
</style>
