<template>
  <div v-if="store.loading" class="loading-state">
    <div class="spinner"></div>
    <p>Učitavanje pozivnice...</p>
  </div>

  <div v-else-if="store.error" class="error-state">
    <div class="error-icon">✉</div>
    <h2>Pozivnica nije pronađena</h2>
    <p>{{ store.error }}</p>
  </div>

  <ElegantInvitation v-else-if="store.group && isElegant" :token="token" />
  <ClassicInvitation v-else-if="store.group"              :token="token" />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useInvitationStore } from '../stores/invitation.js'
import ClassicInvitation from '../components/ClassicInvitation.vue'
import ElegantInvitation from '../components/ElegantInvitation.vue'

const route = useRoute()
const store = useInvitationStore()
const token = route.query.token

const isElegant = computed(() => store.group?.project?.designTemplate === 'elegant')

onMounted(() => {
  if (token) {
    store.fetchInvitation(token)
  } else {
    store.error = 'Token nije pronađen u linku'
  }
})
</script>

<style scoped>
.loading-state {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f4f0eb;
  color: #888;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #555;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-state {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
  background: #f4f0eb;
}

.error-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.3; }
</style>
