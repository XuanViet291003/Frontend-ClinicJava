<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createAppointment } from '../lib/appointments';
import { listAccounts } from '../lib/account';
import TextField from '../components/TextField.vue';
import PrimaryButton from '../components/PrimaryButton.vue';

const router = useRouter();

const patientName = ref('');
const patientAge = ref<number | null>(null);
const doctorId = ref<number | null>(null);
const doctors = ref<any[]>([]);
const time = ref('');
const note = ref('');
const loading = ref(false);
const loadingDoctors = ref(false);
const error = ref('');

async function loadDoctors() {
  loadingDoctors.value = true;
    error.value = '';
  try {
    const res = await listAccounts(0, 100);
    const content = (res as any)?.content || res;
    const list = Array.isArray(content) ? content : (content?.content || []);
    doctors.value = list;
  } catch (e: any) {
    error.value = e?.message || 'Không thể tải danh sách bác sĩ';
  } finally {
    loadingDoctors.value = false;
  }
}

function validate(): string {
  if (!patientName.value.trim()) return 'Tên bệnh nhân là bắt buộc';
  if (doctorId.value == null) return 'Vui lòng chọn bác sĩ';
  if (!time.value) return 'Vui lòng chọn thời gian';
  if (patientAge.value == null || Number.isNaN(Number(patientAge.value)) || Number(patientAge.value) <= 0) return 'Tuổi bệnh nhân không hợp lệ';
  return '';
}

function normalizeTime(t: string) {
  if (!t) return t;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(t)) return t + ':00';
  return t;
}

async function submit() {
  const v = validate();
  if (v) { error.value = v; return; }
  loading.value = true;
  error.value = '';
  try {
    const payload = {
      patientId: 0,
      patientName: patientName.value,
      doctorId: Number(doctorId.value),
      appointmentDate: normalizeTime(time.value),
      note: note.value,
      patientAge: Number(patientAge.value)
    };
    await createAppointment(payload as any);
    router.replace('/appointments');
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Tạo lịch hẹn thất bại';
  } finally {
    loading.value = false;
  }
}

  loadDoctors();
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-6">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-lg shadow px-5 py-6">
          <h3 class="text-2xl font-semibold text-gray-900">Tạo Lịch Hẹn Khám</h3>

          <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <TextField v-model="patientName" label="Tên bệnh nhân" placeholder="Nhập tên bệnh nhân" />
            <div>
              <label class="block text-sm font-medium text-gray-700">Tuổi bệnh nhân</label>
              <input v-model.number="patientAge" type="number" min="1" class="mt-1 block w-full border rounded-md p-2" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Chọn bác sĩ</label>
              <select v-model.number="doctorId" class="mt-1 block w-full border rounded-md p-2" :disabled="loadingDoctors">
                <option :value="null">-- Chọn bác sĩ --</option>
                <option v-for="d in doctors" :key="d.accountId || d.id" :value="Number(d.accountId ?? d.id)">
                  {{ d.fullName || (d.firstName ? d.firstName + ' ' + (d.lastName || '') : d.username) }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Thời gian</label>
              <input v-model="time" type="datetime-local" class="mt-1 block w-full border rounded-md p-2" />
            </div>

            <div class="sm:col-span-2">
              <TextField v-model="note" label="Ghi chú" placeholder="Ghi chú (không bắt buộc)" />
            </div>
          </div>

          <div class="mt-6">
            <div v-if="error" class="mb-4 text-red-600 text-sm">{{ error }}</div>
            <div class="flex justify-end gap-3">
              <button type="button" class="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm" @click="router.back()" :disabled="loading">Hủy</button>
              <PrimaryButton :disabled="loading" @click="submit">{{ loading ? 'Đang xử lý...' : 'Tạo lịch hẹn' }}</PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
