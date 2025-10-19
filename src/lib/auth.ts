import { ref, computed, watch, onMounted, onUnmounted, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import api from './api'
import { jwtDecode } from 'jwt-decode'

export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT'

export interface AuthUser {
	id: number
	username: string
	email?: string
	firstName?: string
	lastName?: string
	role: UserRole
	token: string
}

interface TokenPayload {
	sub?: string
	id?: number
	role?: string | number
	roles?: string[]
	role_id?: number
	email?: string
	firstName?: string
	lastName?: string
	exp?: number
}

interface LoginRequest {
	username: string
	password: string
}

interface RegisterRequest {
	username: string
	password: string
	email?: string
	firstName?: string
	lastName?: string
	role?: UserRole
	fullName?: string
}

const AUTH_TOKEN_KEY = 'token' // matches api.ts interceptor

const userRef: Ref<AuthUser | null> = ref(null)
const loadingRef = ref(false)
const errorRef = ref('')

function parseRoleFromPayload(payload: Partial<TokenPayload> | null | undefined): UserRole | undefined {
	if (!payload) return undefined

	// numeric fields
	const maybeRoleId = (payload.role_id as any) ?? payload.role
	if (typeof maybeRoleId === 'number') {
		switch (maybeRoleId) {
			case 3: return 'ADMIN'
			case 2: return 'DOCTOR'
			case 1: return 'PATIENT'
			default: return undefined
		}
	}

	// if role is string like 'ADMIN' or 'ROLE_ADMIN' or 'Admin'
	if (typeof payload.role === 'string') {
		const raw = payload.role.toUpperCase()
		if (raw.includes('ADMIN')) return 'ADMIN'
		if (raw.includes('DOCTOR')) return 'DOCTOR'
		if (raw.includes('PATIENT')) return 'PATIENT'
	}

	// roles array
	if (Array.isArray(payload.roles)) {
		const rolesUpper = payload.roles.map(r => String(r).toUpperCase())
		if (rolesUpper.includes('ADMIN') || rolesUpper.includes('ROLE_ADMIN')) return 'ADMIN'
		if (rolesUpper.includes('DOCTOR') || rolesUpper.includes('ROLE_DOCTOR')) return 'DOCTOR'
		if (rolesUpper.includes('PATIENT') || rolesUpper.includes('ROLE_PATIENT')) return 'PATIENT'
	}

	return undefined
}

// Initialize from localStorage
try {
	const token = localStorage.getItem(AUTH_TOKEN_KEY)
	if (token) {
		const decoded = jwtDecode<TokenPayload>(token)
		const role = parseRoleFromPayload(decoded)
		if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
			localStorage.removeItem(AUTH_TOKEN_KEY)
		} else if (role) {
			userRef.value = {
				id: decoded.id ?? 0,
				username: decoded.sub ?? '',
				email: decoded.email,
				firstName: decoded.firstName,
				lastName: decoded.lastName,
				role,
				token
			}
			api.defaults.headers.common['Authorization'] = `Bearer ${token}`
		}
	}
} catch (e) {
	console.error('Error initializing auth state:', e)
}

watch(() => userRef.value?.token, (token) => {
	if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
	else delete api.defaults.headers.common['Authorization']
}, { immediate: true })

export function getCurrentUser(): AuthUser | null {
	return userRef.value
}

export function hasRole(role: UserRole): boolean {
	return userRef.value?.role === role
}

