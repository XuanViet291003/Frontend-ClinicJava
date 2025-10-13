<template>
  <div class="notifications-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Thông báo</h1>
      <div class="page-actions">
        <button @click="refreshData" class="btn btn--outline" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          Làm mới
        </button>
        <button 
          v-if="isAdmin" 
          @click="showBroadcastModal = true" 
          class="btn btn--primary"
        >
          <i class="fas fa-bullhorn"></i>
          Gửi thông báo
        </button>
        <button 
          v-if="unreadCount > 0"
          @click="markAllAsRead" 
          class="btn btn--secondary"
        >
          <i class="fas fa-check-double"></i>
          Đánh dấu tất cả đã đọc
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card">
      <div class="filters">
        <div class="filter-group">
          <label class="form-label">Loại thông báo</label>
          <select v-model="filters.type" @change="applyFilters" class="form-control">
            <option value="">Tất cả</option>
            <option value="INFO">Thông tin</option>
            <option value="WARNING">Cảnh báo</option>
            <option value="SUCCESS">Thành công</option>
            <option value="ERROR">Lỗi</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="form-label">Trạng thái</label>
          <select v-model="filters.status" @change="applyFilters" class="form-control">
            <option value="">Tất cả</option>
            <option value="unread">Chưa đọc</option>
            <option value="read">Đã đọc</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="form-label">Từ ngày</label>
          <input 
            v-model="filters.startDate" 
            @change="applyFilters" 
            type="date" 
            class="form-control"
          >
        </div>

        <div class="filter-group">
          <button @click="clearFilters" class="btn btn--secondary">
            <i class="fas fa-times"></i>
            Xóa bộ lọc
          </button>
        </div>
      </div>
    </div>

    <!-- Notifications List -->
    <div class="notifications-container">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải thông báo...</p>
      </div>

      <div v-else-if="filteredNotifications.length === 0" class="empty-state">
        <i class="fas fa-bell-slash empty-icon"></i>
        <h3>Không có thông báo nào</h3>
        <p>Không tìm thấy thông báo nào phù hợp với bộ lọc.</p>
      </div>

      <div v-else class="notifications-list">
        <div 
          v-for="notification in paginatedNotifications" 
          :key="notification.id"
          class="notification-item"
          :class="{ 
            'notification-item--unread': !notification.isRead,
            [`notification-item--${notification.type.toLowerCase()}`]: true
          }"
          @click="toggleReadStatus(notification)"
        >
          <div class="notification-icon">
            <i :class="getNotificationIcon(notification.type)"></i>
          </div>
          
          <div class="notification-content">
            <div class="notification-header">
              <h3 class="notification-title">{{ notification.title }}</h3>
              <div class="notification-meta">
                <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                <span v-if="!notification.isRead" class="notification-badge">Mới</span>
              </div>
            </div>
            
            <p class="notification-message">{{ notification.message }}</p>
            
            <div class="notification-actions">
              <button 
                @click.stop="deleteNotification(notification.id)"
                class="btn btn--danger btn--sm"
                title="Xóa thông báo"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="btn btn--outline btn--sm"
          >
            <i class="fas fa-chevron-left"></i>
            Trước
          </button>
          
          <span class="pagination-info">
            Trang {{ currentPage }} / {{ totalPages }}
          </span>
          
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="btn btn--outline btn--sm"
          >
            Sau
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Broadcast Modal (Admin only) -->
    <div v-if="showBroadcastModal" class="modal-overlay" @click="closeBroadcastModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Gửi thông báo toàn hệ thống</h3>
          <button @click="closeBroadcastModal" class="btn btn--secondary btn--sm">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="sendBroadcast">
            <div class="form-group">
              <label class="form-label">Tiêu đề *</label>
              <input 
                v-model="broadcastForm.title" 
                class="form-control"
                :class="{ 'form-control--error': errors.title }"
                placeholder="Nhập tiêu đề thông báo"
                required
              >
              <div v-if="errors.title" class="form-error">{{ errors.title }}</div>
            </div>

            <div class="form-group">
              <label class="form-label">Loại thông báo *</label>
              <select 
                v-model="broadcastForm.type" 
                class="form-control"
                :class="{ 'form-control--error': errors.type }"
                required
              >
                <option value="INFO">Thông tin</option>
                <option value="WARNING">Cảnh báo</option>
                <option value="SUCCESS">Thành công</option>
                <option value="ERROR">Lỗi</option>
              </select>
              <div v-if="errors.type" class="form-error">{{ errors.type }}</div>
            </div>

            <div class="form-group">
              <label class="form-label">Nội dung *</label>
              <textarea 
                v-model="broadcastForm.message" 
                class="form-control"
                :class="{ 'form-control--error': errors.message }"
                rows="4"
                placeholder="Nhập nội dung thông báo"
                required
              ></textarea>
              <div v-if="errors.message" class="form-error">{{ errors.message }}</div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="closeBroadcastModal" class="btn btn--secondary">Hủy</button>
          <button 
            @click="sendBroadcast" 
            class="btn btn--primary"
            :disabled="sending"
          >
            <i v-if="sending" class="fas fa-spinner fa-spin"></i>
            {{ sending ? 'Đang gửi...' : 'Gửi thông báo' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '../lib/auth'
import { 
  getNotifications, 
  markNotificationAsRead,
  markAllNotificationsAsRead,
  sendBroadcastNotification,
  deleteNotification as deleteNotificationAPI,
  type Notification,
  type BroadcastNotificationRequest
} from '../lib/notifications'

const { isAdmin } = useAuth()

// State
const loading = ref(true)
const sending = ref(false)
const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const showBroadcastModal = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10

// Filters
const filters = ref({
  type: '',
  status: '',
  startDate: ''
})

// Broadcast form
const broadcastForm = ref<BroadcastNotificationRequest>({
  title: '',
  message: '',
  type: 'INFO'
})

// Form errors
const errors = ref({
  title: '',
  message: '',
  type: ''
})

// Computed
const filteredNotifications = computed(() => {
  let filtered = notifications.value

  // Filter by type
  if (filters.value.type) {
    filtered = filtered.filter(notification => notification.type === filters.value.type)
  }

  // Filter by status
  if (filters.value.status) {
    const isRead = filters.value.status === 'read'
    filtered = filtered.filter(notification => notification.isRead === isRead)
  }

  // Filter by date
  if (filters.value.startDate) {
    filtered = filtered.filter(notification => 
      new Date(notification.createdAt) >= new Date(filters.value.startDate)
    )
  }

  return filtered
})

const totalPages = computed(() => 
  Math.ceil(filteredNotifications.value.length / itemsPerPage)
)

const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredNotifications.value.slice(start, end)
})

