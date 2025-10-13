<template>
  <div class="dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <h1 class="welcome-title">Chào mừng, {{ user?.firstName }} {{ user?.lastName }}!</h1>
      <p class="welcome-subtitle">Bệnh nhân - ClinicApp</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon--blue">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.upcomingAppointments }}</h3>
          <p class="stat-label">Lịch hẹn sắp tới</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--green">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.completedAppointments }}</h3>
          <p class="stat-label">Đã khám</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--orange">
          <i class="fas fa-file-medical"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalRecords }}</h3>
          <p class="stat-label">Bệnh án</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--purple">
          <i class="fas fa-bell"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.unreadNotifications }}</h3>
          <p class="stat-label">Thông báo mới</p>
        </div>
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="dashboard-grid">
      <!-- Upcoming Appointments -->
      <div class="card">
        <div class="card__header">
          <h2 class="card__title">Lịch hẹn sắp tới</h2>
          <router-link to="/patient/appointments" class="btn btn--outline btn--sm">
            Xem tất cả
          </router-link>
        </div>
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
        </div>
        <div v-else-if="upcomingAppointments.length === 0" class="empty-state">
          <i class="fas fa-calendar-check empty-icon"></i>
          <p>Không có lịch hẹn nào</p>
          <router-link to="/patient/appointments/create" class="btn btn--primary">
            Đặt lịch hẹn
          </router-link>
        </div>
        <div v-else class="appointment-list">
          <div 
            v-for="appointment in upcomingAppointments.slice(0, 3)" 
            :key="appointment.id"
            class="appointment-item"
          >
            <div class="appointment-date">
              <span class="day">{{ formatDay(appointment.appointmentDate) }}</span>
              <span class="month">{{ formatMonth(appointment.appointmentDate) }}</span>
            </div>
            <div class="appointment-info">
              <h4 class="appointment-doctor">
                <i class="fas fa-user-md"></i>
                {{ appointment.doctorName }}
              </h4>
              <p class="appointment-time">
                <i class="fas fa-clock"></i>
                {{ formatDateTime(appointment.appointmentDate) }}
              </p>
              <p class="appointment-reason">{{ appointment.reason }}</p>
              <span 
                class="status-badge"
                :class="`status-badge--${appointment.status.toLowerCase()}`"
              >
                {{ getStatusText(appointment.status) }}
              </span>
            </div>
            <div class="appointment-actions">
              <button 
                v-if="appointment.status === 'PENDING'"
                @click="cancelAppointment(appointment.id)"
                class="btn btn--danger btn--sm"
              >
                Hủy lịch
              </button>
              <button 
                v-if="appointment.status === 'CONFIRMED'"
                class="btn btn--success btn--sm"
                disabled
              >
                Đã xác nhận
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Medical Records -->
      <div class="card">
        <div class="card__header">
          <h2 class="card__title">Bệnh án gần đây</h2>
          <router-link to="/patient/medical-records" class="btn btn--outline btn--sm">
            Xem tất cả
          </router-link>
        </div>
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
        </div>
        <div v-else-if="recentRecords.length === 0" class="empty-state">
          <i class="fas fa-file-medical empty-icon"></i>
          <p>Chưa có bệnh án nào</p>
        </div>
        <div v-else class="record-list">
          <div 
            v-for="record in recentRecords.slice(0, 3)" 
            :key="record.id"
            class="record-item"
            @click="viewRecordDetail(record.id)"
          >
            <div class="record-date">
              <span class="day">{{ formatDay(record.createdAt) }}</span>
              <span class="month">{{ formatMonth(record.createdAt) }}</span>
            </div>
            <div class="record-info">
              <h4 class="record-doctor">
                <i class="fas fa-user-md"></i>
                {{ record.doctorName }}
              </h4>
              <p class="record-diagnosis">{{ record.diagnosis }}</p>
              <p class="record-symptoms">{{ record.symptoms }}</p>
            </div>
            <div class="record-actions">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card">
      <div class="card__header">
        <h2 class="card__title">Thao tác nhanh</h2>
      </div>
      <div class="quick-actions">
        <router-link to="/patient/appointments/create" class="quick-action">
          <i class="fas fa-plus"></i>
          <span>Đặt lịch hẹn</span>
        </router-link>
        <router-link to="/patient/appointments" class="quick-action">
          <i class="fas fa-calendar-alt"></i>
          <span>Lịch hẹn của tôi</span>
        </router-link>
        <router-link to="/patient/medical-records" class="quick-action">
          <i class="fas fa-file-medical"></i>
          <span>Bệnh án</span>
        </router-link>
        <router-link to="/patient/notifications" class="quick-action">
          <i class="fas fa-bell"></i>
          <span>Thông báo</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed  } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../lib/auth'
