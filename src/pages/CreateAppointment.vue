<template>  
  <div class="create-appointment-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Đặt lịch hẹn</h1>
      <router-link to="/patient/appointments" class="btn btn--outline">
        <i class="fas fa-arrow-left"></i>
        Quay lại
      </router-link>
    </div>

    <!-- Appointment Form -->
    <div class="card">
      <div class="card__header">
        <h2 class="card__title">Thông tin lịch hẹn</h2>
      </div>
      
      <form @submit.prevent="submitAppointment" class="appointment-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Bác sĩ *</label>
            <select 
              v-model="form.doctorId" 
              class="form-control"
              :class="{ 'form-control--error': errors.doctorId }"
              required
            >
              <option value="">Chọn bác sĩ</option>
              <option 
                v-for="doctor in doctors" 
                :key="doctor.id" 
                :value="doctor.id"
              >
                {{ doctor.firstName }} {{ doctor.lastName }}
              </option>
            </select>
            <div v-if="errors.doctorId" class="form-error">{{ errors.doctorId }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">Ngày hẹn *</label>
            <input 
              v-model="form.appointmentDate" 
              type="date" 
              class="form-control"
              :class="{ 'form-control--error': errors.appointmentDate }"
              :min="minDate"
              required
            >
            <div v-if="errors.appointmentDate" class="form-error">{{ errors.appointmentDate }}</div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Giờ hẹn *</label>
            <select 
              v-model="form.appointmentTime" 
              class="form-control"
              :class="{ 'form-control--error': errors.appointmentTime }"
              required
            >
              <option value="">Chọn giờ</option>
              <option 
                v-for="timeSlot in availableTimeSlots" 
                :key="timeSlot.value" 
                :value="timeSlot.value"
                :disabled="timeSlot.disabled"
              >
                {{ timeSlot.label }}
              </option>
            </select>
            <div v-if="errors.appointmentTime" class="form-error">{{ errors.appointmentTime }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">Loại khám</label>
            <select v-model="form.appointmentType" class="form-control">
              <option value="GENERAL">Khám tổng quát</option>
              <option value="SPECIALIST">Khám chuyên khoa</option>
              <option value="FOLLOW_UP">Tái khám</option>
              <option value="EMERGENCY">Khám cấp cứu</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Lý do khám *</label>
          <textarea 
            v-model="form.reason" 
            class="form-control"
            :class="{ 'form-control--error': errors.reason }"
            rows="4"
            placeholder="Mô tả triệu chứng hoặc lý do muốn khám..."
            required
          ></textarea>
          <div v-if="errors.reason" class="form-error">{{ errors.reason }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">Ghi chú thêm</label>
          <textarea 
            v-model="form.notes" 
            class="form-control"
            rows="2"
            placeholder="Thông tin bổ sung (nếu có)..."
          ></textarea>
        </div>

        <!-- Selected Appointment Summary -->
        <div v-if="form.doctorId && form.appointmentDate && form.appointmentTime" class="appointment-summary">
          <h3>Xác nhận lịch hẹn</h3>
          <div class="summary-content">
            <div class="summary-item">
              <i class="fas fa-user-md"></i>
              <span>{{ getDoctorName(form.doctorId) }}</span>
            </div>
            <div class="summary-item">
              <i class="fas fa-calendar"></i>
              <span>{{ formatDate(form.appointmentDate) }}</span>
            </div>
            <div class="summary-item">
              <i class="fas fa-clock"></i>
              <span>{{ form.appointmentTime }}</span>
            </div>
            <div class="summary-item">
              <i class="fas fa-stethoscope"></i>
              <span>{{ getAppointmentTypeText(form.appointmentType) }}</span>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <router-link to="/patient/appointments" class="btn btn--secondary">
            Hủy
          </router-link>
          <button 
            type="submit" 
            class="btn btn--primary"
            :disabled="loading || !isFormValid"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            {{ loading ? 'Đang đặt lịch...' : 'Đặt lịch hẹn' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="alert alert--success">
      <i class="fas fa-check-circle"></i>
      {{ successMessage }}
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="alert alert--error">
      <i class="fas fa-exclamation-circle"></i>
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { createAppointment, type CreateAppointmentRequest } from '../lib/appointments'
import { getDoctors, type Account } from '../lib/account'

const router = useRouter()

// State
const loading = ref(false)
const doctors = ref<Account[]>([])
const successMessage = ref('')
const errorMessage = ref('')

// Form data
const form = ref({
  doctorId: '',
  appointmentDate: '',
  appointmentTime: '',
  appointmentType: 'GENERAL',
  reason: '',
  notes: ''
})

// Form errors
const errors = ref({
  doctorId: '',
  appointmentDate: '',
  appointmentTime: '',
  reason: ''
})

// Computed
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const isFormValid = computed(() => {
  return form.value.doctorId && 
         form.value.appointmentDate && 
         form.value.appointmentTime && 
         form.value.reason.trim()
})

const availableTimeSlots = computed(() => {
  const slots = [
    { value: '08:00', label: '8:00 - 8:30' },
    { value: '08:30', label: '8:30 - 9:00' },
    { value: '09:00', label: '9:00 - 9:30' },
    { value: '09:30', label: '9:30 - 10:00' },
    { value: '10:00', label: '10:00 - 10:30' },
    { value: '10:30', label: '10:30 - 11:00' },
    { value: '11:00', label: '11:00 - 11:30' },
    { value: '11:30', label: '11:30 - 12:00' },
    { value: '14:00', label: '14:00 - 14:30' },
    { value: '14:30', label: '14:30 - 15:00' },
    { value: '15:00', label: '15:00 - 15:30' },
    { value: '15:30', label: '15:30 - 16:00' },
    { value: '16:00', label: '16:00 - 16:30' },
    { value: '16:30', label: '16:30 - 17:00' },
    { value: '17:00', label: '17:00 - 17:30' },
    { value: '17:30', label: '17:30 - 18:00' }
  ]

  // TODO: Check for existing appointments and mark slots as disabled
  // For now, all slots are available
  return slots.map(slot => ({
    ...slot,
    disabled: false
  }))
})

// Methods
const loadDoctors = async () => {
  try {
    doctors.value = await getDoctors()
  } catch (error) {
    console.error('Failed to load doctors:', error)
    errorMessage.value = 'Không thể tải danh sách bác sĩ'
  }
}

const validateForm = () => {
  errors.value = {
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  }

  let isValid = true

  if (!form.value.doctorId) {
    errors.value.doctorId = 'Vui lòng chọn bác sĩ'
    isValid = false
  }

  if (!form.value.appointmentDate) {
    errors.value.appointmentDate = 'Vui lòng chọn ngày hẹn'
    isValid = false
  } else {
    const selectedDate = new Date(form.value.appointmentDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate <= today) {
      errors.value.appointmentDate = 'Ngày hẹn phải sau ngày hiện tại'
      isValid = false
    }
  }

  if (!form.value.appointmentTime) {
    errors.value.appointmentTime = 'Vui lòng chọn giờ hẹn'
    isValid = false
  }

  if (!form.value.reason.trim()) {
    errors.value.reason = 'Vui lòng mô tả lý do khám'
    isValid = false
  }

  return isValid
}

const submitAppointment = async () => {
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // Combine date and time
    const appointmentDateTime = `${form.value.appointmentDate}T${form.value.appointmentTime}:00`

    const appointmentData: CreateAppointmentRequest = {
      doctorId: parseInt(form.value.doctorId),
      appointmentDate: appointmentDateTime,
      reason: form.value.reason.trim()
    }

    await createAppointment(appointmentData)

    successMessage.value = 'Đặt lịch hẹn thành công! Bạn sẽ nhận được thông báo khi lịch hẹn được xác nhận.'
    
    // Reset form
    form.value = {
      doctorId: '',
      appointmentDate: '',
      appointmentTime: '',
      appointmentType: 'GENERAL',
      reason: '',
      notes: ''
    }

    // Redirect to appointments list after 2 seconds
    setTimeout(() => {
      router.push('/patient/appointments')
    }, 2000)

  } catch (error: any) {
    console.error('Failed to create appointment:', error)
    errorMessage.value = error?.response?.data?.message || 'Có lỗi xảy ra khi đặt lịch hẹn'
  } finally {
    loading.value = false
  }
}

const getDoctorName = (doctorId: string) => {
  const doctor = doctors.value.find(d => d.id === parseInt(doctorId))
  return doctor ? `${doctor.firstName} ${doctor.lastName}` : ''
}

const getAppointmentTypeText = (type: string) => {
  switch (type) {
    case 'GENERAL': return 'Khám tổng quát'
    case 'SPECIALIST': return 'Khám chuyên khoa'
    case 'FOLLOW_UP': return 'Tái khám'
    case 'EMERGENCY': return 'Khám cấp cứu'
    default: return type
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Watch for form changes to clear errors
watch(form, () => {
  if (errorMessage.value) {
    errorMessage.value = ''
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadDoctors()
})
</script>

<style scoped>
.create-appointment-page {
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

.appointment-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.appointment-summary {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid #007bff;
}

.appointment-summary h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #495057;
}

.summary-item i {
  color: #007bff;
  width: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.alert {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.alert i {
  font-size: 16px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .summary-content {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>