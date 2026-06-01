<template>
  <div class="admin-page">
    <div class="admin-header">
      <div class="header-row">
        <div>
          <router-link to="/admin" class="back-link">← Projekti</router-link>
          <h1>{{ projectName }}</h1>
          <p class="subtitle">Upravljanje pozivnicama</p>
        </div>
        <div class="header-actions">
          <router-link v-if="authStore.isSuperuser" to="/admin/superuser" class="btn btn-outline btn-sm">
            Upravljaj adminima
          </router-link>
          <button class="btn btn-outline btn-sm" @click="logout">Odjava</button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid" v-if="stats">
      <div class="stat-card">
        <div class="stat-number">{{ stats.totalGroups }}</div>
        <div class="stat-label">Pozivnica</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.totalGuests }}</div>
        <div class="stat-label">Gostiju ukupno</div>
      </div>
      <div class="stat-card stat-card--sent">
        <div class="stat-number">{{ stats.sent }}</div>
        <div class="stat-label">Emailova poslano</div>
      </div>
      <div class="stat-card stat-card--attending">
        <div class="stat-number">{{ stats.attending }}</div>
        <div class="stat-label">Dolaze</div>
      </div>
      <div class="stat-card stat-card--maybe">
        <div class="stat-number">{{ stats.maybe }}</div>
        <div class="stat-label">Možda</div>
      </div>
      <div class="stat-card stat-card--not-attending">
        <div class="stat-number">{{ stats.notAttending }}</div>
        <div class="stat-label">Ne dolaze</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab-btn" :class="{ active: activeTab === 'invitations' }" @click="activeTab = 'invitations'">
        Pozivnice
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'settings' }" @click="openSettings">
        Postavke
      </button>
    </div>

    <!-- Tab: Pozivnice -->
    <template v-if="activeTab === 'invitations'">
      <!-- Actions -->
      <div class="actions-row card">
        <div class="action-group">
          <h3>Uvezi kontakte (CSV)</h3>
          <p class="hint">Stupci: <code>name</code>, <code>email</code> — isti email = jedna grupa (pratnja)</p>
          <UploadCsv @uploaded="onCsvUploaded" :admin-api="adminApi" :project-id="projectId" />
        </div>

        <div class="action-group">
          <h3>Pošalji pozivnice</h3>
          <p class="hint">Slanje svim kontaktima kojima email još nije poslan</p>
          <button
            class="btn btn-primary"
            :disabled="sendingAll"
            @click="sendAll"
          >
            {{ sendingAll ? 'Slanje...' : 'Pošalji sve neposlane' }}
          </button>
          <div v-if="sendResult" class="alert" :class="sendResult.errors?.length ? 'alert-error' : 'alert-success'">
            Poslano: {{ sendResult.sent }}
            <span v-if="sendResult.errors?.length"> | Grešaka: {{ sendResult.errors.length }}</span>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-section card">
        <div class="table-header">
          <h3>Sve pozivnice ({{ invitations.length }} grupa)</h3>
          <div class="table-header-actions">
            <button class="btn btn-primary btn-sm" @click="openAddModal">+ Dodaj ručno</button>
            <button class="btn btn-outline btn-sm" @click="refresh">↻ Osvježi</button>
          </div>
        </div>

        <div v-if="tableLoading" class="table-loading">Učitavanje...</div>
        <div v-else-if="invitations.length === 0" class="table-empty">
          Nema pozivnica. Uvezite CSV da biste dodali kontakte.
        </div>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nositelj / Pratnja</th>
                <th>Email</th>
                <th>Gosti</th>
                <th>Email poslan</th>
                <th>WA poslan</th>
                <th>Link</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="group in invitations" :key="group.id">
                <tr class="group-row">
                  <td>
                    <div class="group-guests">
                      <div v-for="guest in group.guests" :key="guest.id" class="guest-line">
                        <span class="badge" :class="`badge-${guest.status.toLowerCase()}`">
                          {{ statusLabels[guest.status] }}
                        </span>
                        {{ guest.name }}
                        <span v-if="guest.isPrimary" class="primary-tag">nositelj</span>
                      </div>
                    </div>
                  </td>
                  <td class="email-cell">{{ group.email }}</td>
                  <td class="text-muted">{{ group.guests.length }} os.</td>
                  <td>
                    <span :class="group.emailSent ? 'text-success' : 'text-muted'">
                      {{ group.emailSent ? '✓ Da' : '– Ne' }}
                    </span>
                  </td>
                  <td>
                    <button
                      class="btn-icon"
                      :class="group.whatsappSent ? 'text-success' : 'text-muted'"
                      :title="group.whatsappSent ? 'Označi kao neposlano' : 'Označi kao poslano'"
                      @click="toggleWhatsapp(group)"
                    >{{ group.whatsappSent ? '✓ Da' : '– Ne' }}</button>
                  </td>
                  <td class="link-cell">
                    <div class="link-actions">
                      <button class="btn-icon" title="Kopiraj link" @click="copyLink(group.token)">
                        {{ copiedToken === group.token ? '✓' : '⎘' }}
                      </button>
                      <a
                        :href="whatsappLink(group)"
                        target="_blank"
                        class="btn-icon btn-icon--wa"
                        title="Pošalji WhatsAppom"
                        @click="markWhatsappSent(group)"
                      >WA</a>
                    </div>
                  </td>
                  <td class="row-actions">
                    <button
                      class="btn btn-outline btn-sm"
                      :disabled="sendingId === group.id"
                      @click="resend(group.id)"
                      title="Pošalji email ponovo"
                    >{{ sendingId === group.id ? '...' : '✉ Pošalji' }}</button>
                    <button class="btn btn-danger btn-sm" @click="remove(group.id)">Obriši</button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Modal: Ručno dodavanje pozivnice -->
    <Teleport to="body">
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Dodaj pozivnicu</h3>
            <button class="modal-close" @click="closeAddModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="field">
              <label>Email adresa *</label>
              <input v-model="addForm.email" type="email" placeholder="gost@email.com" />
            </div>
            <div class="field">
              <label>Gosti *</label>
              <div class="guest-rows">
                <div v-for="(g, i) in addForm.guests" :key="i" class="guest-row-input">
                  <input v-model="g.name" type="text" :placeholder="i === 0 ? 'Ime nositelja pozivnice' : 'Ime pratnje / djeteta'" maxlength="80" />
                  <label class="child-toggle" :class="{ active: g.isChild }" @click="g.isChild = !g.isChild" title="Dijete">
                    Dijete
                  </label>
                  <button v-if="addForm.guests.length > 1" class="btn-remove-row" @click="addForm.guests.splice(i, 1)">✕</button>
                </div>
              </div>
              <button type="button" class="btn btn-outline btn-sm" style="margin-top:8px" @click="addForm.guests.push({ name: '', isChild: false })">
                + Dodaj pratnju
              </button>
            </div>
            <div v-if="addModalError" class="alert alert-error">{{ addModalError }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline btn-sm" @click="closeAddModal" :disabled="addModalLoading">Odustani</button>
            <button class="btn btn-primary btn-sm" @click="submitAddModal" :disabled="addModalLoading">
              {{ addModalLoading ? 'Sprema...' : 'Spremi' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Tab: Postavke -->
    <template v-if="activeTab === 'settings'">
      <div class="settings-card card">
        <div v-if="settingsLoading" class="table-loading">Učitavanje postavki...</div>
        <form v-else @submit.prevent="saveSettings" class="settings-form">

          <!-- Design template picker -->
          <div class="settings-section">
            <h3>Dizajn pozivnice</h3>
            <p class="settings-hint">Odaberite vizualni stil koji će se koristiti za email i stranicu pozivnice.</p>
            <div class="template-picker">
              <label class="template-option" :class="{ selected: form.designTemplate !== 'elegant' }" @click="form.designTemplate = 'classic'">
                <div class="template-preview template-preview--classic">
                  <div class="tp-header"></div>
                  <div class="tp-body">
                    <div class="tp-line tp-line--wide"></div>
                    <div class="tp-line"></div>
                    <div class="tp-line tp-line--short"></div>
                  </div>
                </div>
                <div class="template-label">
                  <span class="template-radio" :class="{ active: form.designTemplate !== 'elegant' }"></span>
                  <span>Klasični</span>
                </div>
                <p class="template-desc">Tamna pozadina s ljubičastim naglascima i zlatnim detaljima.</p>
              </label>
              <label class="template-option" :class="{ selected: form.designTemplate === 'elegant' }" @click="form.designTemplate = 'elegant'">
                <div class="template-preview template-preview--elegant">
                  <div class="tp-hero"></div>
                  <div class="tp-body">
                    <div class="tp-monogram"></div>
                    <div class="tp-line tp-line--thin"></div>
                    <div class="tp-line tp-line--short tp-line--thin"></div>
                  </div>
                </div>
                <div class="template-label">
                  <span class="template-radio" :class="{ active: form.designTemplate === 'elegant' }"></span>
                  <span>Elegantni</span>
                </div>
                <p class="template-desc">Minimalisti&ccedil;ki bijeli dizajn s rasporedom vjenčanja i vremenskom linijom.</p>
              </label>
            </div>
          </div>

          <!-- Email template -->
          <div class="settings-section">
            <h3>Email template</h3>

            <div class="field">
              <label>Predmet emaila</label>
              <input v-model="form.emailSubject" type="text" placeholder="Pozivnica za poseban događaj" />
            </div>
            <div class="field">
              <label>Naslov u headeru emaila</label>
              <input v-model="form.emailHeading" type="text" placeholder="✉ Pozivnica" />
            </div>
            <div class="field">
              <label>Naziv eventa</label>
              <input v-model="form.emailEventName" type="text" placeholder="npr. Vjenčanje Ane i Marka" />
            </div>
            <div class="field">
              <label>Datum eventa</label>
              <input v-model="form.emailEventDate" type="text" placeholder="npr. 15. lipnja 2026." />
            </div>
            <div class="field">
              <label>Lokacija eventa</label>
              <input v-model="form.emailEventLocation" type="text" placeholder="npr. Dvorana Zrinjevac, Zagreb" />
            </div>
            <div class="field">
              <label>Uvodni tekst</label>
              <textarea v-model="form.emailBodyText" rows="3" placeholder="Imate čast biti pozvani na naš poseban događaj..."></textarea>
            </div>
            <div class="field field--color">
              <label>Boja naglaska (hex)</label>
              <div class="color-input-row">
                <input v-model="form.emailAccentColor" type="text" placeholder="#2d1b4e" class="color-text" />
                <div class="color-swatch" :style="{ background: form.emailAccentColor || '#2d1b4e' }"></div>
              </div>
            </div>
            <div class="field">
              <label>Slika headera emaila</label>
              <div class="upload-area">
                <input type="file" accept="image/*" @change="e => handleImageUpload(e, 'emailHeaderImageUrl')" :disabled="uploading.emailHeaderImageUrl" />
                <div v-if="uploading.emailHeaderImageUrl" class="upload-status">Uploading...</div>
                <div v-if="form.emailHeaderImageUrl" class="image-preview">
                  <img :src="form.emailHeaderImageUrl" alt="Email header preview" />
                  <button type="button" class="btn-remove-img" @click="form.emailHeaderImageUrl = ''">✕ Ukloni</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Landing page -->
          <div class="settings-section">
            <h3>Stranica pozivnice</h3>

            <div class="field">
              <label>Naslov stranice (H1)</label>
              <input v-model="form.pageHeading" type="text" placeholder="Pozivnica" />
            </div>
            <div class="field">
              <label>Naziv eventa</label>
              <input v-model="form.pageEventName" type="text" placeholder="npr. Vjenčanje Ane i Marka" />
            </div>
            <div class="field">
              <label>Datum eventa</label>
              <input v-model="form.pageEventDate" type="text" placeholder="npr. 15. lipnja 2026." />
            </div>
            <div class="field">
              <label>Lokacija eventa</label>
              <input v-model="form.pageEventLocation" type="text" placeholder="npr. Dvorana Zrinjevac, Zagreb" />
            </div>
            <div class="field">
              <label>Tekst dobrodošlice</label>
              <textarea v-model="form.pageWelcomeText" rows="3" placeholder="Imate čast biti pozvani..."></textarea>
            </div>
            <div class="field field--color">
              <label>Boja naglaska (hex)</label>
              <div class="color-input-row">
                <input v-model="form.pageAccentColor" type="text" placeholder="#2d1b4e" class="color-text" />
                <div class="color-swatch" :style="{ background: form.pageAccentColor || '#2d1b4e' }"></div>
              </div>
            </div>
            <div class="field">
              <label>Hero slika stranice</label>
              <div class="upload-area">
                <input type="file" accept="image/*" @change="e => handleImageUpload(e, 'pageHeaderImageUrl')" :disabled="uploading.pageHeaderImageUrl" />
                <div v-if="uploading.pageHeaderImageUrl" class="upload-status">Uploading...</div>
                <div v-if="form.pageHeaderImageUrl" class="image-preview">
                  <img :src="form.pageHeaderImageUrl" alt="Page header preview" />
                  <button type="button" class="btn-remove-img" @click="form.pageHeaderImageUrl = ''">✕ Ukloni</button>
                </div>
              </div>
            </div>
          </div>

          <div class="settings-footer">
            <div v-if="saveMessage" class="alert" :class="saveError ? 'alert-error' : 'alert-success'">
              {{ saveMessage }}
            </div>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Spremanje...' : 'Spremi' }}
            </button>
          </div>
        </form>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminApi } from '../stores/invitation.js'
import { useAuthStore } from '../stores/auth.js'
import { useStorageUpload } from '../composables/useStorageUpload.js'
import UploadCsv from '../components/UploadCsv.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const adminApi = useAdminApi()
const { uploadImage } = useStorageUpload()

const projectId = route.params.projectId
const projectName = ref('Projekt')
const activeTab = ref('invitations')

const invitations = ref([])
const tableLoading = ref(false)
const sendingAll = ref(false)
const sendResult = ref(null)
const copiedToken = ref(null)
const sendingId = ref(null)

async function toggleWhatsapp(group) {
  const result = await adminApi.toggleWhatsapp(projectId, group.id)
  group.whatsappSent = result.whatsappSent
  group.whatsappSentAt = result.whatsappSentAt
}

async function markWhatsappSent(group) {
  if (!group.whatsappSent) {
    const result = await adminApi.toggleWhatsapp(projectId, group.id)
    group.whatsappSent = result.whatsappSent
    group.whatsappSentAt = result.whatsappSentAt
  }
}

async function resend(id) {
  sendingId.value = id
  try {
    await adminApi.resendInvitation(projectId, id)
    await refresh()
  } catch (err) {
    alert(err.response?.data?.error || 'Greška pri slanju emaila.')
  } finally {
    sendingId.value = null
  }
}

// Add invitation modal
const showAddModal = ref(false)
const addModalLoading = ref(false)
const addModalError = ref('')
const addForm = reactive({ email: '', guests: [{ name: '', isChild: false }] })

function openAddModal() {
  addForm.email = ''
  addForm.guests = [{ name: '', isChild: false }]
  addModalError.value = ''
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
}

async function submitAddModal() {
  addModalError.value = ''
  if (!addForm.email.trim()) {
    addModalError.value = 'Email adresa je obavezna.'
    return
  }
  if (!addForm.guests[0]?.name.trim()) {
    addModalError.value = 'Ime nositelja je obavezno.'
    return
  }
  addModalLoading.value = true
  try {
    await adminApi.addInvitation(projectId, { email: addForm.email, guests: addForm.guests })
    closeAddModal()
    await refresh()
  } catch (err) {
    addModalError.value = err.response?.data?.error || 'Greška pri spremanju.'
  } finally {
    addModalLoading.value = false
  }
}

// Settings state
const settingsLoading = ref(false)
const saving = ref(false)
const saveMessage = ref('')
const saveError = ref(false)
const uploading = reactive({ emailHeaderImageUrl: false, pageHeaderImageUrl: false })

const form = reactive({
  emailSubject: '', emailHeading: '', emailEventName: '', emailEventDate: '',
  emailEventLocation: '', emailBodyText: '', emailAccentColor: '', emailHeaderImageUrl: '',
  pageHeading: '', pageEventName: '', pageEventDate: '', pageEventLocation: '',
  pageWelcomeText: '', pageAccentColor: '', pageHeaderImageUrl: '',
  designTemplate: 'classic'
})

function inviteUrl(token) {
  return `${window.location.origin}/invite?token=${token}`
}

function copyLink(token) {
  navigator.clipboard.writeText(inviteUrl(token))
  copiedToken.value = token
  setTimeout(() => copiedToken.value = null, 2000)
}

function whatsappLink(group) {
  const url = inviteUrl(group.token)

  const primary = group.guests.find(g => g.isPrimary) || group.guests[0]
  const originalGuests = group.guests.filter(g => !g.addedByGuest)
  const isFamily = originalGuests.length > 1

  let greeting
  if (isFamily) {
    const parts = primary.name.trim().split(/\s+/)
    const surname = parts.length > 1 ? parts[parts.length - 1] : parts[0]
    greeting = `Pozivamo vas obitelji ${surname}`
  } else {
    const firstName = primary.name.trim().split(/\s+/)[0]
    greeting = `Draga/i ${firstName}`
  }

  const variants = [
    `${greeting},\n\njedva čekamo proslaviti ovaj sretan dan u vašem društvu! 💍\n\nVaša pozivnica čeka vas ovdje:\n${url}`,
    `${greeting},\n\nradujemo se što ćemo ovaj poseban dan proslaviti zajedno s vama! 🥂\n\nVaša osobna pozivnica:\n${url}`,
    `${greeting},\n\nbit ćemo presretni imati vas uz nas na našem velikom danu! 💐\n\nKliknite na svoju pozivnicu:\n${url}`,
    `${greeting},\n\nnaše vjenčanje ne bi bilo potpuno bez vas! 🌸\n\nOvdje možete pronaći svoju pozivnicu:\n${url}`,
  ]

  const msg = variants[Math.floor(Math.random() * variants.length)]
  return `https://wa.me/?text=${encodeURIComponent(msg)}`
}

const statusLabels = {
  PENDING: 'Čeka',
  ATTENDING: 'Dolazi',
  NOT_ATTENDING: 'Ne dolazi',
  MAYBE: 'Možda'
}

const stats = computed(() => {
  if (!invitations.value.length) return null
  const allGuests = invitations.value.flatMap(g => g.guests)
  return {
    totalGroups: invitations.value.length,
    totalGuests: allGuests.length,
    sent: invitations.value.filter(i => i.emailSent).length,
    attending: allGuests.filter(g => g.status === 'ATTENDING').length,
    maybe: allGuests.filter(g => g.status === 'MAYBE').length,
    notAttending: allGuests.filter(g => g.status === 'NOT_ATTENDING').length
  }
})

async function refresh() {
  tableLoading.value = true
  try {
    const data = await adminApi.getInvitations(projectId)
    invitations.value = data
  } finally {
    tableLoading.value = false
  }
}

async function sendAll() {
  sendingAll.value = true
  sendResult.value = null
  try {
    sendResult.value = await adminApi.sendInvitations(projectId)
    await refresh()
  } finally {
    sendingAll.value = false
  }
}

async function remove(id) {
  if (!confirm('Sigurno želite obrisati ovu pozivnicu?')) return
  await adminApi.deleteInvitation(projectId, id)
  await refresh()
}

function onCsvUploaded() {
  refresh()
}

function logout() {
  authStore.logout()
  router.push('/login')
}

async function openSettings() {
  activeTab.value = 'settings'
  if (settingsLoading.value) return
  settingsLoading.value = true
  try {
    const data = await adminApi.getProjectSettings(projectId)
    Object.keys(form).forEach(k => {
      if (k === 'designTemplate') {
        form[k] = data[k] || 'classic'
      } else {
        form[k] = data[k] || ''
      }
    })
  } finally {
    settingsLoading.value = false
  }
}

async function handleImageUpload(event, field) {
  const file = event.target.files[0]
  if (!file) return
  uploading[field] = true
  try {
    const url = await uploadImage(projectId, file)
    form[field] = url
  } catch (err) {
    alert('Upload slike nije uspio: ' + err.message)
  } finally {
    uploading[field] = false
    event.target.value = ''
  }
}

async function saveSettings() {
  saving.value = true
  saveMessage.value = ''
  saveError.value = false
  try {
    await adminApi.updateProjectSettings(projectId, { ...form })
    saveMessage.value = 'Postavke su spremljene.'
    setTimeout(() => saveMessage.value = '', 3000)
  } catch (err) {
    saveError.value = true
    saveMessage.value = 'Greška pri spremanju: ' + (err.response?.data?.error || err.message)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const projects = await adminApi.getProjects()
  const project = projects.find(p => p.id === projectId)
  if (project) projectName.value = project.name
  await refresh()
})
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

.back-link {
  font-size: 14px;
  color: var(--purple);
  text-decoration: none;
  display: inline-block;
  margin-bottom: 8px;
}

.back-link:hover { text-decoration: underline; }

.admin-header h1 {
  font-size: 36px;
  color: var(--purple-dark);
}

.subtitle {
  color: var(--text-light);
  margin-top: 4px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border-top: 4px solid var(--purple-light);
}

.stat-card--sent { border-top-color: #90cdf4; }
.stat-card--attending { border-top-color: #9ae6b4; }
.stat-card--maybe { border-top-color: #a3bffa; }
.stat-card--not-attending { border-top-color: #feb2b2; }

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: var(--purple-dark);
  font-family: 'Playfair Display', serif;
}

.stat-label {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0eee8;
}

.tab-btn {
  padding: 10px 20px;
  border: none;
  background: none;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-light);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.15s;
}

.tab-btn:hover { color: var(--purple); }
.tab-btn.active { color: var(--purple-dark); border-bottom-color: var(--purple); }

.actions-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 24px;
}

.action-group h3 {
  font-size: 16px;
  color: var(--purple-dark);
  margin-bottom: 6px;
}

.hint {
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 12px;
}

.hint code {
  background: var(--purple-light);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.table-section {
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

.text-success { color: var(--success); font-weight: 500; }
.text-muted { color: var(--text-light); }

.group-row td { vertical-align: top; padding: 14px 12px; }

.group-guests {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.guest-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.primary-tag {
  font-size: 11px;
  color: var(--purple);
  background: var(--purple-light);
  padding: 1px 7px;
  border-radius: 50px;
}

.email-cell {
  font-size: 13px;
  color: var(--text-light);
  word-break: break-all;
}

.link-cell { white-space: nowrap; }

.link-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: white;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  color: var(--text);
  transition: all 0.15s;
}

.btn-icon:hover { background: var(--bg); border-color: var(--purple); }

.btn-icon--wa {
  background: #25d366;
  border-color: #25d366;
  color: white;
  font-size: 11px;
  font-weight: 700;
}

.btn-icon--wa:hover { background: #1ebe5d; border-color: #1ebe5d; }

/* Settings */
.settings-card {
  padding: 32px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.settings-section {
  margin-bottom: 40px;
}

.settings-section h3 {
  font-size: 18px;
  color: var(--purple-dark);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0eee8;
}

.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-light);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.field input[type="text"],
.field textarea {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.field input[type="text"]:focus,
.field textarea:focus {
  border-color: var(--purple);
}

.field textarea {
  resize: vertical;
}

.color-input-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.color-text {
  flex: 1;
}

.color-swatch {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  flex-shrink: 0;
  transition: background 0.2s;
}

.upload-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-status {
  font-size: 13px;
  color: var(--purple);
}

.image-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.image-preview img {
  max-height: 80px;
  max-width: 200px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  object-fit: cover;
}

.btn-remove-img {
  font-size: 12px;
  color: #e53e3e;
  background: none;
  border: 1px solid #e53e3e;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
}

.btn-remove-img:hover { background: #fff5f5; }

.settings-hint {
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 20px;
}

.template-picker {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.template-option {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.template-option:hover { border-color: var(--purple-light); }
.template-option.selected { border-color: var(--purple); background: var(--purple-light); }

.template-preview {
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
  height: 100px;
  border: 1px solid #e5e7eb;
}

.template-preview--classic {
  background: #2d1b4e;
  display: flex;
  flex-direction: column;
}

.template-preview--classic .tp-header {
  height: 36px;
  background: linear-gradient(135deg, #2d1b4e, #5c3d8f);
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-preview--classic .tp-body {
  flex: 1;
  background: white;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
}

.template-preview--elegant {
  background: #fff;
  display: flex;
  flex-direction: column;
}

.template-preview--elegant .tp-hero {
  height: 36px;
  background: #c8bfaf;
}

.template-preview--elegant .tp-body {
  flex: 1;
  background: white;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  justify-content: center;
}

.tp-monogram {
  width: 20px;
  height: 20px;
  background: #e8e2d9;
  border-radius: 2px;
}

.tp-line {
  height: 3px;
  background: #e5e7eb;
  border-radius: 2px;
  width: 100%;
}
.tp-line--wide { width: 90%; }
.tp-line--short { width: 60%; }
.tp-line--thin { height: 2px; background: #d4c9b9; }

.template-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--purple-dark);
  margin-bottom: 4px;
}

.template-radio {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  flex-shrink: 0;
  transition: all 0.15s;
}

.template-radio.active {
  border-color: var(--purple);
  background: var(--purple);
  box-shadow: inset 0 0 0 3px white;
}

.template-desc {
  font-size: 12px;
  color: var(--text-light);
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 500px) {
  .template-picker { grid-template-columns: 1fr; }
}

.settings-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 8px;
  border-top: 1px solid #f0eee8;
}

.row-actions {
  display: flex;
  gap: 6px;
  white-space: nowrap;
}

.table-header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-card {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0eee8;
}

.modal-header h3 {
  font-size: 18px;
  color: var(--purple-dark);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 16px;
  color: var(--text-light);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  line-height: 1;
}

.modal-close:hover { background: #f0eee8; color: var(--text); }

.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px 20px;
  border-top: 1px solid #f0eee8;
}

.guest-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.guest-row-input {
  display: flex;
  gap: 8px;
  align-items: center;
}

.guest-row-input input {
  flex: 1;
  padding: 9px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.guest-row-input input:focus { border-color: var(--purple); }

.child-toggle {
  padding: 6px 10px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-light);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  user-select: none;
}

.child-toggle.active {
  border-color: #5a67d8;
  background: #ebf4ff;
  color: #2b6cb0;
}

.btn-remove-row {
  background: none;
  border: none;
  color: #e53e3e;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 6px;
  border-radius: 6px;
  line-height: 1;
  flex-shrink: 0;
}

.btn-remove-row:hover { background: #fff5f5; }

@media (max-width: 640px) {
  .actions-row { grid-template-columns: 1fr; }
  .header-row { flex-direction: column; gap: 12px; }
}
</style>