import { getAppointments , type Appointment} from '../lib/appointments'
import { getMedicalRecords, type MedicalRecord} from '../lib/medicalRecords'
import { getNotifications, type Notification} from '../lib/notifications'

const router = useRouter()
const { user } = useAuth()

// State
const loading = ref(true)
const stats = ref({
  upcomingAppointments: 0,
  completedAppointments: 0,
  totalRecords: 0,
  unreadNotifications: 0
})
const upcomingAppointments = ref<Appointment[]>([])
const recentRecords = ref<MedicalRecord[]>([])
const notifications = ref<Notification[]>([])

// Methods
const loadDashboardData = async () => {
  try {
    loading.value = true
    
    // Load appointments
    const appointments = await getAppointments()
    const now = new Date()
    upcomingAppointments.value = appointments.filter(apt => 
      new Date(apt.appointmentDate) > now && 
      ['PENDING', 'CONFIRMED'].includes(apt.status)
    )
    
    // Load medical records
    const records = await getMedicalRecords()
    recentRecords.value = records.slice(0, 5)
    
    // Load notifications
    const notifications = await getNotifications()
    
    // Calculate stats
    stats.value = {
      upcomingAppointments: upcomingAppointments.value.length,
      completedAppointments: appointments.filter(apt => apt.status === 'COMPLETED').length,
      totalRecords: records.length,
      unreadNotifications: notifications.filter(n => !n.isRead).length
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const cancelAppointment = async (appointmentId: number) => {
  try {
    // TODO: Implement cancel appointment API call
    console.log('Cancelling appointment:', appointmentId)
    await loadDashboardData()
  } catch (error) {
    console.error('Failed to cancel appointment:', error)
  }
}

const viewRecordDetail = (recordId: number) => {
  router.push(`/patient/medical-records/${recordId}`)
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDay = (dateString: string) => {
  const date = new Date(dateString)
  return date.getDate()
}

const formatMonth = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', { month: 'short' })
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING': return 'Chờ xác nhận'
    case 'CONFIRMED': return 'Đã xác nhận'
    case 'COMPLETED': return 'Hoàn thành'
    case 'CANCELLED': return 'Đã hủy'
    default: return status
  }
}

// Lifecycle
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  margin-bottom: 32px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.welcome-subtitle {
  font-size: 16px;
  color: #6c757d;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon--blue {
  background: linear-gradient(135deg, #007bff, #0056b3);
}

.stat-icon--green {
  background: linear-gradient(135deg, #28a745, #1e7e34);
}

.stat-icon--orange {
  background: linear-gradient(135deg, #fd7e14, #e55a00);
}

.stat-icon--purple {
  background: linear-gradient(135deg, #6f42c1, #5a2d91);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.appointment-list,
.record-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.appointment-item,
.record-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  cursor: pointer;
  transition: background-color 0.2s;
}

.record-item:hover {
  background-color: #e9ecef;
}

.appointment-date,
.record-date {
  min-width: 60px;
  text-align: center;
}

.day {
  display: block;
  font-weight: 700;
  color: #007bff;
  font-size: 20px;
  line-height: 1;
}

.month {
  display: block;
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
}

.appointment-info,
.record-info {
  flex: 1;
}

.appointment-doctor,
.record-doctor {
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.appointment-time {
  font-size: 14px;
  color: #6c757d;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.appointment-reason,
.record-diagnosis {
  font-size: 14px;
  color: #6c757d;
  margin: 0 0 8px 0;
}

.record-symptoms {
  font-size: 12px;
  color: #6c757d;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.appointment-actions,
.record-actions {
  display: flex;
  gap: 8px;
}

.record-actions {
  color: #6c757d;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  color: #495057;
  transition: all 0.2s;
}

.quick-action:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
}

.quick-action i {
  font-size: 24px;
  margin-bottom: 8px;
  color: #007bff;
}

.quick-action span {
  font-weight: 500;
  text-align: center;
}

.btn--sm {
  padding: 6px 12px;
  font-size: 12px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>