<template>
  <div class="accounts-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Quản lý tài khoản</h1>
      <div class="page-actions">
        <button @click="refreshData" class="btn btn--outline" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          Làm mới
        </button>
        <router-link to="/admin/accounts/create" class="btn btn--primary">
          <i class="fas fa-plus"></i>
          Tạo tài khoản
        </router-link>
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
            placeholder="Tìm kiếm theo tên, email..." 
            class="form-control"
          >
        </div>

        <div class="filter-group">
          <label class="form-label">Vai trò</label>
          <select v-model="filters.roleName" @change="applyFilters" class="form-control">
            <option value="">Tất cả</option>
            <option value="ADMIN">Quản trị viên</option>
            <option value="DOCTOR">Bác sĩ</option>
            <option value="PATIENT">Bệnh nhân</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="form-label">Trạng thái</label>
          <select v-model="filters.status" @change="applyFilters" class="form-control">
            <option value="">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>

        <div class="filter-group">
          <button @click="clearFilters" class="btn btn--secondary">
            <i class="fas fa-times"></i>
            Xóa bộ lọc
          </button>
        </div>
      </div>
    </div>

    <!-- Accounts Table -->
    <div class="table-container">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <div v-else-if="filteredAccounts.length === 0" class="empty-state">
        <i class="fas fa-users empty-icon"></i>
        <h3>Không có tài khoản nào</h3>
        <p>Không tìm thấy tài khoản nào phù hợp với bộ lọc.</p>
        <router-link to="/admin/accounts/create" class="btn btn--primary">
          <i class="fas fa-plus"></i>
          Tạo tài khoản
        </router-link>
      </div>

      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th>Tài khoản</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="account in paginatedAccounts" :key="account.id">
              <td>
                <div class="account-cell">
                  <div class="account-avatar">
                    <i class="fas fa-user"></i>
                  </div>
                  <div class="account-info">
                    <div class="account-name">{{ account.firstName }} {{ account.lastName }}</div>
                    <div class="account-username">@{{ account.username }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="email-cell">{{ account.email }}</div>
              </td>
              <td>
                <span 
                  class="role-badge"
                  :class="`role-badge--${(getRoleText(account.roleId) ?? '').toLowerCase()}`"
                >
                  {{ getRoleText(account.roleId) ?? '' }}
                </span>
              </td>
              <td>
                <span 
                  class="status-badge"
                  :class="account.isActive ? 'status-badge--active' : 'status-badge--inactive'"
                >
                  {{ account.isActive ? 'Hoạt động' : 'Không hoạt động' }}
                </span>
              </td>
              <td>
                <div class="date-cell">{{ formatDate(account.createdAt) }}</div>
              </td>
              <td>
                <div class="actions">
                  <button 
                    @click="viewAccountDetails(account.id)"
                    class="btn btn--outline btn--sm"
                    title="Xem chi tiết"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    @click="editAccount(account)"
                    class="btn btn--primary btn--sm"
                    title="Chỉnh sửa"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    @click="toggleAccountStatus(account)"
                    class="btn btn--secondary btn--sm"
                    :title="account.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'"
                  >
                    <i :class="account.isActive ? 'fas fa-ban' : 'fas fa-check'"></i>
                  </button>
                  <button 
                    @click="deleteAccount(account)"
                    class="btn btn--danger btn--sm"
                    title="Xóa tài khoản"
                  >
                    <i class="fas fa-trash"></i>
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

    <!-- Account Details Modal -->
    <div v-if="selectedAccount" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Chi tiết tài khoản</h3>
          <button @click="closeDetailsModal" class="btn btn--secondary btn--sm">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="account-details">
            <div class="detail-section">
              <h4>Thông tin cá nhân</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Họ tên:</label>
                  <span>{{ selectedAccount.firstName }} {{ selectedAccount.lastName }}</span>
                </div>
                <div class="detail-item">
                  <label>Tên đăng nhập:</label>
                  <span>{{ selectedAccount.username }}</span>
                </div>
                <div class="detail-item">
                  <label>Email:</label>
                  <span>{{ selectedAccount.email }}</span>
                </div>
                <div class="detail-item">
                  <label>Vai trò:</label>
                  <span 
                    class="role-badge"
                    :class="`role-badge--${selectedAccount.roleName.toLowerCase()}`"
                  >
                    {{ getRoleText(selectedAccount.roleid) }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Trạng thái:</label>
                  <span 
                    class="status-badge"
                    :class="selectedAccount.isActive ? 'status-badge--active' : 'status-badge--inactive'"
                  >
                    {{ selectedAccount.isActive ? 'Hoạt động' : 'Không hoạt động' }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Ngày tạo:</label>
                  <span>{{ formatDateTime(selectedAccount.createdAt) }}</span>
                </div>
                <div class="detail-item">
                  <label>Cập nhật cuối:</label>
                  <span>{{ formatDateTime(selectedAccount.updatedAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeDetailsModal" class="btn btn--secondary">Đóng</button>
          <button @click="editAccount(selectedAccount)" class="btn btn--primary">
            <i class="fas fa-edit"></i>
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Account Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Chỉnh sửa tài khoản</h3>
          <button @click="closeEditModal" class="btn btn--secondary btn--sm">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveAccount">
            <div class="form-group">
              <label class="form-label">Họ *</label>
              <input 
                v-model="editForm.firstName" 
                class="form-control"
                :class="{ 'form-control--error': errors.firstName }"
                required
              >
              <div v-if="errors.firstName" class="form-error">{{ errors.firstName }}</div>
            </div>

            <div class="form-group">
              <label class="form-label">Tên *</label>
              <input 
                v-model="editForm.lastName" 
                class="form-control"
                :class="{ 'form-control--error': errors.lastName }"
                required
              >
              <div v-if="errors.lastName" class="form-error">{{ errors.lastName }}</div>
            </div>

            <div class="form-group">
              <label class="form-label">Email *</label>
              <input 
                v-model="editForm.email" 
                type="email"
                class="form-control"
                :class="{ 'form-control--error': errors.email }"
                required
              >
              <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
            </div>

            <div class="form-group">
              <label class="form-label">Vai trò *</label>
              <select 
                v-model="editForm.roleName" 
                class="form-control"
                :class="{ 'form-control--error': errors.role }"
                required
              >
                <option value="ADMIN">Quản trị viên</option>
                <option value="DOCTOR">Bác sĩ</option>
                <option value="PATIENT">Bệnh nhân</option>
              </select>
              <div v-if="errors.role" class="form-error">{{ errors.role }}</div>
            </div>

            <div class="form-group">
              <label class="form-label">Mật khẩu mới</label>
              <input 
                v-model="editForm.password" 
                type="password"
                class="form-control"
                placeholder="Để trống nếu không muốn thay đổi"
              >
            </div>

            <div class="form-group">
              <label class="form-label">
                <input 
                  v-model="editForm.isActive" 
                  type="checkbox"
                >
                Tài khoản hoạt động
              </label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="closeEditModal" class="btn btn--secondary">Hủy</button>
          <button 
            @click="saveAccount" 
            class="btn btn--primary"
            :disabled="saving"
          >
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            {{ saving ? 'Đang lưu...' : 'Cập nhật' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  getAccounts, 
  getAccountById,
  updateAccount,
  deleteAccount as deleteAccountAPI,
  type Account,
  type UpdateAccountRequest
} from '../../lib/account'

// State
const loading = ref(true)
const saving = ref(false)
const accounts = ref<Account[]>([])
const selectedAccount = ref<Account | null>(null)
const showEditModal = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10

// Filters
const filters = ref({
  search: '',
  roleName: '',
  status: ''
})

// Edit form
const editForm = ref<UpdateAccountRequest & { id?: number }>({
  firstName: '',
  lastName: '',
  email: '',
  roleid: 0,
  roleName: '',
  password: '',
  isActive: true
})

// Form errors
const errors = ref({
  firstName: '',
  lastName: '',
  email: '',
  role: ''
})

// Computed
const filteredAccounts = computed(() => {
  let filtered = accounts.value

  // Filter by search
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(account => 
      account.firstName.toLowerCase().includes(search) ||
      account.lastName.toLowerCase().includes(search) ||
      account.email.toLowerCase().includes(search) ||
      account.username.toLowerCase().includes(search)
    )
  }

  // Filter by role
  if (filters.value.roleName) {
    filtered = filtered.filter(account => account.roleName === filters.value.roleName)
  }

  // Filter by status
  if (filters.value.status) {
    const isActive = filters.value.status === 'active'
    filtered = filtered.filter(account => account.isActive === isActive)
  }

  return filtered
})

const totalPages = computed(() => 
  Math.ceil(filteredAccounts.value.length / itemsPerPage)
)

const paginatedAccounts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return ((filteredAccounts.value as any).data ?? []).slice(start, end)
})

// Methods
const loadAccounts = async () => {
  try {
    loading.value = true
    accounts.value = await getAccounts()
  } catch (error) {
    console.error('Failed to load accounts:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadAccounts()
}

const applyFilters = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  filters.value = {
    search: '',
    roleName: '',
    status: ''
  }
  currentPage.value = 1
}

const viewAccountDetails = async (id: number) => {
  try {
    selectedAccount.value = await getAccountById(id)
  } catch (error) {
    console.error('Failed to load account details:', error)
  }
}

const editAccount = (account: Account) => {
  editForm.value = {
    id: account.id,
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email,
    roleid: account.roleid,
    password: '',
    isActive: account.isActive
  }
  showEditModal.value = true
  closeDetailsModal()
}

const saveAccount = async () => {
  try {
    saving.value = true
    
    const updateData: UpdateAccountRequest = {
      firstName: editForm.value.firstName,
      lastName: editForm.value.lastName,
      email: editForm.value.email,
      roleid: editForm.value.roleid,
      isActive: editForm.value.isActive
    }

    if (editForm.value.password) {
      updateData.password = editForm.value.password
    }

    await updateAccount(editForm.value.id!, updateData)
    await loadAccounts()
    closeEditModal()
  } catch (error) {
    console.error('Failed to save account:', error)
  } finally {
    saving.value = false
  }
}

const toggleAccountStatus = async (account: Account) => {
  try {
    const updateData: UpdateAccountRequest = {
      isActive: !account.isActive
    }
    await updateAccount(account.id, updateData)
    await loadAccounts()
  } catch (error) {
    console.error('Failed to toggle account status:', error)
  }
}

const deleteAccount = async (account: Account) => {
  if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản "${account.firstName} ${account.lastName}"?`)) {
    return
  }

  try {
    await deleteAccountAPI(account.id)
    await loadAccounts()
  } catch (error) {
    console.error('Failed to delete account:', error)
  }
}

const closeDetailsModal = () => {
  selectedAccount.value = null
}

const closeEditModal = () => {
  showEditModal.value = false
  editForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    roleid: 0,
    roleName: '',
    password: '',
    isActive: true
  }
  errors.value = {
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  }
}

const getRoleText = (role: number) => {
  switch (role) {
    case 1: return 'Bệnh nhân'
    case 2: return 'Bác sĩ'
    case 3: return 'Quản trị viên'
    default: return 'Không xác định'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

const formatDateTime = (dateString: string) => {
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
  loadAccounts()
})
</script>

<style scoped>
.accounts-page {
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

.account-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.account-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #007bff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.account-info {
  display: flex;
  flex-direction: column;
}

.account-name {
  font-weight: 600;
  color: #2c3e50;
}

.account-username {
  font-size: 12px;
  color: #6c757d;
}

.email-cell {
  color: #495057;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge--admin {
  background-color: #dc3545;
  color: white;
}

.role-badge--doctor {
  background-color: #007bff;
  color: white;
}

.role-badge--patient {
  background-color: #28a745;
  color: white;
}

.status-badge--active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge--inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.date-cell {
  color: #6c757d;
  font-size: 14px;
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
}

.account-details {
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
  
  .modal {
    width: 95%;
    margin: 20px;
  }
}
</style>