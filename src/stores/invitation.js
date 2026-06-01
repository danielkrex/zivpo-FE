import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth.js'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
})

export const useInvitationStore = defineStore('invitation', () => {
  const group = ref(null)   // { id, guests: [{ id, name, isPrimary, status, respondedAt }] }
  const loading = ref(false)
  const rsvpLoading = ref(false)
  const error = ref(null)

  async function fetchInvitation(token) {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get(`/invitation/${token}`)
      group.value = data
    } catch (err) {
      error.value = err.response?.data?.error || 'Pozivnica nije pronađena'
    } finally {
      loading.value = false
    }
  }

  // Ažurira RSVP za jednog gosta
  async function updateRsvp(token, guestId, status) {
    rsvpLoading.value = true
    error.value = null
    try {
      const { data } = await api.put(`/invitation/${token}/rsvp`, { guestId, status })
      group.value = data
      return true
    } catch (err) {
      error.value = err.response?.data?.error || 'Greška pri ažuriranju'
      return false
    } finally {
      rsvpLoading.value = false
    }
  }

  async function addGuest(token, name, isChild) {
    rsvpLoading.value = true
    error.value = null
    try {
      const { data } = await api.post(`/invitation/${token}/guest`, { name, isChild })
      group.value = data
      return true
    } catch (err) {
      error.value = err.response?.data?.error || 'Greška pri dodavanju gosta'
      return false
    } finally {
      rsvpLoading.value = false
    }
  }

  return { group, loading, rsvpLoading, error, fetchInvitation, updateRsvp, addGuest }
})

export function useAdminApi() {
  function headers() {
    return useAuthStore().authHeaders()
  }

  async function getProjects() {
    const { data } = await api.get('/admin/projects', { headers: headers() })
    return data
  }

  async function getInvitations(projectId) {
    const { data } = await api.get(`/admin/projects/${projectId}/invitations`, { headers: headers() })
    return data
  }

  async function uploadCsv(projectId, file) {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post(`/admin/projects/${projectId}/upload-csv`, form, { headers: headers() })
    return data
  }

  async function sendInvitations(projectId, ids = []) {
    const { data } = await api.post(`/admin/projects/${projectId}/send-invitations`, { ids }, { headers: headers() })
    return data
  }

  async function deleteInvitation(projectId, id) {
    await api.delete(`/admin/projects/${projectId}/invitations/${id}`, { headers: headers() })
  }

  async function resendInvitation(projectId, id) {
    const { data } = await api.post(`/admin/projects/${projectId}/invitations/${id}/send`, {}, { headers: headers() })
    return data
  }

  async function addInvitation(projectId, { email, guests }) {
    const { data } = await api.post(`/admin/projects/${projectId}/invitations`, { email, guests }, { headers: headers() })
    return data
  }

  async function getProjectSettings(projectId) {
    const { data } = await api.get(`/admin/projects/${projectId}/settings`, { headers: headers() })
    return data
  }

  async function updateProjectSettings(projectId, settings) {
    const { data } = await api.put(`/admin/projects/${projectId}/settings`, settings, { headers: headers() })
    return data
  }

  async function toggleWhatsapp(projectId, id) {
    const { data } = await api.patch(`/admin/projects/${projectId}/invitations/${id}/whatsapp`, {}, { headers: headers() })
    return data
  }

  return { getProjects, getInvitations, uploadCsv, sendInvitations, deleteInvitation, resendInvitation, addInvitation, getProjectSettings, updateProjectSettings, toggleWhatsapp }
}
