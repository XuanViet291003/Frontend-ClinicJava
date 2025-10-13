<template>
  <div class="medical-records-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Quản lý bệnh án</h1>
      <div class="page-actions">
        <button @click="refreshData" class="btn btn--outline" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          Làm mới
        </button>
        <button 
          v-if="isDoctor" 
          @click="showCreateModal = true" 
          class="btn btn--primary"
        >
          <i class="fas fa-plus"></i>
          Tạo bệnh án
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card">
      <div class="filters">
        <div class="filter-group">
          <label class="form-label">Tìm kiếm</label>
          <input 
            v-model="filters.search" 
            @input="debouncedSearch"
            placeholder="Tìm kiếm theo triệu chứng, chẩn đoán..." 
            class="form-control"
          >
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

    <!-- Medical Records List -->
    <div class="table-container">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <div v-else-if="filteredRecords.length === 0" class="empty-state">
        <i class="fas fa-file-medical empty-icon"></i>
        <h3>Không có bệnh án nào</h3>
        <p v-if="isPatient">Bạn chưa có bệnh án nào.</p>
        <p v-else>Không tìm thấy bệnh án nào phù hợp với bộ lọc.</p>
        <button 
          v-if="isDoctor" 
          @click="showCreateModal = true" 
          class="btn btn--primary"
        >
          <i class="fas fa-plus"></i>
          Tạo bệnh án
        </button>
      </div>

      <div v-else>
        <div class="records-grid">
          <div 
            v-for="record in paginatedRecords" 
            :key="record.id"
            class="record-card"
            @click="viewRecordDetails(record.id)"
          >
            <div class="record-header">
              <div class="record-date">
                <span class="day">{{ formatDay(record.createdAt) }}</span>
                <span class="month">{{ formatMonth(record.createdAt) }}</span>
              </div>
              <div class="record-info">
                <h3 class="record-patient">{{ record.patientName }}</h3>
                <p class="record-doctor">
                  <i class="fas fa-user-md"></i>
                  {{ record.doctorName }}
                </p>
              </div>
            </div>
            
            <div class="record-content">
              <div class="record-section">
                <h4 class="section-title">Triệu chứng</h4>
                <p class="section-content">{{ record.symptoms }}</p>
              </div>
              
              <div class="record-section">
                <h4 class="section-title">Chẩn đoán</h4>
                <p class="section-content">{{ record.diagnosis }}</p>
              </div>
              
              <div class="record-section">
                <h4 class="section-title">Điều trị</h4>
                <p class="section-content">{{ record.treatment }}</p>
              </div>
        </div>
            
            <div class="record-actions">
              <button 
                @click.stop="viewRecordDetails(record.id)"
                class="btn btn--outline btn--sm"
              >
                <i class="fas fa-eye"></i>
                Xem chi tiết
              </button>
              <button 
                v-if="isDoctor"
                @click.stop="editRecord(record)"
                class="btn btn--primary btn--sm"
              >
                <i class="fas fa-edit"></i>
                Chỉnh sửa
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

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal modal--large" @click.stop>
        <div class="modal-header">
          <h3>{{ showEditModal ? 'Chỉnh sửa bệnh án' : 'Tạo bệnh án mới' }}</h3>
          <button @click="closeModal" class="btn btn--secondary btn--sm">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveRecord">
            <div class="form-group">
              <label class="form-label">Bệnh nhân *</label>
              <select 
                v-model="recordForm.patientId" 
                class="form-control"
                :disabled="showEditModal"
                required
              >
                <option value="">Chọn bệnh nhân</option>
                <option 
                  v-for="patient in patients" 
                  :key="patient.id" 
                  :value="patient.id"
                >
                  {{ patient.firstName }} {{ patient.lastName }}
                </option>
              </select>
      </div>

            <div class="form-group">
              <label class="form-label">Triệu chứng *</label>
              <textarea 
                v-model="recordForm.symptoms" 
                class="form-control"
                rows="3"
                placeholder="Mô tả triệu chứng của bệnh nhân..."
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Chẩn đoán *</label>
              <textarea 
                v-model="recordForm.diagnosis" 
                class="form-control"
                rows="3"
                placeholder="Chẩn đoán bệnh..."
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Điều trị *</label>
              <textarea 
                v-model="recordForm.treatment" 
                class="form-control"
                rows="3"
                placeholder="Phương pháp điều trị..."
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Ghi chú</label>
              <textarea 
                v-model="recordForm.notes" 
                class="form-control"
                rows="2"
                placeholder="Ghi chú thêm..."
              ></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn--secondary">Hủy</button>
                <button
            @click="saveRecord" 
            class="btn btn--primary"
            :disabled="saving"
          >
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            {{ saving ? 'Đang lưu...' : (showEditModal ? 'Cập nhật' : 'Tạo mới') }}
                </button>
        </div>
      </div>
    </div>

    <!-- Record Details Modal -->
    <div v-if="selectedRecord" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal modal--large" @click.stop>
        <div class="modal-header">
          <h3>Chi tiết bệnh án</h3>
          <button @click="closeDetailsModal" class="btn btn--secondary btn--sm">
            <i class="fas fa-times"></i>
                </button>
              </div>
        <div class="modal-body">
          <div class="record-details">
            <div class="detail-section">
              <h4>Thông tin bệnh nhân</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Bệnh nhân:</label>
                  <span>{{ selectedRecord.patientName }}</span>
                </div>
                <div class="detail-item">
                  <label>Bác sĩ:</label>
                  <span>{{ selectedRecord.doctorName }}</span>
                </div>
                <div class="detail-item">
                  <label>Ngày tạo:</label>
                  <span>{{ formatDateTime(selectedRecord.createdAt) }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4>Triệu chứng</h4>
              <div class="detail-content">{{ selectedRecord.symptoms }}</div>
            </div>

            <div class="detail-section">
              <h4>Chẩn đoán</h4>
              <div class="detail-content">{{ selectedRecord.diagnosis }}</div>
            </div>

            <div class="detail-section">
              <h4>Điều trị</h4>
              <div class="detail-content">{{ selectedRecord.treatment }}</div>
            </div>

            <div v-if="selectedRecord.notes" class="detail-section">
              <h4>Ghi chú</h4>
              <div class="detail-content">{{ selectedRecord.notes }}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeDetailsModal" class="btn btn--secondary">Đóng</button>
          <button 
            v-if="isDoctor"
            @click="editRecord(selectedRecord)"
            class="btn btn--primary"
          >
            <i class="fas fa-edit"></i>
            Chỉnh sửa
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
  getMedicalRecords, 
  createMedicalRecord,
  updateMedicalRecord,
  getMedicalRecordById,
  type MedicalRecord,
  type CreateMedicalRecordRequest,
  type UpdateMedicalRecordRequest
} from '../lib/medicalRecords'
import { getPatients } from '../lib/account'

