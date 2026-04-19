<template>
  <div class="rsvp-buttons">
    <button
      v-for="option in options"
      :key="option.value"
      class="rsvp-btn"
      :class="[`rsvp-btn--${option.value.toLowerCase()}`, { active: modelValue === option.value }]"
      :disabled="loading"
      @click="$emit('update:modelValue', option.value)"
    >
      <span class="rsvp-icon">{{ option.icon }}</span>
      <span>{{ option.label }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  loading: Boolean
})

defineEmits(['update:modelValue'])

const options = [
  { value: 'ATTENDING', icon: '✓', label: 'Dolazim' },
  { value: 'NOT_ATTENDING', icon: '✗', label: 'Ne mogu doći' },
  { value: 'MAYBE', icon: '?', label: 'Možda' }
]
</script>

<style scoped>
.rsvp-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.rsvp-btn {
  flex: 1;
  min-width: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 12px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  background: white;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  transition: all 0.2s;
  cursor: pointer;
}

.rsvp-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.rsvp-btn .rsvp-icon {
  font-size: 22px;
  font-weight: bold;
}

.rsvp-btn--attending.active, .rsvp-btn--attending:hover {
  border-color: #38a169;
  background: #f0fff4;
  color: #276749;
}

.rsvp-btn--not_attending.active, .rsvp-btn--not_attending:hover {
  border-color: #e53e3e;
  background: #fff5f5;
  color: #9b2c2c;
}

.rsvp-btn--maybe.active, .rsvp-btn--maybe:hover {
  border-color: #5a67d8;
  background: #ebf4ff;
  color: #2b6cb0;
}
</style>
