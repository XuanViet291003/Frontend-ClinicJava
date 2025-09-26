import api from './api';

export async function loginApi(username: string, password: string): Promise<string> {
  const res = await api.post('/v1/auth/login', { username, password });
  const token = res.data?.result as string;
  if (!token) throw new Error('Token không tồn tại trong phản hồi');
  return token;
}

export async function registerApi(username: string, password: string, fullName: string): Promise<string> {
  const res = await api.post('/v1/auth/register', { username, password, fullName });
  return res.data?.message || 'Tạo tài khoản thành công';
}


