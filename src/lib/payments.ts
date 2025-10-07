import api from './api';

export async function choosePaymentMethod(paymentId: number, method: string) {
  const res = await api.put(`/v1/payments/method/${paymentId}`, { method });
  return (res as any).data;
}

export async function confirmCash(paymentId: number) {
  const res = await api.put(`/v1/payments/confirm-cash/${paymentId}`);
  return (res as any).data;
}

export async function paymentCallback(payload: any) {
  const res = await api.post('/v1/payments/callback', payload);
  return (res as any).data;
}


