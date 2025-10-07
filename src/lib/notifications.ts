import api from './api';

export type NotificationType = 'APPOINTMENT' | 'MEDICAL_RECORD' | 'SYSTEM';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdDate: string;
  readDate?: string;
}

export interface NotificationListResponse {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Get notifications for current user
export async function getMyNotifications(
  page = 0,
  size = 20
): Promise<NotificationListResponse> {
  const res = await api.get('/v1/notification/my', {
    params: { page, size }
  });
  return res.data;
}

// Get unread notifications count
export async function getUnreadCount(): Promise<number> {
  const res = await api.get('/v1/notification/unread-count');
  return res.data;
}

// Mark a notification as read
export async function markAsRead(id: number): Promise<void> {
  await api.put(`/v1/notification/read/${id}`);
}

// Mark all notifications as read
export async function markAllAsRead(): Promise<void> {
  await api.put('/v1/notification/read-all');
}

// Delete a notification
export async function deleteNotification(id: number): Promise<void> {
  await api.delete(`/v1/notification/${id}`);
}

// Delete all read notifications
export async function deleteAllRead(): Promise<void> {
  await api.delete('/v1/notification/read');
}

// Subscribe to server-sent events for real-time notifications
export function subscribeToNotifications(onNotification: (notification: Notification) => void) {
  const eventSource = new EventSource('/v1/notification/subscribe');
  
  eventSource.onmessage = (event) => {
    const notification = JSON.parse(event.data) as Notification;
    onNotification(notification);
  };

  return {
    unsubscribe: () => eventSource.close()
  };
}
