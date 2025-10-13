import api from './api'

export interface Notification {
  id: number
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'
  isRead: boolean
  userId?: number
  createdAt: string
  updatedAt: string
}

export interface BroadcastNotificationRequest {
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'
}

// Get my notifications
export async function getNotifications(): Promise<Notification[]> {
  const response = await api.get<Notification[]>('/v1/notifications/my')
  return response.data
}

// Mark notification as read
export async function markNotificationAsRead(id: number): Promise<void> {
  await api.put(`/v1/notifications/read/${id}`)
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<void> {
  await api.put('/v1/notifications/read-all')
}

// Send broadcast notification (ADMIN only)
export async function sendBroadcastNotification(data: BroadcastNotificationRequest): Promise<void> {
  await api.post('/v1/notifications/broadcast', data)
}

// Get unread notification count
export async function getUnreadNotificationCount(): Promise<number> {
  const notifications = await getNotifications()
  return notifications.filter(n => !n.isRead).length
}

// Delete notification
export async function deleteNotification(id: number): Promise<void> {
  await api.delete(`/v1/notifications/${id}`)
}

// Get notifications by type
export async function getNotificationsByType(type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'): Promise<Notification[]> {
  const notifications = await getNotifications()
  return notifications.filter(n => n.type === type)
}

// Get recent notifications (last 7 days)
export async function getRecentNotifications(): Promise<Notification[]> {
  const notifications = await getNotifications()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  return notifications.filter(n => new Date(n.createdAt) > sevenDaysAgo)
}