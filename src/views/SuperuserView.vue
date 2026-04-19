<template>
  <div class="admin-page">
    <div class="admin-header">
      <div class="header-row">
        <div>
          <h1>Superuser panel</h1>
        </div>
        <div class="header-actions">
          <router-link to="/admin" class="btn btn-outline">← Nazad</router-link>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button :class="['tab', activeTab === 'admins' && 'tab--active']" @click="activeTab = 'admins'">Admini</button>
      <button :class="['tab', activeTab === 'projects' && 'tab--active']" @click="activeTab = 'projects'">Projekti</button>
    </div>

    <!-- ── Admins tab ─────────────────────────────────────────────────── -->
    <template v-if="activeTab === 'admins'">
      <div class="card table-section">
        <div class="table-header">
          <h3>Admini ({{ admins.length }})</h3>
          <button class="btn btn-outline btn-sm" @click="fetchAdmins">↻ Osvježi</button>
        </div>

        <div v-if="adminsLoading" class="table-loading">Učitavanje...</div>
        <div v-else-if="admins.length === 0" class="table-empty">Nema admina.</div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ime</th>
                <th>Email</th>
                <th>Uloga</th>
                <th>Kreiran</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="admin in admins" :key="admin.id">
                <td>{{ admin.name }}</td>
                <td class="email-cell">{{ admin.email }}</td>
                <td>
                  <span :class="admin.isSuperuser ? 'badge-superuser' : 'badge-admin'">
                    {{ admin.isSuperuser ? 'Superuser' : 'Admin' }}
                  </span>
                </td>
                <td class="text-muted">{{ formatDate(admin.createdAt) }}</td>
                <td>
                  <button
                    v-if="!admin.isSuperuser"
                    class="btn btn-danger btn-sm"
                    @click="removeAdmin(admin.id)"
                  >Obriši</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card create-section">
        <h3>Dodaj novog admina</h3>
        <form @submit.prevent="createAdmin" class="create-form">
          <div class="form-row">
            <div class="field">
              <label>Ime</label>
              <input v-model="newAdmin.name" type="text" placeholder="Ime i prezime" required />
            </div>
            <div class="field">
              <label>Email</label>
              <input v-model="newAdmin.email" type="email" placeholder="admin@example.com" required />
            </div>
            <div class="field">
              <label>Lozinka</label>
              <input v-model="newAdmin.password" type="password" placeholder="Lozinka" required />
            </div>
            <button type="submit" class="btn btn-primary" :disabled="creating">
              {{ creating ? 'Dodavanje...' : 'Dodaj admina' }}
            </button>
          </div>
          <div v-if="createAdminError" class="alert alert-error">{{ createAdminError }}</div>
          <div v-if="createAdminSuccess" class="alert alert-success">{{ createAdminSuccess }}</div>
        </form>
      </div>
    </template>

    <!-- ── Projects tab ──────────────────────────────────────────────── -->
    <template v-if="activeTab === 'projects'">
      <div class="card table-section">
        <div class="table-header">
          <h3>Projekti ({{ projects.length }})</h3>
          <button class="btn btn-outline btn-sm" @click="fetchProjects">↻ Osvježi</button>
        </div>

        <div v-if="projectsLoading" class="table-loading">Učitavanje...</div>
        <div v-else-if="projects.length === 0" class="table-empty">Nema projekata.</div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Naziv</th>
                <th>Opis</th>
                <th>Članova</th>
                <th>Pozivnica</th>
                <th>Kreiran</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="project in projects" :key="project.id">
                <tr>
                  <td><strong>{{ project.name }}</strong></td>
                  <td class="text-muted">{{ project.description || '—' }}</td>
                  <td class="text-muted">{{ project._count.members }}</td>
                  <td class="text-muted">{{ project._count.groups }}</td>
                  <td class="text-muted">{{ formatDate(project.createdAt) }}</td>
                  <td>
                    <div style="display:flex;gap:6px;">
                      <button class="btn btn-outline btn-sm" @click="toggleMembers(project.id)">
                        {{ expandedProject === project.id ? 'Zatvori' : 'Članovi' }}
                      </button>
                      <button class="btn btn-danger btn-sm" @click="removeProject(project.id)">Obriši</button>
                    </div>
                  </td>
                </tr>
                <!-- Expanded members row -->
                <tr v-if="expandedProject === project.id">
                  <td colspan="6" class="members-cell">
                    <div class="members-panel">
                      <div v-if="membersLoading" class="text-muted">Učitavanje...</div>
                      <template v-else>
                        <div v-if="projectMembers.length === 0" class="text-muted">Nema članova.</div>
                        <div v-else class="members-list">
                          <div v-for="member in projectMembers" :key="member.id" class="member-row">
                            <span>{{ member.name }} <span class="text-muted">({{ member.email }})</span></span>
                            <button class="btn btn-danger btn-sm" @click="removeMember(project.id, member.id)">Ukloni</button>
                          </div>
                        </div>
                        <div class="add-member-row">
                          <select v-model="selectedAdminId" class="member-select">
                            <option value="">— Odaberi admina —</option>
                            <option
                              v-for="admin in adminsNotInProject"
                              :key="admin.id"
                              :value="admin.id"
                            >{{ admin.name }} ({{ admin.email }})</option>
                          </select>
                          <button class="btn btn-primary btn-sm" :disabled="!selectedAdminId" @click="addMember(project.id)">
                            Dodaj
                          </button>
                        </div>
                      </template>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create project form -->
      <div class="card create-section">
        <h3>Novi projekt</h3>
        <form @submit.prevent="createProject" class="create-form">
          <div class="form-row">
            <div class="field">
              <label>Naziv</label>
              <input v-model="newProject.name" type="text" placeholder="Naziv projekta" required />
            </div>
            <div class="field">
              <label>Opis (opcionalno)</label>
              <input v-model="newProject.description" type="text" placeholder="Kratki opis" />
            </div>
            <button type="submit" class="btn btn-primary" :disabled="creatingProject">
              {{ creatingProject ? 'Kreiranje...' : 'Kreiraj projekt' }}
            </button>
          </div>
          <div v-if="createProjectError" class="alert alert-error">{{ createProjectError }}</div>
          <div v-if="createProjectSuccess" class="alert alert-success">{{ createProjectSuccess }}</div>
        </form>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth.js'

