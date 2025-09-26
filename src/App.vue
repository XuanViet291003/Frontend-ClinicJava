<script setup lang="ts">
</script>

<template>
  <router-view />
  
  <!-- Fallback when router not ready -->
  <div v-if="false">App</div>
  
</template>

<style>
html, body, #app { height: 100%; margin: 0; }
</style>


