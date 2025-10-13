import api from './api'

export interface MedicalRecord {
  id: number
  patientId: number
  doctorId: number
  appointmentId?: number
  symptoms: string
  diagnosis: string
  treatment: string
  notes?: string
  patientName?: string
  doctorName?: string
  createdAt: string
  updatedAt: string
}

export interface CreateMedicalRecordRequest {
  patientId: number
  appointmentId?: number
  symptoms: string
  diagnosis: string
  treatment: string
  notes?: string
}

export interface UpdateMedicalRecordRequest {
  symptoms?: string
  diagnosis?: string
  treatment?: string
  notes?: string
}

// Get medical records (role-based filtering handled by backend)
export async function getMedicalRecords(): Promise<MedicalRecord[]> {
  const response = await api.get<MedicalRecord[]>('/v1/medical-records/list')
  return response.data
}

// Create new medical record (DOCTOR only)
export async function createMedicalRecord(data: CreateMedicalRecordRequest): Promise<MedicalRecord> {
  const response = await api.post<MedicalRecord>('/v1/medical-records/create', data)
  return response.data
}

// Update medical record (DOCTOR only)
export async function updateMedicalRecord(id: number, data: UpdateMedicalRecordRequest): Promise<MedicalRecord> {
  const response = await api.put<MedicalRecord>(`/v1/medical-records/update/${id}`, data)
  return response.data
}

// Get medical records by patient (DOCTOR/ADMIN only)
export async function getMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]> {
  const response = await api.get<MedicalRecord[]>(`/v1/medical-records/patient/${patientId}`)
  return response.data
}

// Get medical records for current patient (PATIENT only)
export async function getMyMedicalRecords(): Promise<MedicalRecord[]> {
  const response = await api.get<MedicalRecord[]>('/v1/medical-records/patient-admin/my')
  return response.data
}

// Search medical records (ADMIN only)
export async function searchMedicalRecords(query: string): Promise<MedicalRecord[]> {
  const response = await api.get<MedicalRecord[]>(`/v1/medical-records/searchList?q=${encodeURIComponent(query)}`)
  return response.data
}

// Get medical record by ID
export async function getMedicalRecordById(id: number): Promise<MedicalRecord> {
  const response = await api.get<MedicalRecord>(`/v1/medical-records/${id}`)
  return response.data
}

// Get medical records by doctor (DOCTOR only)
export async function getMedicalRecordsByDoctor(doctorId: number): Promise<MedicalRecord[]> {
  const response = await api.get<MedicalRecord[]>(`/v1/medical-records/doctor/${doctorId}`)
  return response.data
}

// Get medical records by date range
export async function getMedicalRecordsByDateRange(startDate: string, endDate: string): Promise<MedicalRecord[]> {
  const response = await api.get<MedicalRecord[]>(`/v1/medical-records/range?start=${startDate}&end=${endDate}`)
  return response.data
}