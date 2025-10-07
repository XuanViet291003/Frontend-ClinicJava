<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Appointment } from '../lib/appointments';
import { listAppointments, cancelAppointment, confirmAppointment, completeAppointment } from '../lib/appointments';
import { useAuth } from '../lib/auth';
import PrimaryButton from '../components/PrimaryButton.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const auth = useAuth();
const appointments = ref<Appointment[]>([]);
const loading = ref(false);
const error = ref('');
const processingId = ref<number | null>(null);

const statusColors = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-800' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-800' }
} as const;

const sortedAppointments = computed(() => {
  return [...appointments.value].sort((a, b) => {
    const statusOrder = { PENDING: 0, CONFIRMED: 1, COMPLETED: 2, CANCELLED: 3 } as Record<string, number>;
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime();
  });
});

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString();
}

function getAvailableActions(status: string) {
  switch (status) {
    case 'PENDING':
      return ['confirm', 'cancel'];
    case 'CONFIRMED':
      return ['complete', 'cancel'];
    default:
      return [];
  }
}

function canManageAppointment(appointment: Appointment) {
  const role = auth.user.value?.role;
  if (!role) return false;
  switch (role) {
    case 'ADMIN':
      return true;
    case 'DOCTOR':
      return appointment.doctorId === auth.user.value?.id;
    default:
      return false;
  }
}

async function handleAction(
  id: number,
  action: (id: number) => Promise<any>,
  confirmMessage: string,
  errorMessage: string
) {
  if (!confirm(confirmMessage)) return;
  processingId.value = id;
  error.value = '';
  try {
    await action(id);
    await load();
  } catch (err) {
    error.value = errorMessage;
    console.error(err);
  } finally {
    processingId.value = null;
  }
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const res = await listAppointments(0, 50);
    appointments.value = (res as any)?.content || [];
  } catch (err) {
    error.value = 'Không thể tải danh sách lịch hẹn';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="sm:flex sm:items-center">
          <div class="sm:flex-auto">
            <h1 class="text-xl font-semibold text-gray-900">Quản lý Lịch Hẹn</h1>
            <p class="mt-2 text-sm text-gray-700">Danh sách tất cả các lịch hẹn khám bệnh</p>
          </div>
          <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <PrimaryButton @click="router.push('/appointments/create')">Tạo lịch hẹn mới</PrimaryButton>
          </div>
        </div>

        <div v-if="error" class="mt-4 rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
            </div>
          </div>
        </div>

        <div v-if="loading" class="mt-6 flex justify-center">
          <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <div v-else-if="!appointments.length" class="mt-6 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Không có lịch hẹn nào</h3>
          <p class="mt-1 text-sm text-gray-500">Bắt đầu bằng việc tạo một lịch hẹn mới</p>
        </div>

        <div v-else class="mt-8 flex flex-col">
          <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table class="min-w-full divide-y divide-gray-300">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Bệnh nhân</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Bác sĩ</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Thời gian</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                      <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="appointment in sortedAppointments" :key="appointment.id">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                        <div class="font-medium text-gray-900">{{ appointment.patientName }}</div>
                        <div class="text-gray-500">{{ appointment.patientAge }} tuổi</div>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ appointment.doctorName }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatDate(appointment.appointmentDate) }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm">
                        <span :class="[statusColors[appointment.status].bg, statusColors[appointment.status].text, 'inline-flex rounded-full px-2 text-xs font-semibold leading-5']">{{ appointment.status }}</span>
                      </td>
                      <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div class="flex justify-end gap-2" v-if="canManageAppointment(appointment)">
                          <button v-if="getAvailableActions(appointment.status).includes('confirm')" @click="handleAction(appointment.id, confirmAppointment, 'Bạn có chắc muốn xác nhận lịch hẹn này?', 'Xác nhận lịch hẹn thất bại')" :disabled="processingId === appointment.id" class="text-indigo-600 hover:text-indigo-900">Xác nhận</button>
                          <button v-if="getAvailableActions(appointment.status).includes('complete')" @click="handleAction(appointment.id, completeAppointment, 'Bạn có chắc muốn đánh dấu lịch hẹn này đã hoàn thành?', 'Cập nhật trạng thái thất bại')" :disabled="processingId === appointment.id" class="text-green-600 hover:text-green-900">Hoàn thành</button>
                          <button v-if="getAvailableActions(appointment.status).includes('cancel')" @click="handleAction(appointment.id, cancelAppointment, 'Bạn có chắc muốn hủy lịch hẹn này?', 'Hủy lịch hẹn thất bại')" :disabled="processingId === appointment.id" class="text-red-600 hover:text-red-900">Hủy</button>
                          <div v-if="processingId === appointment.id" class="text-gray-500 italic">Đang xử lý...</div>
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
  </div>
</template>