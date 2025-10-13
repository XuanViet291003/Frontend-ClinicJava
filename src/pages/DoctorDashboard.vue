<template>
  <div class="dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <h1 class="welcome-title">Chào mừng, BS. {{ user?.firstName }} {{ user?.lastName }}!</h1>
      <p class="welcome-subtitle">Bác sĩ - ClinicApp</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon--blue">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.todayAppointments }}</h3>
          <p class="stat-label">Lịch hẹn hôm nay</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--green">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.completedAppointments }}</h3>
          <p class="stat-label">Đã hoàn thành</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--orange">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalPatients }}</h3>
          <p class="stat-label">Bệnh nhân</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--purple">
          <i class="fas fa-file-medical"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalRecords }}</h3>
          <p class="stat-label">Bệnh án đã tạo</p>
        </div>
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="dashboard-grid">
      <!-- Today's Appointments -->
      <div class="card">
        <div class="card__header">
          <h2 class="card__title">Lịch hẹn hôm nay</h2>
          <router-link to="/doctor/appointments/today" class="btn btn--outline btn--sm">
            Xem chi tiết
          </router-link>
        </div>
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
        </div>
        <div v-else-if="todayAppointments.length === 0" class="empty-state">
          <i class="fas fa-calendar-check empty-icon"></i>
          <p>Không có lịch hẹn nào hôm nay</p>
        </div>
        <div v-else class="appointment-list">
          <div 
            v-for="appointment in todayAppointments.slice(0, 5)" 
            :key="appointment.id"
            class="appointment-item"
          >
            <div class="appointment-time">
              <span class="time">{{ formatTime(appointment.appointmentDate) }}</span>
            </div>
            <div class="appointment-info">
              <h4 class="appointment-patient">{{ appointment.patientName }}</h4>
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
                v-if="appointment.status === 'CONFIRMED'"
                @click="completeAppointment(appointment.id)"
                class="btn btn--success btn--sm"
              >
                Hoàn thành
              </button>
              <button 
                v-if="appointment.status === 'PENDING'"
                class="btn btn--secondary btn--sm"
                disabled
              >
                Chờ xác nhận
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Patients -->
      <div class="card">
        <div class="card__header">
          <h2 class="card__title">Bệnh nhân gần đây</h2>
          <router-link to="/doctor/patients" class="btn btn--outline btn--sm">
            Xem tất cả
          </router-link>
        </div>
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
        </div>
        <div v-else-if="recentPatients.length === 0" class="empty-state">
          <i class="fas fa-user-friends empty-icon"></i>
          <p>Chưa có bệnh nhân nào</p>
        </div>
        <div v-else class="patient-list">
          <div 
            v-for="patient in recentPatients.slice(0, 5)" 
            :key="patient.id"
            class="patient-item"
            @click="viewPatientRecords(patient.id)"
          >
            <div class="patient-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="patient-info">
              <h4 class="patient-name">{{ patient.firstName }} {{ patient.lastName }}</h4>
              <p class="patient-email">{{ patient.email }}</p>
              <p class="patient-last-visit">
                <i class="fas fa-calendar"></i>
                Lần cuối: {{ formatDate(patient.lastVisit) }}
              </p>
            </div>
            <div class="patient-actions">
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
        <router-link to="/doctor/appointments/today" class="quick-action">
          <i class="fas fa-calendar-day"></i>
          <span>Lịch hẹn hôm nay</span>
        </router-link>
        <router-link to="/doctor/patients" class="quick-action">
          <i class="fas fa-user-friends"></i>
          <span>Danh sách bệnh nhân</span>
        </router-link>
        <router-link to="/doctor/medical-records" class="quick-action">
          <i class="fas fa-file-medical"></i>
          <span>Tạo bệnh án</span>
        </router-link>
        <router-link to="/doctor/appointments" class="quick-action">
          <i class="fas fa-calendar-alt"></i>
          <span>Quản lý lịch hẹn</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../lib/auth'
import { getAppointments } from '../../lib/appointments'
import { getPatients } from '../../lib/account'

const router = useRouter()
const { user } = useAuth()

// State
const loading = ref(true)
const stats = ref({
  todayAppointments: 0,
  completedAppointments: 0,
  totalPatients: 0,
  totalRecords: 0
})
const todayAppointments = ref([])
const recentPatients = ref([])

// Methods
const loadDashboardData = async () => {
  try {
    loading.value = true
    
    // Load today's appointments
    const appointments = await getAppointments()
    const today = new Date().toDateString()
    todayAppointments.value = appointments.filter(apt => 
      new Date(apt.appointmentDate).toDateString() === today
    )
    
    // Load patients
    const patients = await getPatients()
    recentPatients.value = patients.slice(0, 10)
    
    // Calculate stats
    stats.value = {
      todayAppointments: todayAppointments.value.length,
      completedAppointments: appointments.filter(apt => apt.status === 'COMPLETED').length,
      totalPatients: patients.length,
      totalRecords: 0 // TODO: Load from medical records API
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const completeAppointment = async (appointmentId: number) => {
  try {
    // TODO: Implement complete appointment API call
    console.log('Completing appointment:', appointmentId)
    await loadDashboardData()
  } catch (error) {
    console.error('Failed to complete appointment:', error)
  }
}

const viewPatientRecords = (patientId: number) => {
  router.push(`/doctor/medical-records?patient=${patientId}`)
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
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
.patient-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.appointment-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.appointment-time {
  min-width: 60px;
}

.time {
  font-weight: 600;
  color: #007bff;
  font-size: 16px;
}

.appointment-info {
  flex: 1;
}

.appointment-patient {
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.appointment-reason {
  font-size: 14px;
  color: #6c757d;
  margin: 0 0 8px 0;
}

.appointment-actions {
  display: flex;
  gap: 8px;
}

.patient-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.patient-item:hover {
  background-color: #e9ecef;
}

.patient-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #007bff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.patient-info {
  flex: 1;
}

.patient-name {
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.patient-email {
  font-size: 14px;
  color: #6c757d;
  margin: 0 0 4px 0;
}

.patient-last-visit {
  font-size: 12px;
  color: #6c757d;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.patient-actions {
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