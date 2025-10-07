import api from './api';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  patientAge: number;
  doctorId: number;
  doctorName: string;
  appointmentDate: string;
  status: AppointmentStatus;
  note?: string;
  createdBy: number;
  createdDate: string;
  modifiedBy?: number;
  modifiedDate?: string;
}

export interface AppointmentCreateRequest {
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  note?: string;
}

export interface AppointmentUpdateRequest {
  appointmentDate?: string;
  note?: string;
  status?: AppointmentStatus;
}

export interface AppointmentListResponse {
  content: Appointment[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AppointmentSearchCriteria {
  patientId?: number;
  doctorId?: number;
  status?: AppointmentStatus;
  fromDate?: string;
  toDate?: string;
}

// Create, Update, and Delete Operations
export async function createAppointment(
  request: AppointmentCreateRequest,
  isSaveDraft = false
): Promise<Appointment> {
  const res = await api.post(`/v1/appointments/create?isSaveDraft=${isSaveDraft}`, request);
  return res.data;
}

export async function updateAppointment(
  appointmentId: number,
  request: AppointmentUpdateRequest
): Promise<Appointment> {
  const res = await api.put(`/v1/appointments/update/${appointmentId}`, request);
  return res.data;
}

// Status Update Operations
export async function cancelAppointment(appointmentId: number): Promise<Appointment> {
  const res = await api.put(`/v1/appointments/cancel/${appointmentId}`);
  return res.data;
}

export async function confirmAppointment(appointmentId: number): Promise<Appointment> {
  const res = await api.put(`/v1/appointments/confirm/${appointmentId}`);
  return res.data;
}

export async function completeAppointment(appointmentId: number): Promise<Appointment> {
  const res = await api.put(`/v1/appointments/complete/${appointmentId}`);
  return res.data;
}

// List and Search Operations
export async function listAppointments(
  page = 0,
  size = 10
): Promise<AppointmentListResponse> {
  const res = await api.get('/v1/appointments/list', { params: { page, size } });
  return res.data;
}

export async function searchAppointments(
  criteria: AppointmentSearchCriteria = {},
  page = 0,
  size = 10
): Promise<AppointmentListResponse> {
  const res = await api.get('/v1/appointments/searchList', {
    params: {
      ...criteria,
      page,
      size
    }
  });
  return res.data;
}

// Get Specific Appointment(s)
export async function getAppointmentById(id: number): Promise<Appointment> {
  const res = await api.get(`/v1/appointments/${id}`);
  return res.data;
}

export async function getPatientAppointments(patientId: number): Promise<Appointment[]> {
  const res = await api.get(`/v1/appointments/patient/${patientId}`);
  return res.data;
}

export async function getDoctorAppointments(doctorId: number): Promise<Appointment[]> {
  const res = await api.get(`/v1/appointments/doctor/${doctorId}`);
  return res.data;
}

// Today's Appointments
export async function getDoctorTodayAppointments(doctorId: number): Promise<Appointment[]> {
  const res = await api.get(`/v1/appointments/doctor/${doctorId}/today`);
  return res.data;
}

// Available Time Slots
export async function getDoctorAvailableSlots(doctorId: number, date: string): Promise<string[]> {
  const res = await api.get(`/v1/appointments/doctor/${doctorId}/available-slots`, {
    params: { date }
  });
  return res.data;
}