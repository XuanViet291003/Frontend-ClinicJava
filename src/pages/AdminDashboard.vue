&lt;template>
  &lt;div class="min-h-screen bg-gray-100">
    &lt;nav class="bg-white shadow-sm">
      &lt;div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        &lt;div class="flex justify-between h-16">
          &lt;div class="flex">
            &lt;div class="flex-shrink-0 flex items-center">
              &lt;h1 class="text-xl font-bold text-gray-800">Admin Dashboard&lt;/h1>
            &lt;/div>
          &lt;/div>
          &lt;div class="flex items-center">
            &lt;button @click="logout" class="text-gray-600 hover:text-gray-900">
              Logout
            &lt;/button>
          &lt;/div>
        &lt;/div>
      &lt;/div>
    &lt;/nav>

    &lt;div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      &lt;div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Account Management Card -->
        &lt;div class="bg-white overflow-hidden shadow rounded-lg">
          &lt;div class="p-5">
            &lt;h3 class="text-lg font-medium text-gray-900">Account Management&lt;/h3>
            &lt;div class="mt-4 space-y-2">
              &lt;router-link
                to="/admin/accounts"
                class="block text-sm text-blue-600 hover:text-blue-800"
              >
                View All Accounts
              &lt;/router-link>
              &lt;router-link
                to="/admin/accounts/create"
                class="block text-sm text-blue-600 hover:text-blue-800"
              >
                Create New Account
              &lt;/router-link>
            &lt;/div>
          &lt;/div>
        &lt;/div>

        <!-- Medical Records Card -->
        &lt;div class="bg-white overflow-hidden shadow rounded-lg">
          &lt;div class="p-5">
            &lt;h3 class="text-lg font-medium text-gray-900">Medical Records&lt;/h3>
            &lt;div class="mt-4 space-y-2">
              &lt;router-link
                to="/admin/medical-records"
                class="block text-sm text-blue-600 hover:text-blue-800"
              >
                View All Records
              &lt;/router-link>
            &lt;/div>
          &lt;/div>
        &lt;/div>

        <!-- System Stats Card -->
        &lt;div class="bg-white overflow-hidden shadow rounded-lg">
          &lt;div class="p-5">
            &lt;h3 class="text-lg font-medium text-gray-900">System Overview&lt;/h3>
            &lt;div class="mt-4">
              &lt;dl class="grid grid-cols-1 gap-4">
                &lt;div class="sm:col-span-1">
                  &lt;dt class="text-sm font-medium text-gray-500">Total Users&lt;/dt>
                  &lt;dd class="mt-1 text-lg text-gray-900">{{ stats.totalUsers }}&lt;/dd>
                &lt;/div>
                &lt;div class="sm:col-span-1">
                  &lt;dt class="text-sm font-medium text-gray-500">Total Appointments&lt;/dt>
                  &lt;dd class="mt-1 text-lg text-gray-900">{{ stats.totalAppointments }}&lt;/dd>
                &lt;/div>
              &lt;/dl>
            &lt;/div>
          &lt;/div>
        &lt;/div>
      &lt;/div>
    &lt;/div>
  &lt;/div>
&lt;/template>

&lt;script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '../lib/auth'

const router = useRouter()
const stats = ref({
  totalUsers: 0,
  totalAppointments: 0
})

const handleLogout = async () => {
  await logout()
  router.push('/admin/login')
}

// Fetch dashboard stats
onMounted(async () => {
  // TODO: Implement API calls to fetch stats
  stats.value = {
    totalUsers: 0,
    totalAppointments: 0
  }
})
&lt;/script>