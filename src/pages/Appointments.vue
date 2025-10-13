<template>
  <div class="appointments-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Quản lý lịch hẹn</h1>
      <div class="page-actions">
        <button @click="refreshData" class="btn btn--outline" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          Làm mới
        </button>
        <router-link 
          v-if="isPatient" 
          to="/patient/appointments/create" 
          class="btn btn--primary"
        >
          <i class="fas fa-plus"></i>
          Đặt lịch hẹn
        </router-link>
      </div>
    </div>

    <!-- Filters -->
    <div class="card">
      <div class="filters">
        <div class="filter-group">
          <label class="form-label">Trạng thái</label>
          <select v-model="filters.status" @change="applyFilters" class="form-control">
            <option value="">Tất cả</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
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
          <label class="form-label">Đến ngày</label>
          <input 
            v-model="filters.endDate" 
            @change="applyFilters" 
            type="date" 
            class="form-control"
          >
        </div>

        <div v-if="isAdmin || isDoctor" class="filter-group">
          <label class="form-label">Bệnh nhân</label>
          <input 
            v-model="filters.patientSearch" 
            @input="debouncedSearch"
            placeholder="Tìm kiếm bệnh nhân..." 
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

    <!-- Appointments Table -->
    <div class="table-container">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <div v-else-if="filteredAppointments.length === 0" class="empty-state">
        <i class="fas fa-calendar-alt empty-icon"></i>
        <h3>Không có lịch hẹn nào</h3>
        <p v-if="isPatient">Bạn chưa có lịch hẹn nào. Hãy đặt lịch hẹn để bắt đầu!</p>
        <p v-else>Không tìm thấy lịch hẹn nào phù hợp với bộ lọc.</p>
        <router-link 
          v-if="isPatient" 
          to="/patient/appointments/create" 
          class="btn btn--primary"
        >
          <i class="fas fa-plus"></i>
          Đặt lịch hẹn
        </router-link>
      </div>

      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th>Ngày giờ</th>
              <th v-if="isAdmin || isDoctor">Bệnh nhân</th>
              <th v-if="isAdmin || isPatient">Bác sĩ</th>
              <th>Lý do</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appointment in paginatedAppointments" :key="appointment.id">
              <td>
                <div class="datetime-cell">
                  <div class="date">{{ formatDate(appointment.appointmentDate) }}</div>
                  <div class="time">{{ formatTime(appointment.appointmentDate) }}</div>
                </div>
              </td>
              <td v-if="isAdmin || isDoctor">
                <div class="patient-cell">
                  <div class="patient-name">{{ appointment.patientName }}</div>
                </div>
              </td>
              <td v-if="isAdmin || isPatient">
                <div class="doctor-cell">
                  <div class="doctor-name">{{ appointment.doctorName }}</div>
                </div>
              </td>
              <td>
                <div class="reason-cell">{{ appointment.reason }}</div>
              </td>
              <td>
                <span 
                  class="status-badge"
                  :class="`status-badge--${appointment.status.toLowerCase()}`"
                >
                  {{ getStatusText(appointment.status) }}
                </span>
              </td>
              <td>
                <div class="actions">
                  <!-- Admin actions -->
                  <button 
                    v-if="isAdmin && appointment.status === 'PENDING'"
                    @click="confirmAppointment(appointment.id)"
                    class="btn btn--success btn--sm"
                    title="Xác nhận lịch hẹn"
                  >
                    <i class="fas fa-check"></i>
                  </button>

                  <!-- Doctor actions -->
                  <button 
                    v-if="isDoctor && appointment.status === 'CONFIRMED'"
                    @click="completeAppointment(appointment.id)"
                    class="btn btn--success btn--sm"
                    title="Hoàn thành khám"
                  >
                    <i class="fas fa-check-circle"></i>
                  </button>

                  <!-- Patient actions -->
                  <button 
                    v-if="isPatient && appointment.status === 'PENDING'"
                    @click="cancelAppointment(appointment.id)"
                    class="btn btn--danger btn--sm"
                    title="Hủy lịch hẹn"
                  >
                    <i class="fas fa-times"></i>
                  </button>

                  <!-- View details -->
                  <button 
                    @click="viewAppointmentDetails(appointment.id)"
                    class="btn btn--outline btn--sm"
                    title="Xem chi tiết"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

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

    <!-- Appointment Details Modal -->
    <div v-if="selectedAppointment" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Chi tiết lịch hẹn</h3>
          <button @click="closeModal" class="btn btn--secondary btn--sm">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Ngày giờ:</label>
              <span>{{ formatDateTime(selectedAppointment.appointmentDate) }}</span>
            </div>
            <div class="detail-item">
              <label>Bệnh nhân:</label>
              <span>{{ selectedAppointment.patientName }}</span>
            </div>
            <div class="detail-item">
              <label>Bác sĩ:</label>
              <span>{{ selectedAppointment.doctorName }}</span>
            </div>
            <div class="detail-item">
              <label>Lý do:</label>
              <span>{{ selectedAppointment.reason }}</span>
            </div>
            <div class="detail-item">
              <label>Trạng thái:</label>
              <span 
                class="status-badge"
                :class="`status-badge--${selectedAppointment.status.toLowerCase()}`"
              >
                {{ getStatusText(selectedAppointment.status) }}
              </span>
            </div>
            <div class="detail-item">
              <label>Ngày tạo:</label>
              <span>{{ formatDateTime(selectedAppointment.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn--secondary">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '../lib/auth'
import { 
  getAppointments, 
  confirmAppointment as confirmAppointmentAPI,
  completeAppointment as completeAppointmentAPI,
  cancelAppointment as cancelAppointmentAPI,
  type Appointment 
} from '../lib/appointments'

const { isAdmin, isDoctor, isPatient } = useAuth()

// State
const loading = ref(true)
const appointments = ref<Appointment[]>([])
const selectedAppointment = ref<Appointment | null>(null)
const currentPage = ref(1)
const itemsPerPage = 10

// Filters
const filters = ref({
  status: '',
  startDate: '',
  endDate: '',
  patientSearch: ''
})

// Computed
const filteredAppointments = computed(() => {
  let filtered = appointments.value

  // Filter by status
  if (filters.value.status) {
    filtered = filtered.filter(apt => apt.status === filters.value.status)
  }

  // Filter by date range
  if (filters.value.startDate) {
    filtered = filtered.filter(apt => 
      new Date(apt.appointmentDate) >= new Date(filters.value.startDate)
    )
  }

  if (filters.value.endDate) {
    filtered = filtered.filter(apt => 
      new Date(apt.appointmentDate) <= new Date(filters.value.endDate)
    )
  }

  // Filter by patient search
  if (filters.value.patientSearch) {
    const search = filters.value.patientSearch.toLowerCase()
    filtered = filtered.filter(apt => 
      apt.patientName?.toLowerCase().includes(search)
    )
  }

  return filtered
})

const totalPages = computed(() => 
  Math.ceil(filteredAppointments.value.length / itemsPerPage)
)

const paginatedAppointments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredAppointments.value.slice(start, end)
})

// Methods
const loadAppointments = async () => {
  try {
    loading.value = true
    appointments.value = await getAppointments()
  } catch (error) {
    console.error('Failed to load appointments:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadAppointments()
}

const applyFilters = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  filters.value = {
    status: '',
    startDate: '',
    endDate: '',
    patientSearch: ''
  }
  currentPage.value = 1
}

const confirmAppointment = async (id: number) => {
  try {
    await confirmAppointmentAPI(id)
    await loadAppointments()
  } catch (error) {
    console.error('Failed to confirm appointment:', error)
  }
}

const completeAppointment = async (id: number) => {
  try {
    await completeAppointmentAPI(id)
    await loadAppointments()
  } catch (error) {
    console.error('Failed to complete appointment:', error)
  }
}

const cancelAppointment = async (id: number) => {
  try {
    await cancelAppointmentAPI(id)
    await loadAppointments()
  } catch (error) {
    console.error('Failed to cancel appointment:', error)
  }
}

const viewAppointmentDetails = (id: number) => {
  selectedAppointment.value = appointments.value.find(apt => apt.id === id) || null
}

const closeModal = () => {
  selectedAppointment.value = null
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('vi-VN')
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

// Debounced search
let searchTimeout: number
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 300)
}

// Watch for page changes
watch(currentPage, () => {
  // Scroll to top when page changes
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

// Lifecycle
onMounted(() => {
  loadAppointments()
})
</script>

<style scoped>
.appointments-page {
  max-width: 1200px;
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

.datetime-cell {
  display: flex;
  flex-direction: column;
}

.date {
  font-weight: 600;
  color: #2c3e50;
}

.time {
  font-size: 12px;
  color: #6c757d;
}

.patient-cell,
.doctor-cell {
  font-weight: 500;
  color: #2c3e50;
}

.reason-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
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

.detail-grid {
  display: grid;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.detail-item span {
  color: #2c3e50;
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
  
  .actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table {
    font-size: 14px;
  }
  
  .table th,
  .table td {
    padding: 8px 12px;
  }
}
</style>