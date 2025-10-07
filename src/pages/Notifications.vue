<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMyNotifications, markAsRead, markAllAsRead } from '../lib/notifications';

const items = ref<any[]>([]);
const loading = ref(false);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getMyNotifications(0, 50);
    const data = res?.content || res?.items || res?.result || res;
    items.value = Array.isArray(data) ? data : (data?.content || []);
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Tải thông báo thất bại';
  } finally {
    loading.value = false;
  }
}

async function onRead(id: number) {
  await markAsRead(id);
  await load();
}

async function onReadAll() {
  await markAllAsRead();
  await load();
}

onMounted(load);
</script>

<template>
  <div style="padding:16px;">
    <h2>Thông báo</h2>
    <div style="margin-bottom:8px;display:flex;gap:8px;">
      <button @click="onReadAll">Đánh dấu đã đọc tất cả</button>
    </div>
    <div v-if="error" style="color:#c00">{{ error }}</div>
    <div v-if="loading">Đang tải...</div>
    <ul v-if="!loading">
      <li v-for="n in items" :key="n.notificationId" style="margin:8px 0;">
        <strong>{{ n.title }}</strong> - <small>{{ n.sendDate || n.createdDate }}</small>
        <div>{{ n.message }}</div>
        <button v-if="!n.isRead" @click="onRead(n.notificationId)">Đánh dấu đã đọc</button>
      </li>
    </ul>
  </div>
  
</template>


