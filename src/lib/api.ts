import axios from 'axios';
import type { AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res: AxiosResponse) => {
    const data = res.data;
    if (data && typeof data === 'object' && ('success' in data || 'result' in data)) {
      if (data.success === false) {
        return Promise.reject({ response: { data } });
      }
      const newRes: AxiosResponse = { ...res, data: data.result ?? data };
      return Promise.resolve(newRes);
    }
    return res;
  },
  (err: any) => {
    const resp = (err as any).response;
    if (resp && resp.data && resp.data.message) return Promise.reject(err);
    return Promise.reject(err);
  }
);

export default api;