const { isAdmin, isDoctor, isPatient } = useAuth()

// State
const loading = ref(true)
const saving = ref(false)
const records = ref<MedicalRecord[]>([])
const patients = ref<any[]>([])
const selectedRecord = ref<MedicalRecord | null>(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const currentPage = ref(1)
const itemsPerPage = 9

// Filters
const filters = ref({
  search: '',
  startDate: '',
  endDate: '',
  patientSearch: ''
})

// Form
const recordForm = ref<CreateMedicalRecordRequest & { id?: number }>({
  patientId: 0,
  symptoms: '',
  diagnosis: '',
  treatment: '',
  notes: ''
})

// Computed
const filteredRecords = computed(() => {
  let filtered = records.value

  // Filter by search
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(record => 
      record.symptoms.toLowerCase().includes(search) ||
      record.diagnosis.toLowerCase().includes(search) ||
      record.treatment.toLowerCase().includes(search)
    )
  }

  // Filter by date range
  if (filters.value.startDate) {
    filtered = filtered.filter(record => 
      new Date(record.createdAt) >= new Date(filters.value.startDate)
    )
  }

  if (filters.value.endDate) {
    filtered = filtered.filter(record => 
      new Date(record.createdAt) <= new Date(filters.value.endDate)
    )
  }

  // Filter by patient search
  if (filters.value.patientSearch) {
    const search = filters.value.patientSearch.toLowerCase()
    filtered = filtered.filter(record => 
      record.patientName?.toLowerCase().includes(search)
    )
  }

  return filtered
})

