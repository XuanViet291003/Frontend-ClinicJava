import api from './api';

export interface MedicalRecord {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  appointmentId?: number;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  recordDate: string;
  isActive: boolean;
  createdBy: number;
  createdDate: string;
  modifiedBy?: number;
  modifiedDate?: string;
}

export interface MedicalRecordCreateRequest {
  patientId: number;
  appointmentId?: number;
  symptoms: string;
  diagnosis: string;
  treatment: string;
}

export interface MedicalRecordUpdateRequest {
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  isActive?: boolean;
}

export interface MedicalRecordListResponse {
  content: MedicalRecord[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface MedicalRecordSearchCriteria {
  patientId?: number;
  doctorId?: number;
  fromDate?: string;
  toDate?: string;
  isActive?: boolean;
}

export async function getMedicalRecordById(id: number): Promise<MedicalRecord> {
  const res = await api.get(`/v1/medical-records/${id}`);
  return res.data;
}

export async function getMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]> {
  const res = await api.get(`/v1/medical-records/patient/${patientId}`);
  return res.data;
}

export async function createMedicalRecord(data: MedicalRecordCreateRequest): Promise<MedicalRecord> {
  const res = await api.post('/v1/medical-records/create', data);
  return res.data;
}

export async function updateMedicalRecord(id: number, data: MedicalRecordUpdateRequest): Promise<MedicalRecord> {
  const res = await api.put(`/v1/medical-records/update/${id}`, data);
  return res.data;
}

export async function searchMedicalRecords(
  criteria: MedicalRecordSearchCriteria = {},
  page = 0,
  size = 20
): Promise<MedicalRecordListResponse> {
  const res = await api.get('/v1/medical-records/searchList', {
    params: {
      ...criteria,
      page,
      size
    }
  });
  return res.data;
}

export async function getDoctorMedicalRecords(doctorId: number): Promise<MedicalRecord[]> {
  const res = await api.get(`/v1/medical-records/doctor/${doctorId}`);
  return res.data;
}

export async function deactivateMedicalRecord(id: number): Promise<void> {
  await api.put(`/v1/medical-records/${id}/deactivate`);
}