const authStore = useAuthStore()
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

function h() { return authStore.authHeaders() }

// ── State ─────────────────────────────────────────────────────────────────────
const activeTab = ref('admins')

// Admins
const admins = ref([])
const adminsLoading = ref(false)
const creating = ref(false)
const createAdminError = ref('')
const createAdminSuccess = ref('')
const newAdmin = ref({ name: '', email: '', password: '' })

// Projects
const projects = ref([])
const projectsLoading = ref(false)
const creatingProject = ref(false)
const createProjectError = ref('')
const createProjectSuccess = ref('')
const newProject = ref({ name: '', description: '' })

const expandedProject = ref(null)
const projectMembers = ref([])
const membersLoading = ref(false)
const selectedAdminId = ref('')

const adminsNotInProject = computed(() => {
  const memberIds = new Set(projectMembers.value.map(m => m.id))
  return admins.value.filter(a => !a.isSuperuser && !memberIds.has(a.id))
})

// ── Admins ────────────────────────────────────────────────────────────────────
async function fetchAdmins() {
  adminsLoading.value = true
  try {
    const { data } = await api.get('/superuser/admins', { headers: h() })
    admins.value = data
  } catch (err) {
    console.error(err)
  } finally {
    adminsLoading.value = false
  }
}

async function createAdmin() {
  createAdminError.value = ''
  createAdminSuccess.value = ''
  creating.value = true
  try {
    const { data } = await api.post('/superuser/admins', newAdmin.value, { headers: h() })
    admins.value.push(data)
    createAdminSuccess.value = `Admin "${data.name}" je kreiran.`
    newAdmin.value = { name: '', email: '', password: '' }
  } catch (err) {
    createAdminError.value = err.response?.data?.error || 'Greška pri kreiranju'
  } finally {
    creating.value = false
  }
}

async function removeAdmin(id) {
  if (!confirm('Sigurno želite obrisati ovog admina?')) return
  try {
    await api.delete(`/superuser/admins/${id}`, { headers: h() })
    admins.value = admins.value.filter(a => a.id !== id)
  } catch (err) {
    alert(err.response?.data?.error || 'Greška pri brisanju')
  }
}

// ── Projects ──────────────────────────────────────────────────────────────────
async function fetchProjects() {
  projectsLoading.value = true
  try {
    const { data } = await api.get('/superuser/projects', { headers: h() })
    projects.value = data
  } catch (err) {
    console.error(err)
  } finally {
    projectsLoading.value = false
  }
}

