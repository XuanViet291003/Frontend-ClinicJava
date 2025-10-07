&lt;template>
  &lt;div class="min-h-screen bg-gray-100">
    &lt;div class="py-6">
      &lt;div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        &lt;div class="lg:flex lg:items-center lg:justify-between">
          &lt;div class="min-w-0 flex-1">
            &lt;h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              My Patients
            &lt;/h2>
          &lt;/div>
        &lt;/div>

        &lt;!-- Error Alert -->
        &lt;div v-if="error" class="mt-4 rounded-md bg-red-50 p-4">
          &lt;div class="flex">
            &lt;div class="flex-shrink-0">
              &lt;svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                &lt;path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
              &lt;/svg>
            &lt;/div>
            &lt;div class="ml-3">
              &lt;h3 class="text-sm font-medium text-red-800">{{ error }}&lt;/h3>
            &lt;/div>
            &lt;div class="ml-auto pl-3">
              &lt;div class="-mx-1.5 -my-1.5">
                &lt;button
                  type="button"
                  @click="error = ''"
                  class="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
                >
                  &lt;span class="sr-only">Dismiss&lt;/span>
                  &lt;svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    &lt;path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  &lt;/svg>
                &lt;/button>
              &lt;/div>
            &lt;/div>
          &lt;/div>
        &lt;/div>
        
        &lt;div class="mt-8 flow-root">
          &lt;div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            &lt;div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              &lt;!-- Loading State -->
              &lt;div v-if="loading" class="flex justify-center py-8">
                &lt;svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  &lt;circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">&lt;/circle>
                  &lt;path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">&lt;/path>
                &lt;/svg>
              &lt;/div>

              &lt;!-- Empty State -->
              &lt;div v-else-if="!patients.length" class="text-center py-8">
                &lt;svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  &lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                &lt;/svg>
                &lt;h3 class="mt-2 text-sm font-medium text-gray-900">No patients found&lt;/h3>
                &lt;p class="mt-1 text-sm text-gray-500">You haven't treated any patients yet.&lt;/p>
              &lt;/div>

              &lt;!-- Patient List -->
              &lt;table v-else class="min-w-full divide-y divide-gray-300">
                &lt;thead>
                  &lt;tr>
                    &lt;th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Patient Name&lt;/th>
                    &lt;th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contact&lt;/th>
                    &lt;th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Visit&lt;/th>
                    &lt;th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Next Appointment&lt;/th>
                    &lt;th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
                      &lt;span class="sr-only">Actions&lt;/span>
                    &lt;/th>
                  &lt;/tr>
                &lt;/thead>
                &lt;tbody class="divide-y divide-gray-200">
                  &lt;tr v-for="patient in patients" :key="patient.id">
                    &lt;td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                      &lt;div class="font-medium text-gray-900">{{ patient.name }}&lt;/div>
                      &lt;div class="text-gray-500">Age: {{ patient.age }}&lt;/div>
                    &lt;/td>
                    &lt;td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      &lt;div>{{ patient.phone }}&lt;/div>
                      &lt;div>{{ patient.email }}&lt;/div>
                    &lt;/td>
                    &lt;td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {{ patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'No visits yet' }}
                    &lt;/td>
                    &lt;td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      &lt;div v-if="patient.nextAppointment" class="text-green-600">
                        {{ new Date(patient.nextAppointment).toLocaleDateString() }}
                      &lt;/div>
                      &lt;div v-else class="text-gray-500">
                        No upcoming appointments
                      &lt;/div>
                    &lt;/td>
                    &lt;td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      &lt;router-link
                        :to="`/medical-records/${patient.id}`"
                        class="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View Records
                      &lt;/router-link>
                      &lt;router-link
                        :to="`/appointments/create?patientId=${patient.id}`"
                        class="text-indigo-600 hover:text-indigo-900"
                      >
                        Schedule Appointment
                      &lt;/router-link>
                    &lt;/td>
                  &lt;/tr>
                &lt;/tbody>
              &lt;/table>
            &lt;/div>
          &lt;/div>
        &lt;/div>
      &lt;/div>
    &lt;/div>
  &lt;/div>
&lt;/template>

&lt;script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as appointmentService from '@/lib/appointments';
import * as accountService from '@/lib/account';
import { useAuth } from '@/lib/auth';

interface Patient {
  id: number;
  name: string;
  age: number;
  phone: string;
  email: string;
  lastVisit?: string;
  nextAppointment?: string;
}

const auth = useAuth();
const patients = ref&lt;Patient[]>([]);
const loading = ref(false);
const error = ref('');

const fetchPatients = async () => {
  if (!auth.user.value?.id) return;
  
  try {
    loading.value = true;
    error.value = '';
    
    // Get all appointments for the doctor
    const doctorAppointments = await appointmentService.getDoctorAppointments(auth.user.value.id);
    
    // Extract unique patient IDs
    const patientIds = [...new Set(doctorAppointments.map(apt => apt.patientId))];
    
    // Get patient details
    const patientDetails = await Promise.all(
      patientIds.map(id => accountService.getAccountById(id))
    );
    
    // Process and map patient data with their latest and next appointments
    patients.value = patientDetails.map(patient => {
      const patientAppointments = doctorAppointments
        .filter(apt => apt.patientId === patient.id)
        .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
      
      const lastVisit = patientAppointments
        .find(apt => apt.status === 'COMPLETED')
        ?.appointmentDate;
        
      const nextAppointment = patientAppointments
        .find(apt => ['PENDING', 'CONFIRMED'].includes(apt.status))
        ?.appointmentDate;
      
      return {
        id: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
        age: patient.age || 0,
        phone: patient.phone || '',
        email: patient.email,
        lastVisit,
        nextAppointment
      };
    });
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load patients';
    console.error('Error fetching patients:', e);
  } finally {
    loading.value = false;
  }
};

// Watch for auth changes and fetch patients when ready
onMounted(() => {
  if (auth.user.value?.id) {
    fetchPatients();
  } else {
    const unwatch = auth.$subscribe(() => {
      if (auth.user.value?.id) {
        fetchPatients();
        unwatch();
      }
    });
  }
});
&lt;/script>