<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:flex lg:items-center lg:justify-between">
          <div class="min-w-0 flex-1">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Medical Records</h2>
          </div>
        </div>

        <div class="mt-8 flow-root">
          <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div v-if="loading" class="flex justify-center py-8">
                <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>

              <div v-else-if="!records.length" class="text-center py-8">
                <h3 class="mt-2 text-sm font-medium text-gray-900">No records found</h3>
                <p class="mt-1 text-sm text-gray-500">Try adjusting your search.</p>
              </div>

              <div v-else class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table class="min-w-full divide-y divide-gray-300">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Patient</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Doctor</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Symptoms</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="rec in records" :key="rec.medicalRecordId">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">{{ rec.patientName }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ rec.doctorId }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ rec.recordDate }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ rec.symptoms }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { searchMedicalRecords } from '../../lib/medicalRecords';

const records = ref<any[]>([]);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    const res = await searchMedicalRecords({}, 0, 20);
    const data = (res as any)?.content || res;
    records.value = Array.isArray(data) ? data : (data?.content || []);
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>