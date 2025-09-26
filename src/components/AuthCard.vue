<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>();
</script>

<template>
  <div class="auth-card">
    <div class="auth-card__header">
      <h1 class="auth-card__title">{{ title }}</h1>
      <p v-if="subtitle" class="auth-card__subtitle">{{ subtitle }}</p>
    </div>
    <div class="auth-card__body">
      <slot />
    </div>
    <div class="auth-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 420px;
  margin: 56px auto;
  padding: 24px 24px 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}
.auth-card__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #111827;
}
.auth-card__subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #6b7280;
}
.auth-card__body {
  margin-top: 14px;
}
.auth-card__footer {
  margin-top: 14px;
}
</style>


