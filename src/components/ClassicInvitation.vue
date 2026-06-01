<template>
  <div class="invitation-page" :style="pageThemeStyle">
    <div class="invitation-card">

      <!-- Header -->
      <div class="invitation-header" :style="headerStyle">
        <template v-if="project.pageHeaderImageUrl">
          <img :src="project.pageHeaderImageUrl" class="hero-img" :alt="pageHeading" />
          <div class="hero-overlay">
            <h1>{{ pageHeading }}</h1>
          </div>
        </template>
        <template v-else>
          <div class="ornament">✦</div>
          <h1>{{ pageHeading }}</h1>
          <div class="ornament">✦</div>
        </template>
      </div>

      <div class="invitation-body">
        <p class="greeting">
          Dragi/a <strong>{{ primaryGuest?.name }}</strong>
          <template v-if="companions.length">, i pratnja</template>,
        </p>
        <p class="message">
          {{ project.pageWelcomeText || 'Imate čast biti pozvani na naš poseban događaj.\nVaša prisutnost bila bi nam velika čast i radost.' }}
        </p>

        <div v-if="project.pageEventName || project.pageEventDate || project.pageEventLocation" class="event-details">
          <div v-if="project.pageEventName" class="event-detail">
            <span class="event-icon">🎉</span>
            <span>{{ project.pageEventName }}</span>
          </div>
          <div v-if="project.pageEventDate" class="event-detail">
            <span class="event-icon">📅</span>
            <span>{{ project.pageEventDate }}</span>
          </div>
          <div v-if="project.pageEventLocation" class="event-detail">
            <span class="event-icon">📍</span>
            <span>{{ project.pageEventLocation }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <!-- RSVP -->
        <div class="rsvp-section">
          <h3>Potvrda dolaska</h3>
          <p class="rsvp-subtitle">
            {{ store.group.guests.length > 1 ? 'Molimo potvrdite dolazak za svaku osobu:' : 'Molimo odaberite Vaš odgovor:' }}
          </p>

          <div class="guests-list">
            <div v-for="guest in store.group.guests" :key="guest.id" class="guest-row">
              <div class="guest-name">
                {{ guest.name }}
                <span v-if="guest.isPrimary" class="guest-badge badge-primary">nositelj</span>
                <span v-else-if="guest.isChild" class="guest-badge badge-child">dijete</span>
                <span v-else-if="guest.addedByGuest" class="guest-badge badge-companion">pratnja</span>
              </div>
              <div class="rsvp-buttons">
                <button
                  v-for="option in rsvpOptions"
                  :key="option.value"
                  class="rsvp-btn"
                  :class="[`rsvp-btn--${option.value.toLowerCase()}`, { active: guest.status === option.value }]"
                  :disabled="store.rsvpLoading"
                  @click="handleRsvp(guest.id, option.value)"
                >
                  <span class="rsvp-icon">{{ option.icon }}</span>
                  <span>{{ option.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <Transition name="fade">
            <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
          </Transition>
        </div>

        <div class="divider"></div>

        <!-- Add guest -->
        <div v-if="canAddCompanion || canAddChild" class="add-guest-section">
          <h3>{{ canAddCompanion ? 'Pratnja i djeca' : 'Djeca' }}</h3>
          <p class="rsvp-subtitle">
            {{ canAddCompanion
              ? 'Možete dodati pratnju i/ili djecu.'
              : 'Pratnja je već dodana. Možete dodati djecu.' }}
          </p>
          <form class="add-guest-form" @submit.prevent="handleAddGuest">
            <input v-model="newGuestName" type="text" placeholder="Ime i prezime" maxlength="80" />
            <div class="add-guest-type" v-if="canAddCompanion">
              <label :class="{ selected: !newGuestIsChild }" @click="newGuestIsChild = false">
                <span>Pratnja</span>
              </label>
              <label :class="{ selected: newGuestIsChild }" @click="newGuestIsChild = true">
                <span>Dijete</span>
              </label>
            </div>
            <button type="submit" class="btn btn-primary btn-sm" :disabled="!newGuestName.trim() || store.rsvpLoading">
              + Dodaj
            </button>
          </form>
          <Transition name="fade">
            <div v-if="addError" class="alert alert-error">{{ addError }}</div>
          </Transition>
        </div>
      </div>

      <div class="invitation-footer">
        <p>Ova pozivnica je osobna i namijenjena samo Vama{{ companions.length ? ' i Vašoj pratnji' : '' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useInvitationStore } from '../stores/invitation.js'

const props = defineProps({ token: { type: String, required: true } })

const store = useInvitationStore()
const successMessage = ref('')
const newGuestName = ref('')
const newGuestIsChild = ref(false)
const addError = ref('')

const rsvpOptions = [
  { value: 'ATTENDING',     icon: '✓', label: 'Dolazim' },
  { value: 'NOT_ATTENDING', icon: '✗', label: 'Ne dolazim' },
  { value: 'MAYBE',         icon: '?', label: 'Možda' }
]

const project        = computed(() => store.group.project)
const primaryGuest   = computed(() => store.group.guests.find(g => g.isPrimary))
const companions     = computed(() => store.group.guests.filter(g => !g.isPrimary))
const canAddCompanion = computed(() => {
  const guests = store.group.guests
  return guests.length < 3 && !guests.some(g => g.isChild)
})
const canAddChild = computed(() => {
  const guests = store.group.guests
  const hasManualChildren = guests.some(g => g.isChild && !g.addedByGuest)
  const addedChildren = guests.filter(g => g.isChild && g.addedByGuest).length
  return !hasManualChildren && addedChildren < 2
})
const pageHeading    = computed(() => project.value.pageHeading || 'Pozivnica')

const pageThemeStyle = computed(() => {
  const color = project.value.pageAccentColor
  return color ? { '--purple-dark': color, '--purple': color } : {}
})

const headerStyle = computed(() => {
  const color = project.value.pageAccentColor || '#2d1b4e'
  if (project.value.pageHeaderImageUrl) return {}
  return { background: `linear-gradient(135deg, ${color}, ${color}cc)` }
})

async function handleRsvp(guestId, status) {
  const ok = await store.updateRsvp(props.token, guestId, status)
  if (ok) {
    const label = rsvpOptions.find(o => o.value === status)?.label
    successMessage.value = `Hvala! Odgovor "${label}" je zabilježen.`
    setTimeout(() => successMessage.value = '', 3500)
  }
}

async function handleAddGuest() {
  addError.value = ''
  const isChild = canAddCompanion.value ? newGuestIsChild.value : true
  const ok = await store.addGuest(props.token, newGuestName.value, isChild)
  if (ok) {
    newGuestName.value = ''
    newGuestIsChild.value = false
  } else {
    addError.value = store.error
  }
}
</script>

<style scoped>
.invitation-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: radial-gradient(ellipse at top, var(--purple-dark, #2d1b4e) 0%, #1a0a2e 100%);
}

.invitation-card {
  max-width: 580px;
  width: 100%;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.invitation-header {
  background: linear-gradient(135deg, #2d1b4e, #5c3d8f);
  padding: 40px 32px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  position: relative;
}

.hero-img {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  display: block;
  position: absolute;
  inset: 0;
  height: 100%;
}

.hero-overlay {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 40px 32px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5));
}

.hero-overlay h1 {
  color: white;
  font-size: 32px;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

.invitation-header:has(.hero-img) {
  padding: 0;
  min-height: 180px;
}

.invitation-header h1 {
  color: var(--gold);
  font-size: 32px;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.ornament {
  color: var(--gold);
  font-size: 20px;
  opacity: 0.7;
}

.invitation-body { padding: 40px 40px 32px; }

.greeting {
  font-size: 20px;
  color: var(--purple-dark);
  margin-bottom: 12px;
  font-family: 'Playfair Display', serif;
}

.message {
  color: var(--text-light);
  line-height: 1.8;
  font-size: 15px;
  white-space: pre-line;
}

.event-details {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-detail {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: var(--purple-dark);
}

.event-icon { font-size: 18px; flex-shrink: 0; }

.divider {
  height: 1px;
  background: linear-gradient(to right, transparent, var(--purple-light), transparent);
  margin: 28px 0;
}

.rsvp-section h3 { color: var(--purple-dark); margin-bottom: 8px; font-size: 20px; }
.rsvp-subtitle { color: var(--text-light); font-size: 14px; margin-bottom: 20px; }

.guests-list { display: flex; flex-direction: column; gap: 20px; }

.guest-row {
  padding: 16px;
  border: 1px solid #f0eee8;
  border-radius: 12px;
  background: #fafaf8;
}

.guest-name {
  font-weight: 600;
  font-size: 15px;
  color: var(--purple-dark);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.guest-badge {
  font-size: 11px;
  font-weight: 400;
  padding: 2px 8px;
  border-radius: 50px;
}
.badge-primary   { background: var(--purple-light); color: var(--purple); }
.badge-child     { background: #fef9c3; color: #854d0e; }
.badge-companion { background: #dcfce7; color: #166534; }

.rsvp-buttons { display: flex; gap: 8px; }

.rsvp-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  transition: all 0.2s;
  cursor: pointer;
}

.rsvp-btn:hover { transform: translateY(-1px); box-shadow: 0 3px 10px rgba(0,0,0,0.08); }
.rsvp-btn .rsvp-icon { font-size: 18px; font-weight: bold; }

.rsvp-btn--attending.active,     .rsvp-btn--attending:hover     { border-color: #38a169; background: #f0fff4; color: #276749; }
.rsvp-btn--not_attending.active, .rsvp-btn--not_attending:hover { border-color: #e53e3e; background: #fff5f5; color: #9b2c2c; }
.rsvp-btn--maybe.active,         .rsvp-btn--maybe:hover         { border-color: #5a67d8; background: #ebf4ff; color: #2b6cb0; }

.invitation-footer {
  padding: 16px 40px;
  background: var(--bg);
  text-align: center;
  font-size: 12px;
  color: var(--text-light);
  border-top: 1px solid #f0eee8;
}

.add-guest-section h3 { color: var(--purple-dark); margin-bottom: 8px; font-size: 20px; }

.add-guest-form {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 12px;
}

.add-guest-form input {
  flex: 1;
  min-width: 160px;
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  outline: none;
  transition: border-color 0.2s;
}
.add-guest-form input:focus { border-color: var(--purple); }

.add-guest-type { display: flex; gap: 4px; }

.add-guest-type label {
  padding: 8px 14px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  background: white;
}
.add-guest-type label.selected {
  border-color: var(--purple);
  background: var(--purple-light);
  color: var(--purple);
  font-weight: 500;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }
</style>
