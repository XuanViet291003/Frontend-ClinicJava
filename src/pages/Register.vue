<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../lib/auth';
import { useRouter } from 'vue-router';
import AuthCard from '../components/AuthCard.vue';
import TextField from '../components/TextField.vue';
import PrimaryButton from '../components/PrimaryButton.vue';

const { register } = useAuth();

const router = useRouter();
const username = ref('');
const password = ref('');
const email = ref('');
const fullName = ref('');
const success = ref('');
const error = ref('');
const loading = ref(false);
const fieldErrors = ref<Record<string, string>>({});

async function submit() {
  error.value = '';
  success.value = '';
  loading.value = true;
  try {
    const [firstName, lastName] = fullName.value.split(' ');
    success.value = await register({
      username: username.value,
      password: password.value,
      email: email.value,
      firstName: firstName || '',
      lastName: lastName || ''
    });
    setTimeout(() => router.replace('/login'), 600);
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Registration failed';
    fieldErrors.value = (e?.response?.data?.errors) || {};
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthCard title="Tạo tài khoản" subtitle="Nhanh chóng và miễn phí">
    <div style="display:flex;flex-direction:column;gap:12px;">
      <small>Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&)</small>
      <TextField v-model="fullName" label="Họ tên" placeholder="Nhập họ tên" :error="fieldErrors.fullName" />
      <TextField v-model="email" label="Email" placeholder="Nhập email" :error="fieldErrors.email" type="email" />
      <TextField v-model="username" label="Username" placeholder="Nhập username" :error="fieldErrors.username" />
      <TextField v-model="password" type="password" label="Mật khẩu" placeholder="Nhập mật khẩu" :error="fieldErrors.password" />
      <PrimaryButton :disabled="loading" @click="submit">Đăng ký</PrimaryButton>
      <p v-if="error" style="color:#c00;margin:0;">{{ error }}</p>
      <p v-if="success" style="color:#090;margin:0;">{{ success }}</p>
    </div>
    <template #footer>
      <span>Đã có tài khoản? <router-link to="/login">Đăng nhập</router-link></span>
    </template>
  </AuthCard>
</template>


