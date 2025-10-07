<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../lib/auth';
import AuthCard from '../components/AuthCard.vue';
import TextField from '../components/TextField.vue';
import PrimaryButton from '../components/PrimaryButton.vue';

const auth = useAuth();
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const fieldErrors = ref<Record<string, string>>({});
const success = ref('');

async function submit() {
  if (!username.value || !password.value) {
    error.value = 'Vui lòng nhập username và mật khẩu';
    return;
  }

  loading.value = true;
  error.value = '';
  fieldErrors.value = {};

  try {
    await auth.login({
      username: username.value,
      password: password.value
    });
    
    success.value = 'Đăng nhập thành công';
    // Router navigation is handled by auth service
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Đăng nhập thất bại';
    if (e?.response?.data?.errors) {
      fieldErrors.value = e.response.data.errors;
    }
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
  <p v-if="success" style="color:#090;margin:0">{{ success }}</p>
      <p v-if="error" style="color:#c00;margin:0;">{{ error }}</p>
    </div>
    <template #footer>
      <span>Chưa có tài khoản? <router-link to="/register">Đăng ký</router-link></span>
    </template>
  </AuthCard>
  
</template>


