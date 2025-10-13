import api from './api'

export interface Payment {
  id: number
  appointmentId: number
  amount: number
  method: 'CASH' | 'CARD' | 'BANK_TRANSFER'
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  transactionId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface UpdatePaymentMethodRequest {
  method: 'CASH' | 'CARD' | 'BANK_TRANSFER'
}

export interface ConfirmCashPaymentRequest {
  amount: number
  notes?: string
}

// Get payments (role-based filtering handled by backend)
export async function getPayments(): Promise<Payment[]> {
  const response = await api.get<Payment[]>('/v1/payments/list')
  return response.data
}

// Get payment by ID
export async function getPaymentById(id: number): Promise<Payment> {
  const response = await api.get<Payment>(`/v1/payments/${id}`)
  return response.data
}

// Update payment method (PATIENT only)
export async function updatePaymentMethod(id: number, data: UpdatePaymentMethodRequest): Promise<Payment> {
  const response = await api.put<Payment>(`/v1/payments/method/${id}`, data)
  return response.data
}

// Confirm cash payment (ADMIN only)
export async function confirmCashPayment(id: number, data: ConfirmCashPaymentRequest): Promise<Payment> {
  const response = await api.put<Payment>(`/v1/payments/confirm-cash/${id}`, data)
  return response.data
}

// Get payments by appointment
export async function getPaymentsByAppointment(appointmentId: number): Promise<Payment[]> {
  const response = await api.get<Payment[]>(`/v1/payments/appointment/${appointmentId}`)
  return response.data
}

// Get payments by status
export async function getPaymentsByStatus(status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'): Promise<Payment[]> {
  const response = await api.get<Payment[]>(`/v1/payments/status/${status}`)
  return response.data
}

// Get payments by date range
export async function getPaymentsByDateRange(startDate: string, endDate: string): Promise<Payment[]> {
  const response = await api.get<Payment[]>(`/v1/payments/range?start=${startDate}&end=${endDate}`)
  return response.data
}

// Get payment statistics
export async function getPaymentStatistics(): Promise<{
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  totalTransactions: number
}> {
  const response = await api.get('/v1/payments/statistics')
  return response.data
}