const totalPages = computed(() => 
  Math.ceil(filteredRecords.value.length / itemsPerPage)
)

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredRecords.value.slice(start, end)
})

// Methods
const loadData = async () => {
  try {
    loading.value = true
    
    // Load medical records
    if (isPatient.value) {
      records.value = await getMedicalRecords() // This will call the patient-specific endpoint
    } else {
      records.value = await getMedicalRecords()
    }
    
    // Load patients for doctor/admin
    if (isDoctor.value || isAdmin.value) {
      patients.value = await getPatients()
    }
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadData()
}

const applyFilters = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  filters.value = {
    search: '',
    startDate: '',
    endDate: '',
    patientSearch: ''
  }
  currentPage.value = 1
}

const saveRecord = async () => {
  try {
    saving.value = true
    
    if (showEditModal.value) {
      const updateData: UpdateMedicalRecordRequest = {
        symptoms: recordForm.value.symptoms,
        diagnosis: recordForm.value.diagnosis,
        treatment: recordForm.value.treatment,
        notes: recordForm.value.notes
      }
      await updateMedicalRecord(recordForm.value.id!, updateData)
    } else {
      const createData: CreateMedicalRecordRequest = {
        patientId: recordForm.value.patientId,
        symptoms: recordForm.value.symptoms,
        diagnosis: recordForm.value.diagnosis,
        treatment: recordForm.value.treatment,
        notes: recordForm.value.notes
      }
      await createMedicalRecord(createData)
    }
    
    await loadData()
    closeModal()
  } catch (error) {
    console.error('Failed to save record:', error)
  } finally {
    saving.value = false
  }
}

const editRecord = (record: any) => {
  recordForm.value = {
    id: record.id,
    patientId: record.patientId,
    symptoms: record.symptoms,
    diagnosis: record.diagnosis,
    treatment: record.treatment,
    notes: record.notes || ''
  }
  showEditModal.value = true
  closeDetailsModal()
}

const viewRecordDetails = async (id: any) => {
  try {
    selectedRecord.value = await getMedicalRecordById(id)
  } catch (error) {
    console.error('Failed to load record details:', error)
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  recordForm.value = {
    patientId: 0,
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: ''
  }
}

const closeDetailsModal = () => {
  selectedRecord.value = null
}

const formatDay = (dateString: any) => {
  const date = new Date(dateString)
  return date.getDate()
}

const formatMonth = (dateString: any) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', { month: 'short' })
}

const formatDateTime = (dateString: any) => {
  const date = new Date(dateString)
  return date.toLocaleString('vi-VN')
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
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.medical-records-page {
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

.records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.record-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e9ecef;
}

.record-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.record-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.record-date {
  min-width: 60px;
  text-align: center;
}

.day {
  display: block;
  font-weight: 700;
  color: #007bff;
  font-size: 24px;
  line-height: 1;
}

.month {
  display: block;
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
}

.record-info {
  flex: 1;
}

.record-patient {
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
  font-size: 16px;
}

.record-doctor {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.record-content {
  margin-bottom: 16px;
}

.record-section {
  margin-bottom: 12px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  margin: 0 0 4px 0;
}

.section-content {
  font-size: 14px;
  color: #2c3e50;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.record-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
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

.modal--large {
  max-width: 800px;
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

.record-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 16px;
}

.detail-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.detail-content {
  color: #2c3e50;
  line-height: 1.6;
  white-space: pre-wrap;
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
  
  .records-grid {
    grid-template-columns: 1fr;
  }
  
  .record-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .modal {
    width: 95%;
    margin: 20px;
  }
}
</style>