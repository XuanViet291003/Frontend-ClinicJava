import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser, hasRole } from './lib/auth'

// Import các component thông thường
import Login from '@/pages/Login.vue'
import AdminLogin from '@/pages/AdminLogin.vue'
import Register from '@/pages/Register.vue'
import Appointments from '@/pages/Appointments.vue'
import CreateAppointment from '@/pages/CreateAppointment.vue'
import MedicalRecords from '@/pages/MedicalRecords.vue'
import Notifications from '@/pages/Notifications.vue'

// Lazy load các component khác
const AdminDashboard = () => import('@/pages/AdminDashboard.vue')
const DoctorDashboard = () => import('@/pages/DoctorDashboard.vue')
const PatientDashboard = () => import('@/pages/PatientDashboard.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: () => {
        const user = getCurrentUser()
        if (!user) return '/login'
        
        switch (user.role) {
          case 'ADMIN':
            return '/admin/dashboard'
          case 'DOCTOR':
            return '/doctor/dashboard'
          case 'PATIENT':
            return '/patient/dashboard'
          default:
            return '/login'
        }
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { guest: true }
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: AdminLogin,
      meta: { guest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { guest: true }
    },
    // Admin routes
    {
      path: '/admin',
      meta: { requiresAuth: true, role: 'ADMIN' },
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: AdminDashboard
        },
        {
          path: 'accounts',
          name: 'admin-accounts',
          component: () => import('@/pages/admin/AccountList.vue')
        },
        {
          path: 'accounts/create',
          name: 'admin-accounts-create',
          component: () => import('@/pages/admin/CreateAccount.vue')
        },
        {
          path: 'medical-records',
          name: 'admin-medical-records',
          component: () => import('@/pages/admin/MedicalRecordsList.vue')
        }
      ]
    },
    // Doctor routes
    {
      path: '/doctor',
      meta: { requiresAuth: true, role: 'DOCTOR' },
      children: [
        {
          path: 'dashboard',
          name: 'doctor-dashboard',
          component: DoctorDashboard
        },
        {
          path: 'patients',
          name: 'doctor-patients',
          component: () => import('@/pages/doctor/PatientList.vue')
        },
        {
          path: 'appointments',
          name: 'doctor-appointments',
          component: Appointments
        },
        {
          path: 'appointments/today',
          name: 'doctor-appointments-today',
          component: () => import('@/pages/doctor/TodayAppointments.vue')
        },
        {
          path: 'medical-records',
          name: 'doctor-medical-records',
          component: MedicalRecords
        }
      ]
    },
    // Patient routes
    {
      path: '/patient',
      meta: { requiresAuth: true, role: 'PATIENT' },
      children: [
        {
          path: 'dashboard',
          name: 'patient-dashboard',
          component: PatientDashboard
        },
        {
          path: 'appointments',
          name: 'patient-appointments',
          component: Appointments
        },
        {
          path: 'appointments/create',
          name: 'patient-create-appointment',
          component: CreateAppointment
        },
        {
          path: 'medical-records',
          name: 'patient-medical-records',
          component: MedicalRecords
        },
        {
          path: 'notifications',
          name: 'patient-notifications',
          component: Notifications
        }
      ]
    },
    // Fallback route
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const user = getCurrentUser()
  
  // Check if route requires auth
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!user) {
      next({ name: 'login' })
      return
    }

    // Check role requirements
    if (to.meta.role && !hasRole(to.meta.role as any)) {
      // Redirect to appropriate dashboard based on user role
      switch (user.role) {
        case 'ADMIN':
          next({ name: 'admin-dashboard' })
          break
        case 'DOCTOR':
          next({ name: 'doctor-dashboard' })
          break
        case 'PATIENT':
          next({ name: 'patient-dashboard' })
          break
        default:
          next({ name: 'login' })
      }
      return
    }
  }

  // Handle guest routes (login, register)
  if (to.matched.some(record => record.meta.guest)) {
    if (user) {
      switch (user.role) {
        case 'ADMIN':
          next({ name: 'admin-dashboard' })
          return
        case 'DOCTOR':
          next({ name: 'doctor-dashboard' })
          return
        case 'PATIENT':
          next({ name: 'patient-dashboard' })
          return
      }
    }
  }

  next()
})

export default router