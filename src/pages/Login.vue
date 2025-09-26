<script setup lang="ts">
import { ref } from 'vue';
import { loginApi } from '../lib/auth';
import { useRouter } from 'vue-router';
import AuthCard from '../components/AuthCard.vue';
import TextField from '../components/TextField.vue';
import PrimaryButton from '../components/PrimaryButton.vue';

const router = useRouter();
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const fieldErrors = ref<Record<string, string>>({});

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    const token = await loginApi(username.value, password.value);
    localStorage.setItem('token', token);
    router.replace('/');
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Đăng nhập thất bại';
    fieldErrors.value = (e?.response?.data?.errors) || {};
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthCard title="Chào mừng trở lại" subtitle="Đăng nhập để tiếp tục">
    <div style="display:flex;flex-direction:column;gap:12px;">
      <TextField v-model="username" label="Username" placeholder="Nhập username" :error="fieldErrors.username" />
      <TextField v-model="password" type="password" label="Mật khẩu" placeholder="Nhập mật khẩu" :error="fieldErrors.password" />
      <PrimaryButton :disabled="loading" @click="submit">Đăng nhập</PrimaryButton>
      <p v-if="error" style="color:#c00;margin:0;">{{ error }}</p>
    </div>
    <template #footer>
      <span>Chưa có tài khoản? <router-link to="/register">Đăng ký</router-link></span>
    </template>
  </AuthCard>
  
</template>