async function createProject() {
  createProjectError.value = ''
  createProjectSuccess.value = ''
  creatingProject.value = true
  try {
    const { data } = await api.post('/superuser/projects', newProject.value, { headers: h() })
    projects.value.unshift(data)
    createProjectSuccess.value = `Projekt "${data.name}" je kreiran.`
    newProject.value = { name: '', description: '' }
  } catch (err) {
    createProjectError.value = err.response?.data?.error || 'Greška pri kreiranju'
  } finally {
    creatingProject.value = false
  }
}

async function removeProject(id) {
  if (!confirm('Sigurno želite obrisati ovaj projekt? Sve pozivnice i gosti bit će trajno obrisani.')) return
  try {
    await api.delete(`/superuser/projects/${id}`, { headers: h() })
    projects.value = projects.value.filter(p => p.id !== id)
    if (expandedProject.value === id) expandedProject.value = null
  } catch (err) {
    alert(err.response?.data?.error || 'Greška pri brisanju')
  }
}

async function toggleMembers(projectId) {
  if (expandedProject.value === projectId) {
    expandedProject.value = null
    return
  }
  expandedProject.value = projectId
  selectedAdminId.value = ''
  membersLoading.value = true
  try {
    const { data } = await api.get(`/superuser/projects/${projectId}/members`, { headers: h() })
    projectMembers.value = data
  } catch (err) {
    console.error(err)
  } finally {
    membersLoading.value = false
  }
}

async function addMember(projectId) {
  if (!selectedAdminId.value) return
  try {
    await api.post(`/superuser/projects/${projectId}/members`, { adminId: selectedAdminId.value }, { headers: h() })
    const admin = admins.value.find(a => a.id === selectedAdminId.value)
    if (admin) projectMembers.value.push(admin)
    selectedAdminId.value = ''
    // update member count in projects list
    const p = projects.value.find(p => p.id === projectId)
    if (p) p._count.members++
  } catch (err) {
    alert(err.response?.data?.error || 'Greška pri dodavanju')
  }
}

async function removeMember(projectId, adminId) {
  try {
    await api.delete(`/superuser/projects/${projectId}/members/${adminId}`, { headers: h() })
    projectMembers.value = projectMembers.value.filter(m => m.id !== adminId)
    const p = projects.value.find(p => p.id === projectId)
    if (p) p._count.members--
  } catch (err) {
    alert(err.response?.data?.error || 'Greška pri uklanjanju')
  }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(() => {
  fetchAdmins()
  fetchProjects()
})
</script>

<style scoped>
.admin-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px;
}

.admin-header {
  margin-bottom: 24px;
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

.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;
}

.tab {
  padding: 10px 20px;
  border: none;
  background: none;
  font-size: 15px;
  cursor: pointer;
  color: var(--text-light);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.15s;
}

.tab:hover { color: var(--purple); }

.tab--active {
  color: var(--purple-dark);
  font-weight: 600;
  border-bottom-color: var(--purple);
}

.table-section {
  margin-bottom: 24px;
  padding: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header h3 {
  font-size: 18px;
  color: var(--purple-dark);
}

.table-loading, .table-empty {
  text-align: center;
  color: var(--text-light);
  padding: 32px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th {
  text-align: left;
  padding: 10px 12px;
  background: var(--bg);
  color: var(--text-light);
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  padding: 12px;
  border-bottom: 1px solid #f0eee8;
}

tr:last-child td { border-bottom: none; }
tr:hover td { background: #fafaf8; }

.email-cell {
  font-size: 13px;
  color: var(--text-light);
}

.text-muted { color: var(--text-light); }

.badge-superuser, .badge-admin {
  padding: 2px 10px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 500;
}

.badge-superuser {
  background: #fef3c7;
  color: #92400e;
}

.badge-admin {
  background: var(--purple-light);
  color: var(--purple-dark);
}

.members-cell {
  padding: 0 !important;
  background: #fafaf8;
}

.members-panel {
  padding: 16px 24px;
  border-top: 1px solid #f0eee8;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.member-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.add-member-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 12px;
}

.member-select {
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  flex: 1;
  outline: none;
}

.member-select:focus { border-color: var(--purple); }

.create-section {
  padding: 24px;
}

.create-section h3 {
  font-size: 18px;
  color: var(--purple-dark);
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 160px;
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
</style>
