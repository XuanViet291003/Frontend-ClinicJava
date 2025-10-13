<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">    <AuthCard title="Admin Portal">
ate>

      <div v-if="error" class="mb-4 text-sm text-red-600">{{ error }}</div>

      <form @submit.prevent="handleLogin">
        <TextField id="username" type="text" v-model="form.username" label="Username" required autofocus />
        <div class="mt-4">
          <TextField id="password" type="password" v-model="form.password" label="Password" required />
        </div>
        <div class="mt-6">
          <PrimaryButton :class="{ 'opacity-25': loading }" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Log in' }}
          </PrimaryButton>
        </div>
      </form>
    </AuthCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthCard from '../components/AuthCard.vue'
import TextField from '../components/TextField.vue'
import PrimaryButton from '../components/PrimaryButton.vue'
import { useAuth } from '../lib/auth'

const router = useRouter()
const { login, user } = useAuth()
const loading = ref(false)
const error = ref('')

const form = ref({ username: '', password: '' })

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await login({ username: form.value.username, password: form.value.password })
    if (user.value?.role === 'ADMIN') router.push('/admin/dashboard')
    else error.value = 'Invalid admin credentials'
  } catch (e) {
    error.value = 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script> = await login(form.value.username, form.value.password)
    if (response.role === 'ADMIN') {
      router.push('/admin/dashboard')
    } else {
      error.value = 'Invalid admin credentials'
    }
  } catch (e) {
    error.value = 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
&lt;/script>