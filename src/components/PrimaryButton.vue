<script setup lang="ts">
defineProps<{ disabled?: boolean }>();
</script>

<template>
  <button class="btn" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: transform .06s ease, filter .2s ease;
}
.btn:hover { filter: brightness(1.05); }
.btn:active { transform: translateY(1px); }
.btn:disabled { opacity: .6; cursor: not-allowed; }
</style>


