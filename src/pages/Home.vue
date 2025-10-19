<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const router = useRouter();
const token = ref(localStorage.getItem('token'));

function logout() {
  console.log('this?')
  // localStorage.removeItem('token');
  // token.value = null;
  router.replace('/login').then(() => {
    localStorage.removeItem('token');
    token.value = null;
  });
}
function goAppointments(){
  router.push('/appointments');
}
function goNotifications(){
  router.push('/notifications');
}
function goMedicalRecords(){
  router.push('/medical-records');
}
</script>

<template>
  <div style="padding:24px;">
    <h2>Home</h2>
    <p>Bạn đã đăng nhập.</p>
    <div style="display:flex;gap:12px;margin-bottom:12px;">
      <button @click="goAppointments">Quản lý Appointments</button>
      <button @click="goNotifications">Thông báo</button>
      <button @click="goMedicalRecords">Bệnh án</button>
      <button @click="logout">Đăng xuất</button>
    </div>
  </div>
</template>



