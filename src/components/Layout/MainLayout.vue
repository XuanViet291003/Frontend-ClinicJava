<template>
  <div class="main-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar--collapsed': sidebarCollapsed }">
      <div class="sidebar__header">
        <div class="sidebar__logo">
          <i class="fas fa-hospital"></i>
          <span v-if="!sidebarCollapsed" class="sidebar__title">ClinicApp</span>
        </div>
        <button 
          class="sidebar__toggle" 
          @click="toggleSidebar"
          :title="sidebarCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'"
        >
          <i :class="sidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
        </button>
      </div>

      <nav class="sidebar__nav">
        <ul class="nav-list">
          <!-- Dashboard -->
          <li class="nav-item">
            <router-link 
              :to="dashboardRoute" 
              class="nav-link"
              :class="{ 'nav-link--active': typeof $route.name === 'string' && $route.name.includes('dashboard') }"
            >
              <i class="fas fa-tachometer-alt nav-icon"></i>
              <span v-if="!sidebarCollapsed" class="nav-text">Tổng quan</span>
            </router-link>
          </li>

          <!-- Appointments -->
          <li class="nav-item">
            <router-link 
              :to="appointmentsRoute" 
              class="nav-link"
              :class="{ 'nav-link--active': typeof $route.name === 'string' && $route.name.includes('appointments') }"
            >
              <i class="fas fa-calendar-alt nav-icon"></i>
              <span v-if="!sidebarCollapsed" class="nav-text">Lịch hẹn</span>
            </router-link>
          </li>

          <!-- Medical Records -->
          <li class="nav-item">
            <router-link 
              :to="medicalRecordsRoute" 
              class="nav-link"
              :class="{ 'nav-link--active': typeof $route.name === 'string' && $route.name.includes('medical-records') }"
            >
              <i class="fas fa-file-medical nav-icon"></i>
              <span v-if="!sidebarCollapsed" class="nav-text">Bệnh án</span>
            </router-link>
          </li>

          <!-- Admin only: Account Management -->
          <li v-if="isAdmin" class="nav-item">
            <router-link 
              to="/admin/accounts" 
              class="nav-link"
              :class="{ 'nav-link--active': typeof $route.name === 'string' && $route.name.includes('accounts') }"
            >
              <i class="fas fa-users nav-icon"></i>
              <span v-if="!sidebarCollapsed" class="nav-text">Quản lý tài khoản</span>
            </router-link>
          </li>

          <!-- Doctor only: Patient List -->
          <li v-if="isDoctor" class="nav-item">
            <router-link 
              to="/doctor/patients" 
              class="nav-link"
              :class="{ 'nav-link--active': typeof $route.name === 'string' && $route.name.includes('patients') }"
            >
              <i class="fas fa-user-friends nav-icon"></i>
              <span v-if="!sidebarCollapsed" class="nav-text">Danh sách bệnh nhân</span>
            </router-link>
          </li>

          <!-- Patient only: Create Appointment -->
          <li v-if="isPatient" class="nav-item">
            <router-link 
              to="/patient/appointments/create" 
              class="nav-link"
              :class="{ 'nav-link--active': typeof $route.name === 'string' && $route.name.includes('create-appointment') }"
            >
              <i class="fas fa-plus nav-icon"></i>
              <span v-if="!sidebarCollapsed" class="nav-text">Đặt lịch hẹn</span>
            </router-link>
          </li>

          <!-- Notifications -->
          <li class="nav-item">
            <router-link 
              :to="notificationsRoute" 
              class="nav-link"
              :class="{ 'nav-link--active': typeof $route.name === 'string' && $route.name.includes('notifications') }"
            >
              <i class="fas fa-bell nav-icon"></i>
              <span v-if="!sidebarCollapsed" class="nav-text">Thông báo</span>
              <span v-if="!sidebarCollapsed && unreadCount > 0" class="nav-badge">{{ unreadCount }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="main-content" :class="{ 'main-content--expanded': sidebarCollapsed }">
      <!-- Header -->
      <header class="header">
        <div class="header__left">
          <h1 class="header__title">{{ pageTitle }}</h1>
        </div>
        
        <div class="header__right">
          <!-- Notifications Bell -->
          <div class="header__notifications">
            <router-link to="/notifications" class="notification-bell">
              <i class="fas fa-bell"></i>
              <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
            </router-link>
          </div>

          <!-- User Menu -->
          <div class="header__user">
            <div class="user-menu" @click="toggleUserMenu">
              <div class="user-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="user-info">
                <span class="user-name">{{ user?.firstName }} {{ user?.lastName }}</span>
                <span class="user-role">{{ getRoleDisplayName(user?.role) }}</span>
              </div>
              <i class="fas fa-chevron-down user-arrow"></i>
            </div>

            <!-- Dropdown Menu -->
            <div v-if="showUserMenu" class="user-dropdown">
              <div class="dropdown-item" @click="goToProfile">
                <i class="fas fa-user"></i>
                <span>Thông tin cá nhân</span>
              </div>
              <div class="dropdown-item" @click="logout">
                <i class="fas fa-sign-out-alt"></i>
                <span>Đăng xuất</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-content">
        <router-view />
      </main>
    </div>

    <!-- Mobile Overlay -->
    <div 
      v-if="!sidebarCollapsed && isMobile" 
      class="mobile-overlay" 
      @click="sidebarCollapsed = true"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../../lib/auth'
import { getNotifications } from '../../lib/notifications'

const router = useRouter()
const route = useRoute()
const { user, logout: authLogout, isAdmin, isDoctor, isPatient } = useAuth()

// State
const sidebarCollapsed = ref(false)
const showUserMenu = ref(false)
const isMobile = ref(false)
const unreadCount = ref(0)

// Computed
const dashboardRoute = computed(() => {
  if (isAdmin.value) return '/admin/dashboard'
  if (isDoctor.value) return '/doctor/dashboard'
  return '/patient/dashboard'
})

const appointmentsRoute = computed(() => {
  if (isAdmin.value) return '/admin/appointments'
  if (isDoctor.value) return '/doctor/appointments'
  return '/patient/appointments'
})

const medicalRecordsRoute = computed(() => {
  if (isAdmin.value) return '/admin/medical-records'
  if (isDoctor.value) return '/doctor/medical-records'
  return '/patient/medical-records'
})

const notificationsRoute = computed(() => {
  if (isAdmin.value) return '/admin/notifications'
  if (isDoctor.value) return '/doctor/notifications'
  return '/patient/notifications'
})

const pageTitle = computed(() => {
  const routeName = route.name as string
  if (routeName?.includes('dashboard')) return 'Tổng quan'
  if (routeName?.includes('appointments')) return 'Quản lý lịch hẹn'
  if (routeName?.includes('medical-records')) return 'Quản lý bệnh án'
  if (routeName?.includes('accounts')) return 'Quản lý tài khoản'
  if (routeName?.includes('patients')) return 'Danh sách bệnh nhân'
  if (routeName?.includes('notifications')) return 'Thông báo'
  return 'ClinicApp'
})

// Methods
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const goToProfile = () => {
  showUserMenu.value = false
  // TODO: Implement profile page
}

const logout = async () => {
  showUserMenu.value = false
  await authLogout()
}

const getRoleDisplayName = (role?: string) => {
  switch (role) {
    case 'ADMIN': return 'Quản trị viên'
    case 'DOCTOR': return 'Bác sĩ'
    case 'PATIENT': return 'Bệnh nhân'
    default: return ''
  }
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
}

const loadNotifications = async () => {
  try {
    const notifications = await getNotifications()
    unreadCount.value = notifications.filter(n => !n.isRead).length
  } catch (error) {
    console.error('Failed to load notifications:', error)
  }
}

// Lifecycle
onMounted(() => {
  checkMobile()
  loadNotifications()
  window.addEventListener('resize', checkMobile)
  document.addEventListener('click', (e) => {
    if (!(e.target as Element).closest('.header__user')) {
      showUserMenu.value = false
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  background-color: #f8f9fa;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  transition: width 0.3s ease;
  position: relative;
  z-index: 1000;
}

.sidebar--collapsed {
  width: 70px;
}

.sidebar__header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar__logo i {
  font-size: 24px;
  color: #fff;
}

.sidebar__title {
  font-size: 20px;
  font-weight: 700;
  color: white;
}

.sidebar__toggle {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.sidebar__toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar__nav {
  padding: 20px 0;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link--active {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
}

.nav-link--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #fff;
}

.nav-icon {
  width: 20px;
  text-align: center;
  margin-right: 12px;
}

.nav-text {
  font-weight: 500;
}

.nav-badge {
  background-color: #dc3545;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: auto;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.main-content--expanded {
  margin-left: 0;
}

/* Header */
.header {
  background: white;
  padding: 0 30px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

.header__title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.header__right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header__notifications {
  position: relative;
}

.notification-bell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f8f9fa;
  color: #6c757d;
  text-decoration: none;
  transition: all 0.2s;
}

.notification-bell:hover {
  background-color: #e9ecef;
  color: #495057;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #dc3545;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* User Menu */
.header__user {
  position: relative;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-menu:hover {
  background-color: #f8f9fa;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #007bff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.user-role {
  font-size: 12px;
  color: #6c757d;
}

.user-arrow {
  font-size: 12px;
  color: #6c757d;
  transition: transform 0.2s;
}

.user-menu:hover .user-arrow {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 200px;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item i {
  width: 16px;
  color: #6c757d;
}

/* Page Content */
.page-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1000;
  }
  
  .sidebar--collapsed {
    transform: translateX(-100%);
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .header {
    padding: 0 20px;
  }
  
  .page-content {
    padding: 20px;
  }
}
</style>
