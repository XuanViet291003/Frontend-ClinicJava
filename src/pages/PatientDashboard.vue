&lt;template>
  &lt;div class="min-h-screen bg-gray-100">
    &lt;nav class="bg-white shadow-sm">
      &lt;div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        &lt;div class="flex justify-between h-16">
          &lt;div class="flex">
            &lt;div class="flex-shrink-0 flex items-center">
              &lt;h1 class="text-xl font-bold text-gray-800">Patient Portal&lt;/h1>
            &lt;/div>
          &lt;/div>
          &lt;div class="flex items-center space-x-4">
            &lt;router-link
              to="/notifications"
              class="text-gray-600 hover:text-gray-900 relative"
            >
              Notifications
              &lt;span
                v-if="unreadNotifications > 0"
                class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center"
              >
                {{ unreadNotifications }}
              &lt;/span>
            &lt;/router-link>
            &lt;button @click="logout" class="text-gray-600 hover:text-gray-900">
              Logout
            &lt;/button>
          &lt;/div>
        &lt;/div>
      &lt;/div>
    &lt;/nav>

    &lt;div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      &lt;div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Appointments Card -->
        &lt;div class="bg-white overflow-hidden shadow rounded-lg">
          &lt;div class="p-5">
            &lt;h3 class="text-lg font-medium text-gray-900">My Appointments&lt;/h3>
            &lt;div class="mt-4 space-y-2">
              &lt;router-link
                to="/appointments"
                class="block text-sm text-blue-600 hover:text-blue-800"
              >
                View All Appointments
              &lt;/router-link>
              &lt;router-link
                to="/appointments/create"
                class="block text-sm text-blue-600 hover:text-blue-800"
              >
                Schedule New Appointment
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
                to="/medical-records"
                class="block text-sm text-blue-600 hover:text-blue-800"
              >
                View Medical History
              &lt;/router-link>
            &lt;/div>
          &lt;/div>
        &lt;/div>

        <!-- Payments Card -->
        &lt;div class="bg-white overflow-hidden shadow rounded-lg">
          &lt;div class="p-5">
            &lt;h3 class="text-lg font-medium text-gray-900">Payments&lt;/h3>
            &lt;div class="mt-4">
              &lt;dl class="grid grid-cols-1 gap-4">
                &lt;div class="sm:col-span-1">
                  &lt;dt class="text-sm font-medium text-gray-500">Pending Payments&lt;/dt>
                  &lt;dd class="mt-1 text-lg text-gray-900">{{ payments.pendingPayments }}&lt;/dd>
                &lt;/div>
                &lt;router-link
                  to="/payments"
                  class="mt-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  View Payment History
                &lt;/router-link>
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
const unreadNotifications = ref(0)
const payments = ref({
  pendingPayments: 0
})

const handleLogout = async () => {
  await logout()
  router.push('/login')
}

// Fetch dashboard data
onMounted(async () => {
  // TODO: Implement API calls to fetch notifications and payments
  unreadNotifications.value = 0
  payments.value = {
    pendingPayments: 0
  }
})
&lt;/script>