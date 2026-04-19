<template>
  <div class="upload-csv">
    <div
      class="drop-zone"
      :class="{ dragging }"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
      @click="triggerInput"
    >
      <input ref="input" type="file" accept=".csv" style="display:none" @change="onFileChange" />
      <div class="drop-icon">📎</div>
      <p>Kliknite ili prevucite CSV datoteku</p>
      <p class="drop-hint">Stupci: name, email</p>
    </div>

    <Transition name="fade">
      <div v-if="result" class="alert" :class="result.errors?.length ? 'alert-error' : 'alert-success'">
        Dodano: {{ result.created }} | Preskočeno: {{ result.skipped }}
        <template v-if="result.errors?.length">
          <br>Greške: {{ result.errors.join(', ') }}
        </template>
      </div>
    </Transition>

    <div v-if="uploading" class="uploading">Uvoz u tijeku...</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ adminApi: Object, projectId: String })
const emit = defineEmits(['uploaded'])

const input = ref(null)
const dragging = ref(false)
const uploading = ref(false)
const result = ref(null)

function triggerInput() { input.value.click() }

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) upload(file)
}

function onDrop(e) {
  dragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) upload(file)
}

async function upload(file) {
  uploading.value = true
  result.value = null
  try {
    result.value = await props.adminApi.uploadCsv(props.projectId, file)
    emit('uploaded')
  } catch (err) {
    result.value = { created: 0, skipped: 0, errors: ['Greška pri uvozu: ' + (err.response?.data?.error || err.message)] }
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.drop-zone {
  border: 2px dashed var(--purple-light);
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafaf8;
}

.drop-zone:hover, .drop-zone.dragging {
  border-color: var(--purple);
  background: var(--purple-light);
}

.drop-icon { font-size: 28px; margin-bottom: 8px; }

p { font-size: 14px; color: var(--text-light); margin: 4px 0; }

.drop-hint { font-size: 12px; }

.uploading {
  text-align: center;
  color: var(--text-light);
  font-size: 13px;
  margin-top: 8px;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
