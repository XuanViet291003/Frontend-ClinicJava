<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:flex lg:items-center lg:justify-between">
          <div class="min-w-0 flex-1">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Today's Appointments
            </h2>
          </div>
          <div class="mt-5 flex lg:ml-4 lg:mt-0">
            <span class="hidden sm:block">
              <select v-model="filterStatus" class="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </span>
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

              <div v-else-if="!filteredAppointments.length" class="text-center py-12">
                <h3 class="mt-2 text-sm font-medium text-gray-900">No appointments today</h3>
                <p class="mt-1 text-sm text-gray-500">You have no scheduled appointments for today.</p>
              </div>

              <div v-else class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table class="min-w-full divide-y divide-gray-300">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Time</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Patient</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Age</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Notes</th>
                      <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="appointment in filteredAppointments" :key="appointment.id">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ formatTime(appointment.appointmentDate) }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ appointment.patientName }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ appointment.patientAge }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm">
                        <span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                          :class="{
                            'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-700/10': appointment.status === 'PENDING',
                            'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10': appointment.status === 'IN_PROGRESS',
                            'bg-green-50 text-green-700 ring-1 ring-green-700/10': appointment.status === 'COMPLETED',
                            'bg-red-50 text-red-700 ring-1 ring-red-700/10': appointment.status === 'CANCELLED'
                          }"
                        >
                          {{ formatStatus(appointment.status) }}
                        </span>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ truncateText(appointment.note || 'No notes', 50) }}</td>
                      <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div class="flex justify-end gap-2">
                          <button v-if="appointment.status === 'PENDING'" @click="startAppointment(appointment)" class="text-blue-600 hover:text-blue-900">Start</button>
                          <button v-if="appointment.status === 'IN_PROGRESS'" @click="completeAppointment(appointment)" class="text-green-600 hover:text-green-900">Complete</button>
                          <button v-if="['PENDING', 'IN_PROGRESS'].includes(appointment.status)" @click="confirmCancel(appointment)" class="text-red-600 hover:text-red-900">Cancel</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCancelConfirmation" class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">Cancel Appointment</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button type="button" class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto" @click="cancelAppointment">Cancel Appointment</button>
              <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto" @click="showCancelConfirmation = false">Keep Appointment</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import * as appointmentService from '../../lib/appointments';

type AppointmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
interface Appointment { id: number; appointmentDate: string; patientName: string; patientAge: number; status: AppointmentStatus; note?: string }

const appointments = ref<Appointment[]>([]);
const loading = ref(false);
const error = ref('');
const filterStatus = ref('');
const showCancelConfirmation = ref(false);
const selectedAppointment = ref<Appointment | null>(null);

let updateInterval: number | null = null;

const filteredAppointments = computed(() => filterStatus.value ? appointments.value.filter(a => a.status === filterStatus.value) : appointments.value);

const formatTime = (date: string) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const formatStatus = (status: AppointmentStatus) => ({ PENDING:'Pending', IN_PROGRESS:'In Progress', COMPLETED:'Completed', CANCELLED:'Cancelled' } as Record<AppointmentStatus,string>)[status] || status;
const truncateText = (text: string, length: number) => text.length > length ? text.substring(0, length) + '...' : text;

async function fetchAppointments() {
  try {
    loading.value = true;
    error.value = '';
    const res = await appointmentService.listAppointments(0, 50);
    const data = (res as any)?.content || res;
    appointments.value = Array.isArray(data) ? data : (data?.content || []);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load appointments';
  } finally {
    loading.value = false;
  }
}

function startAppointment(appt: Appointment) { appt.status = 'IN_PROGRESS'; }
function completeAppointment(appt: Appointment) { appt.status = 'COMPLETED'; }
function confirmCancel(appt: Appointment) { selectedAppointment.value = appt; showCancelConfirmation.value = true; }
function cancelAppointment() { if (selectedAppointment.value) selectedAppointment.value.status = 'CANCELLED'; showCancelConfirmation.value = false; selectedAppointment.value = null; }

function startRealTimeUpdates() { updateInterval = window.setInterval(fetchAppointments, 30000); }

onMounted(() => { fetchAppointments(); startRealTimeUpdates(); });

onUnmounted(() => { if (updateInterval) clearInterval(updateInterval); });
</script>