<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function logout() {
  localStorage.removeItem('token');
  router.replace('/login');
}
</script>

<template>
  <div style="padding:24px;">
    <h2>Home</h2>
    <p>Bạn đã đăng nhập.</p>
    <button @click="logout">Đăng xuất</button>
  </div>
</template>


