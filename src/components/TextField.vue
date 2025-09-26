<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: string;
  type?: string;
  label?: string;
  placeholder?: string;
  error?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>();

const inputType = computed(() => props.type || 'text');

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
}
</script>

<template>
  <label class="tf">
    <span v-if="label" class="tf__label">{{ label }}</span>
    <input :type="inputType" class="tf__input" :placeholder="placeholder" :value="modelValue" @input="onInput" />
    <span v-if="error" class="tf__error">{{ error }}</span>
  </label>
  
</template>

<style scoped>
.tf { display: flex; flex-direction: column; gap: 6px; }
.tf__label { font-weight: 600; color: #111827; font-size: 13px; }
.tf__input {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  background: #fff;
  transition: box-shadow .2s, border-color .2s;
}
.tf__input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}
.tf__error { color: #dc2626; font-size: 12px; }
</style>


