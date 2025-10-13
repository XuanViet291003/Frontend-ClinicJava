import api from './api'

export interface Appointment {
  id: number
  patientId: number
  doctorId: number
  appointmentDate: string
  reason: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  patientName?: string
  doctorName?: string
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentRequest {
  doctorId: number
  appointmentDate: string
  reason: string
}

export interface UpdateAppointmentRequest {
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  reason?: string
  appointmentDate?: string
}

// Get all appointments (role-based filtering handled by backend)
export async function getAppointments(): Promise<Appointment[]> {
  const response = await api.get<Appointment[]>('/v1/appointments/list')
  return response.data
}

// Create new appointment (PATIENT only)
export async function createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
  const response = await api.post<Appointment>('/v1/appointments/create', data)
  return response.data
}

// Update appointment status
export async function updateAppointment(id: number, data: UpdateAppointmentRequest): Promise<Appointment> {
  const response = await api.put<Appointment>(`/v1/appointments/update/${id}`, data)
  return response.data
}

// Confirm appointment (ADMIN only)
export async function confirmAppointment(id: number): Promise<Appointment> {
  const response = await api.put<Appointment>(`/v1/appointments/confirm/${id}`)
  return response.data
}

// Complete appointment (DOCTOR only)
export async function completeAppointment(id: number): Promise<Appointment> {
  const response = await api.put<Appointment>(`/v1/appointments/complete/${id}`)
  return response.data
}

// Cancel appointment (PATIENT only)
export async function cancelAppointment(id: number): Promise<Appointment> {
  const response = await api.put<Appointment>(`/v1/appointments/cancel/${id}`)
  return response.data
}

// Get appointments by date range
export async function getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
  const response = await api.get<Appointment[]>(`/v1/appointments/range?start=${startDate}&end=${endDate}`)
  return response.data
}

// Get today's appointments (DOCTOR only)
export async function getTodayAppointments(): Promise<Appointment[]> {
  const today = new Date().toISOString().split('T')[0]
  return getAppointmentsByDateRange(today, today)
}

// Get appointments by doctor (DOCTOR only)
export async function getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
  const response = await api.get<Appointment[]>(`/v1/appointments/doctor/${doctorId}`)
  return response.data
}

// Get appointments by patient (PATIENT only)
export async function getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
  const response = await api.get<Appointment[]>(`/v1/appointments/patient/${patientId}`)
  return response.data
}

export function listAppointments(arg0: number, arg1: number) {
  throw new Error('Function not implemented.')
}
