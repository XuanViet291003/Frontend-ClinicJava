<template>
  <div class="create-account-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Tạo tài khoản mới</h1>
      <router-link to="/admin/accounts" class="btn btn--outline">
        <i class="fas fa-arrow-left"></i>
        Quay lại
      </router-link>
    </div>

    <!-- Account Form -->
    <div class="card">
      <div class="card__header">
        <h2 class="card__title">Thông tin tài khoản</h2>
      </div>
      
      <form @submit.prevent="submitAccount" class="account-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Họ *</label>
            <input 
              v-model="form.firstName" 
              class="form-control"
              :class="{ 'form-control--error': errors.firstName }"
              placeholder="Nhập họ"
              required
            >
            <div v-if="errors.firstName" class="form-error">{{ errors.firstName }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">Tên *</label>
            <input 
              v-model="form.lastName" 
              class="form-control"
              :class="{ 'form-control--error': errors.lastName }"
              placeholder="Nhập tên"
              required
            >
            <div v-if="errors.lastName" class="form-error">{{ errors.lastName }}</div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Tên đăng nhập *</label>
            <input 
              v-model="form.username" 
              class="form-control"
              :class="{ 'form-control--error': errors.username }"
              placeholder="Nhập tên đăng nhập"
              required
            >
            <div v-if="errors.username" class="form-error">{{ errors.username }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">Email *</label>
            <input 
              v-model="form.email" 
              type="email"
              class="form-control"
              :class="{ 'form-control--error': errors.email }"
              placeholder="Nhập email"
              required
            >
            <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Mật khẩu *</label>
            <input 
              v-model="form.password" 
              type="password"
              class="form-control"
              :class="{ 'form-control--error': errors.password }"
              placeholder="Nhập mật khẩu"
              required
            >
            <div v-if="errors.password" class="form-error">{{ errors.password }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">Xác nhận mật khẩu *</label>
            <input 
              v-model="form.confirmPassword" 
              type="password"
              class="form-control"
              :class="{ 'form-control--error': errors.confirmPassword }"
              placeholder="Nhập lại mật khẩu"
              required
            >
            <div v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Vai trò *</label>
            <select 
              v-model="form.role" 
              class="form-control"
              :class="{ 'form-control--error': errors.role }"
              required
            >
              <option value="">Chọn vai trò</option>
              <option value="ADMIN">Quản trị viên</option>
              <option value="DOCTOR">Bác sĩ</option>
              <option value="PATIENT">Bệnh nhân</option>
            </select>
            <div v-if="errors.role" class="form-error">{{ errors.role }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">Trạng thái</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input 
                  v-model="form.isActive" 
                  type="checkbox"
                >
                <span class="checkbox-text">Tài khoản hoạt động</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Account Summary -->
        <div v-if="form.firstName && form.lastName && form.role" class="account-summary">
          <h3>Xác nhận thông tin</h3>
          <div class="summary-content">
            <div class="summary-item">
              <i class="fas fa-user"></i>
              <span>{{ form.firstName }} {{ form.lastName }}</span>
            </div>
            <div class="summary-item">
              <i class="fas fa-at"></i>
              <span>{{ form.username || 'Chưa nhập' }}</span>
            </div>
            <div class="summary-item">
              <i class="fas fa-envelope"></i>
              <span>{{ form.email || 'Chưa nhập' }}</span>
            </div>
            <div class="summary-item">
              <i class="fas fa-user-tag"></i>
              <span>{{ getRoleText(form.role) }}</span>
            </div>
            <div class="summary-item">
              <i class="fas fa-toggle-on" :class="{ 'fa-toggle-off': !form.isActive }"></i>
              <span>{{ form.isActive ? 'Hoạt động' : 'Không hoạt động' }}</span>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <router-link to="/admin/accounts" class="btn btn--secondary">
            Hủy
          </router-link>
          <button 
            type="submit" 
            class="btn btn--primary"
            :disabled="loading || !isFormValid"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            {{ loading ? 'Đang tạo...' : 'Tạo tài khoản' }}
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
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { createAccount, type CreateAccountRequest } from '../../lib/account'

const router = useRouter()

// State
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Form data
const form = ref({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  isActive: true
})

// Form errors
const errors = ref({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: ''
})

// Computed
const isFormValid = computed(() => {
  return form.value.firstName.trim() && 
         form.value.lastName.trim() && 
         form.value.username.trim() && 
         form.value.email.trim() && 
         form.value.password.trim() && 
         form.value.confirmPassword.trim() && 
         form.value.role &&
         form.value.password === form.value.confirmPassword
})

// Methods
const validateForm = () => {
  errors.value = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  }

  let isValid = true

  if (!form.value.firstName.trim()) {
    errors.value.firstName = 'Vui lòng nhập họ'
    isValid = false
  }

  if (!form.value.lastName.trim()) {
    errors.value.lastName = 'Vui lòng nhập tên'
    isValid = false
  }

  if (!form.value.username.trim()) {
    errors.value.username = 'Vui lòng nhập tên đăng nhập'
    isValid = false
  } else if (form.value.username.length < 3) {
    errors.value.username = 'Tên đăng nhập phải có ít nhất 3 ký tự'
    isValid = false
  }

  if (!form.value.email.trim()) {
    errors.value.email = 'Vui lòng nhập email'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Email không hợp lệ'
    isValid = false
  }

  if (!form.value.password.trim()) {
    errors.value.password = 'Vui lòng nhập mật khẩu'
    isValid = false
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    isValid = false
  }

  if (!form.value.confirmPassword.trim()) {
    errors.value.confirmPassword = 'Vui lòng xác nhận mật khẩu'
    isValid = false
  } else if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Mật khẩu xác nhận không khớp'
    isValid = false
  }

  if (!form.value.role) {
    errors.value.role = 'Vui lòng chọn vai trò'
    isValid = false
  }

  return isValid
}

const submitAccount = async () => {
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const accountData: CreateAccountRequest = {
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      username: form.value.username.trim(),
      email: form.value.email.trim(),
      password: form.value.password,
      role: form.value.role as 'ADMIN' | 'DOCTOR' | 'PATIENT'
    }

    await createAccount(accountData)

    successMessage.value = 'Tạo tài khoản thành công!'
    
    // Reset form
    form.value = {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      isActive: true
    }

    // Redirect to accounts list after 2 seconds
    setTimeout(() => {
      router.push('/admin/accounts')
    }, 2000)

  } catch (error: any) {
    console.error('Failed to create account:', error)
    errorMessage.value = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản'
  } finally {
    loading.value = false
  }
}

const getRoleText = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'Quản trị viên'
    case 'DOCTOR': return 'Bác sĩ'
    case 'PATIENT': return 'Bệnh nhân'
    default: return role
  }
}

// Watch for form changes to clear errors
watch(form, () => {
  if (errorMessage.value) {
    errorMessage.value = ''
  }
}, { deep: true })
</script>

<style scoped>
.create-account-page {
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

.account-form {
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

.checkbox-group {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-text {
  font-size: 14px;
  color: #495057;
}

.account-summary {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid #007bff;
}

.account-summary h3 {
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

.summary-item .fa-toggle-off {
  color: #6c757d;
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