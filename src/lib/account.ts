import api from './api'

export interface Account {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAccountRequest {
  username: string
  email: string
  firstName: string
  lastName: string
  password: string
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT'
}

export interface UpdateAccountRequest {
  email?: string
  firstName?: string
  lastName?: string
  password?: string
  role?: 'ADMIN' | 'DOCTOR' | 'PATIENT'
  isActive?: boolean
}

// Get all accounts (ADMIN only)
export async function getAccounts(): Promise<Account[]> {
  const response = await api.get<Account[]>('/v1/account/list')
  return response.data
}

// Get account by ID (ADMIN only)
export async function getAccountById(id: number): Promise<Account> {
  const response = await api.get<Account>(`/v1/account/findById/${id}`)
  return response.data
}

// Create new account (ADMIN only)
export async function createAccount(data: CreateAccountRequest): Promise<Account> {
  const response = await api.post<Account>('/v1/account/create', data)
  return response.data
}

// Update account (ADMIN only)
export async function updateAccount(id: number, data: UpdateAccountRequest): Promise<Account> {
  const response = await api.put<Account>(`/v1/account/update/${id}`, data)
  return response.data
}

// Delete account (ADMIN only)
export async function deleteAccount(id: number): Promise<void> {
  await api.delete(`/v1/account/delete/${id}`)
}

// Get patients (DOCTOR/ADMIN only)
export async function getPatients(): Promise<Account[]> {
  const response = await api.get<Account[]>('/v1/patients/list')
  return response.data
}

// Get doctors (ADMIN only)
export async function getDoctors(): Promise<Account[]> {
  const response = await api.get<Account[]>('/v1/doctors/list')
  return response.data
}

// Search accounts (ADMIN only)
export async function searchAccounts(query: string): Promise<Account[]> {
  const response = await api.get<Account[]>(`/v1/account/search?q=${encodeURIComponent(query)}`)
  return response.data
}

// Get accounts by role (ADMIN only)
export async function getAccountsByRole(role: 'ADMIN' | 'DOCTOR' | 'PATIENT'): Promise<Account[]> {
  const response = await api.get<Account[]>(`/v1/account/role/${role}`)
  return response.data
}