<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { searchMedicalRecords } from '../lib/medicalRecords';

const items = ref<any[]>([]);
const loading = ref(false);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const res = await searchMedicalRecords(0, 20);
    const data = res?.content || res?.items || res?.result || res;
    items.value = Array.isArray(data) ? data : (data?.content || []);
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Tải bệnh án thất bại';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div style="padding:16px;">
    <h2>Bệnh án</h2>
    <div v-if="error" style="color:#c00">{{ error }}</div>
    <div v-if="loading">Đang tải...</div>
    <table v-if="!loading && items.length" style="width:100%;margin-top:12px;border-collapse:collapse;">
      <thead>
        <tr style="text-align:left;border-bottom:1px solid #ddd;"><th>ID</th><th>Tên bệnh nhân</th><th>Triệu chứng</th><th>Chẩn đoán</th><th>Ngày</th></tr>
      </thead>
      <tbody>
        <tr v-for="it in items" :key="it.medicalRecordId" style="border-bottom:1px solid #f0f0f0;">
          <td>{{ it.medicalRecordId }}</td>
          <td>{{ it.patientName }}</td>
          <td>{{ it.symptoms }}</td>
          <td>{{ it.diagnosis }}</td>
          <td>{{ it.recordDate }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="!loading" style="margin-top:12px;color:#666;">Không có dữ liệu</div>
  </div>
</template>


