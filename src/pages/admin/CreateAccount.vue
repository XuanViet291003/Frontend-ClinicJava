<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:flex lg:items-center lg:justify-between mb-6">
          <div class="min-w-0 flex-1">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight">Create Account</h2>
          </div>
        </div>

        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <form @submit.prevent="handleSubmit">
              <div class="grid grid-cols-1 gap-6">
                <div>
                  <TextField v-model="form.username" label="Username" :error="errors.username" required autofocus @blur="validateUsername" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <TextField v-model="form.firstName" label="First Name" :error="errors.firstName" required @blur="validateFirstName" />
                  </div>
                  <div>
                    <TextField v-model="form.lastName" label="Last Name" :error="errors.lastName" required @blur="validateLastName" />
                  </div>
                </div>

                <div>
                  <TextField v-model="form.email" type="email" label="Email" :error="errors.email" required @blur="validateEmail" />
                </div>

                <div>
                  <TextField type="password" v-model="form.password" label="Password" :error="errors.password" required @blur="validatePassword" />
                  <p class="mt-1 text-sm text-gray-500">Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select v-model="form.role" class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" required>
                    <option value="DOCTOR">Doctor</option>
                    <option value="PATIENT">Patient</option>
                  </select>
                </div>

                <div v-if="serverError" class="rounded-md bg-red-50 p-4">
                  <div class="flex">
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-red-800">{{ serverError }}</h3>
                    </div>
                  </div>
                </div>

                <div class="flex justify-end">
                  <PrimaryButton type="submit" :disabled="loading || !isValid" class="w-full md:w-auto">
                    <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ loading ? 'Creating Account...' : 'Create Account' }}
                  </PrimaryButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import TextField from '../../components/TextField.vue'
import PrimaryButton from '../../components/PrimaryButton.vue'
import * as accountService from '../../lib/account'
import type { AccountCreateRequest } from '../../lib/account'

interface FormData {
  username: string
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'DOCTOR' | 'PATIENT'
}

interface FormErrors {
  username?: string
  firstName?: string
  lastName?: string
  email?: string
  password?: string
}

const router = useRouter()
const loading = ref(false)
const serverError = ref('')

const form = ref<FormData>({
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'PATIENT'
})

const errors = ref<FormErrors>({})

const validateUsername = () => {
  const value = form.value.username.trim()
  if (!value) errors.value.username = 'Username is required'
  else if (value.length < 3) errors.value.username = 'Username must be at least 3 characters'
  else if (!/^[a-zA-Z0-9_]+$/.test(value)) errors.value.username = 'Username can only contain letters, numbers, and underscores'
  else errors.value.username = undefined
}

const validateFirstName = () => {
  const value = form.value.firstName.trim()
  if (!value) errors.value.firstName = 'First name is required'
  else if (value.length < 2) errors.value.firstName = 'First name must be at least 2 characters'
  else errors.value.firstName = undefined
}

const validateLastName = () => {
  const value = form.value.lastName.trim()
  if (!value) errors.value.lastName = 'Last name is required'
  else if (value.length < 2) errors.value.lastName = 'Last name must be at least 2 characters'
  else errors.value.lastName = undefined
}

const validateEmail = () => {
  const value = form.value.email.trim()
  if (!value) errors.value.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.value.email = 'Please enter a valid email address'
  else errors.value.email = undefined
}

const validatePassword = () => {
  const value = form.value.password
  if (!value) errors.value.password = 'Password is required'
  else if (value.length < 8) errors.value.password = 'Password must be at least 8 characters'
  else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) errors.value.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  else errors.value.password = undefined
}

const validateForm = () => { validateUsername(); validateFirstName(); validateLastName(); validateEmail(); validatePassword(); }

const isValid = computed(() => !errors.value.username && !errors.value.firstName && !errors.value.lastName && !errors.value.email && !errors.value.password && form.value.username && form.value.firstName && form.value.lastName && form.value.email && form.value.password)

const handleSubmit = async () => {
  validateForm()
  if (!isValid.value) return
  try {
    loading.value = true
    serverError.value = ''
    const payload: AccountCreateRequest = {
      username: form.value.username.trim(),
      password: form.value.password,
      fullName: `${form.value.firstName.trim()} ${form.value.lastName.trim()}`.trim(),
      email: form.value.email.trim(),
      role: form.value.role
    }
    await accountService.createAccount(payload)
    router.push('/admin/accounts')
  } catch (e) {
    serverError.value = e instanceof Error ? e.message : 'Failed to create account. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>