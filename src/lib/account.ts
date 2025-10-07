import api from './api';

export interface AccountCreateRequest {
  username: string;
  password: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
}

export interface AccountUpdateRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  isActive?: boolean;
}

export interface Account {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  isActive: boolean;
  createdBy?: number;
  createdDate: string;
  modifiedBy?: number;
  modifiedDate: string;
}

export interface AccountListResponse {
  content: Account[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// List accounts (paginated)
export async function listAccounts(page = 0, size = 10): Promise<AccountListResponse> {
  const res = await api.get('/v1/account/list', { params: { page, size } });
  return res.data;
}

// Create an account (admin side)
export async function createAccount(req: AccountCreateRequest): Promise<Account> {
  const res = await api.post('/v1/account/create', req);
  return res.data;
}

// Update account by id
export async function updateAccount(id: number, payload: AccountUpdateRequest): Promise<Account> {
  const res = await api.put(`/v1/account/update/${id}`, payload);
  return res.data;
}

// Delete account by id
export async function deleteAccount(id: number): Promise<void> {
  await api.delete(`/v1/account/delete/${id}`);
}

// Get account by id
export async function getAccountById(id: number): Promise<Account> {
  const res = await api.get(`/v1/account/find/${id}`);
  return res.data;
}

// Toggle account active status
export async function toggleAccountStatus(id: number): Promise<Account> {
  const account = await getAccountById(id);
  return updateAccount(id, { isActive: !account.isActive });
}