// Methods
const loadNotifications = async () => {
  try {
    loading.value = true
    notifications.value = await getNotifications()
    unreadCount.value = notifications.value.filter(n => !n.isRead).length
  } catch (error) {
    console.error('Failed to load notifications:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadNotifications()
}

const applyFilters = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  filters.value = {
    type: '',
    status: '',
    startDate: ''
  }
  currentPage.value = 1
}

const toggleReadStatus = async (notification: Notification) => {
  try {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id)
      notification.isRead = true
      unreadCount.value--
    }
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
  }
}

const markAllAsRead = async () => {
  try {
    await markAllNotificationsAsRead()
    notifications.value.forEach(notification => {
      notification.isRead = true
    })
    unreadCount.value = 0
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
  }
}

const deleteNotification = async (id: number) => {
  if (!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
    return
  }

  try {
    await deleteNotificationAPI(id)
    notifications.value = notifications.value.filter(n => n.id !== id)
    if (unreadCount.value > 0) {
      unreadCount.value--
    }
  } catch (error) {
    console.error('Failed to delete notification:', error)
  }
}

const sendBroadcast = async () => {
  try {
    sending.value = true
    
    await sendBroadcastNotification(broadcastForm.value)
    
    closeBroadcastModal()
    await loadNotifications()
  } catch (error) {
    console.error('Failed to send broadcast:', error)
  } finally {
    sending.value = false
  }
}

const closeBroadcastModal = () => {
  showBroadcastModal.value = false
  broadcastForm.value = {
    title: '',
    message: '',
    type: 'INFO'
  }
  errors.value = {
    title: '',
    message: '',
    type: ''
  }
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'INFO': return 'fas fa-info-circle'
    case 'WARNING': return 'fas fa-exclamation-triangle'
    case 'SUCCESS': return 'fas fa-check-circle'
    case 'ERROR': return 'fas fa-times-circle'
    default: return 'fas fa-bell'
  }
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'Vừa xong'
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes} phút trước`
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours} giờ trước`
  }
  
  // More than 24 hours
  return date.toLocaleDateString('vi-VN')
}

// Watch for page changes
watch(currentPage, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

// Lifecycle
onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.notifications-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid #e9ecef;
}

.notification-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.notification-item--unread {
  background-color: #f8f9fa;
  border-left-color: #007bff;
}

.notification-item--info {
  border-left-color: #17a2b8;
}

.notification-item--warning {
  border-left-color: #ffc107;
}

.notification-item--success {
  border-left-color: #28a745;
}

.notification-item--error {
  border-left-color: #dc3545;
}

.notification-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  flex-shrink: 0;
}

.notification-item--info .notification-icon {
  background-color: #17a2b8;
}

.notification-item--warning .notification-icon {
  background-color: #ffc107;
}

.notification-item--success .notification-icon {
  background-color: #28a745;
}

.notification-item--error .notification-icon {
  background-color: #dc3545;
}

.notification-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.notification-time {
  font-size: 12px;
  color: #6c757d;
}

.notification-badge {
  background-color: #dc3545;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.notification-message {
  color: #495057;
  line-height: 1.5;
  margin: 0;
}

.notification-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding: 20px;
}

.pagination-info {
  font-weight: 500;
  color: #6c757d;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .filters {
    grid-template-columns: 1fr;
  }
  
  .notification-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .modal {
    width: 95%;
    margin: 20px;
  }
}
</style>