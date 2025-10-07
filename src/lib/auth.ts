import { ref, computed, watch, onMounted, onUnmounted, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import api from './api';
import { jwtDecode } from 'jwt-decode';

export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  token: string;
}

interface TokenPayload {
  sub: string;
  id: number;
  role: string;
  email: string;
  firstName: string;
  lastName: string;
  exp: number;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

const AUTH_TOKEN_KEY = 'auth_token';

// Create refs outside of composable but don't expose them directly
const userRef: Ref<AuthUser | null> = ref(null);
const loadingRef = ref(false);
const errorRef = ref('');

// Initialize auth state from localStorage
try {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    const decoded = jwtDecode<TokenPayload>(token);
    if (decoded.exp * 1000 > Date.now()) {
      userRef.value = {
        id: decoded.id,
        username: decoded.sub,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        role: decoded.role as UserRole,
        token
      };
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }
} catch (e) {
  console.error('Error initializing auth state:', e);
}

// Update axios default headers when token changes
watch(() => userRef.value?.token, (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}, { immediate: true });

// Export these functions for use in router
export function getCurrentUser(): AuthUser | null {
  return userRef.value;
}

export function hasRole(role: UserRole): boolean {
  return userRef.value?.role === role;
}

export function useAuth() {
  const router = useRouter();

  const isAuthenticated = computed(() => userRef.value !== null);
  
  const hasRole = (role: UserRole) => userRef.value?.role === role;

  const isAdmin = computed(() => hasRole('ADMIN'));
  const isDoctor = computed(() => hasRole('DOCTOR'));
  const isPatient = computed(() => hasRole('PATIENT'));

  async function login({ username, password }: LoginRequest) {
    try {
      loadingRef.value = true;
      errorRef.value = '';
      
      const res = await api.post<string>('/v1/auth/login', { username, password });
      const token = res.data;
      
      if (!token) throw new Error('Token not found in response');
      
      const decoded = jwtDecode<TokenPayload>(token);
      
      userRef.value = {
        id: decoded.id,
        username: decoded.sub,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        role: decoded.role as UserRole,
        token
      };
      
      localStorage.setItem(AUTH_TOKEN_KEY, token);

      // Redirect based on role
      if (hasRole('ADMIN')) {
        router.push('/admin/dashboard');
      } else if (hasRole('DOCTOR')) {
        router.push('/doctor/dashboard');
      } else {
        router.push('/patient/dashboard');
      }
    } catch (e) {
      errorRef.value = e instanceof Error ? e.message : 'Failed to login';
      throw e;
    } finally {
      loadingRef.value = false;
    }
  }

  async function register(request: RegisterRequest) {
    try {
      loadingRef.value = true;
      errorRef.value = '';
      
      await api.post('/v1/auth/register', request);
      return 'Account created successfully';
    } catch (e) {
      errorRef.value = e instanceof Error ? e.message : 'Failed to register';
      throw e;
    } finally {
      loadingRef.value = false;
    }
  }

  async function logout() {
    try {
      loadingRef.value = true;
      errorRef.value = '';
      
      await api.post('/v1/auth/logout');
      userRef.value = null;
      localStorage.removeItem(AUTH_TOKEN_KEY);
      router.push('/login');
    } catch (e) {
      errorRef.value = e instanceof Error ? e.message : 'Failed to logout';
      throw e;
    } finally {
      loadingRef.value = false;
    }
  }

  // Check token expiration periodically
  let expirationTimer: number;

  onMounted(() => {
    expirationTimer = window.setInterval(() => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        try {
          const decoded = jwtDecode<TokenPayload>(token);
          if (decoded.exp * 1000 <= Date.now()) {
            userRef.value = null;
            localStorage.removeItem(AUTH_TOKEN_KEY);
            router.push('/login');
          }
        } catch {
          userRef.value = null;
          localStorage.removeItem(AUTH_TOKEN_KEY);
          router.push('/login');
        }
      }
    }, 60000); // Check every minute
  });

  onUnmounted(() => {
    if (expirationTimer) {
      clearInterval(expirationTimer);
    }
  });

  return {
    user: computed(() => userRef.value),
    loading: computed(() => loadingRef.value),
    error: computed(() => errorRef.value),
    isAuthenticated,
    isAdmin,
    isDoctor,
    isPatient,
    login,
    register,
    logout,
    hasRole,
    $subscribe: (callback: (user: AuthUser | null) => void) => 
      watch(userRef, callback, { immediate: true })
  };
}