export function useAuth() {
	const router = useRouter()

	const isAuthenticated = computed(() => userRef.value !== null)
	const hasRoleLocal = (role: UserRole) => userRef.value?.role === role
	const isAdmin = computed(() => hasRoleLocal('ADMIN'))
	const isDoctor = computed(() => hasRoleLocal('DOCTOR'))
	const isPatient = computed(() => hasRoleLocal('PATIENT'))

	async function handleTokenAndUser(token: string) {
		const decoded = jwtDecode<TokenPayload>(token)
		const role = parseRoleFromPayload(decoded)
		if (!role) throw new Error('Unable to parse role from token')

		userRef.value = {
			id: decoded.id ?? 0,
			username: decoded.sub ?? '',
			email: decoded.email,
			firstName: decoded.firstName,
			lastName: decoded.lastName,
			role,
			token
		}
		localStorage.setItem(AUTH_TOKEN_KEY, token)
		api.defaults.headers.common['Authorization'] = `Bearer ${token}`
	}

	async function login({ username, password }: LoginRequest) {
		try {
			loadingRef.value = true
			errorRef.value = ''
			const res = await api.post<string>('/v1/auth/login', { username, password })
			const token = res.data
			if (!token) throw new Error('Token not found in response')
			await handleTokenAndUser(token)

			// Redirect based on role
			if (hasRoleLocal('ADMIN')) router.push('/admin/dashboard')
			else if (hasRoleLocal('DOCTOR')) router.push('/doctor/dashboard')
			else router.push('/patient/dashboard')
		} catch (e: any) {
			errorRef.value = e?.response?.data?.message || e?.message || 'Failed to login'
			throw e
		} finally {
			loadingRef.value = false
		}
	}

	async function loginAdmin({ username, password }: LoginRequest) {
		try {
			loadingRef.value = true
			errorRef.value = ''
			const res = await api.post<string>('/v1/auth/admin/login', { username, password })
			const token = res.data
			if (!token) throw new Error('Token not found in response')
			await handleTokenAndUser(token)
			if (userRef.value?.role !== 'ADMIN') {
				// not an admin, clear state
				userRef.value = null
				localStorage.removeItem(AUTH_TOKEN_KEY)
				delete api.defaults.headers.common['Authorization']
				throw new Error('Not an admin')
			}
			router.push('/admin/dashboard')
		} catch (e: any) {
			errorRef.value = e?.response?.data?.message || e?.message || 'Failed to login as admin'
			throw e
		} finally {
			loadingRef.value = false
		}
	}

	async function register(request: RegisterRequest) {
		try {
			loadingRef.value = true
			errorRef.value = ''
			await api.post('/v1/auth/register', request)
			return 'Account created successfully'
		} catch (e: any) {
			errorRef.value = e?.response?.data?.message || e?.message || 'Failed to register'
			throw e
		} finally {
			loadingRef.value = false
		}
	}

	async function logout() {
			try {
				loadingRef.value = true
				errorRef.value = ''
				const lastRole = userRef.value?.role
				userRef.value = null
				localStorage.removeItem(AUTH_TOKEN_KEY)
				delete api.defaults.headers.common['Authorization']
				if (lastRole === 'ADMIN') router.push('/admin/login')
				else router.push('/login')
		} catch (e: any) {
			errorRef.value = e?.response?.data?.message || e?.message || 'Failed to logout'
			throw e
		} finally {
			loadingRef.value = false
		}
		try {
			await api.post('/v1/auth/logout')
		} catch (e: any) {
			// Do nothing, it's fineeeee
			// errorRef.value = e?.response?.data?.message || e?.message || 'Failed to logout'
			// throw e
		}


	}

	// Periodic token expiration check
	let expirationTimer: number | undefined
	onMounted(() => {
		expirationTimer = window.setInterval(() => {
			const token = localStorage.getItem(AUTH_TOKEN_KEY)
			if (token) {
				try {
					const decoded = jwtDecode<TokenPayload>(token)
					if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
						userRef.value = null
						localStorage.removeItem(AUTH_TOKEN_KEY)
						delete api.defaults.headers.common['Authorization']
						router.push('/login')
					}
				} catch (err) {
					userRef.value = null
					localStorage.removeItem(AUTH_TOKEN_KEY)
					delete api.defaults.headers.common['Authorization']
					router.push('/login')
				}
			}
		}, 60000)
	})

	onUnmounted(() => {
		if (expirationTimer) clearInterval(expirationTimer)
	})

	return {
		user: computed(() => userRef.value),
		loading: computed(() => loadingRef.value),
		error: computed(() => errorRef.value),
		isAuthenticated,
		isAdmin,
		isDoctor,
		isPatient,
		login,
		loginAdmin,
		register,
		logout,
		hasRole: hasRoleLocal,
		$subscribe: (callback: (user: AuthUser | null) => void) => watch(userRef, callback, { immediate: true })
	}
}