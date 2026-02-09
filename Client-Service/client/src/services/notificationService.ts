import api, { ApiResponse } from "./api";

// Notification Service API - Updated to match new backend
export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum NotificationCategory {
  TRANSACTION = 'TRANSACTION',
  SECURITY = 'SECURITY',
  MARKETING = 'MARKETING',
  SYSTEM = 'SYSTEM',
  ACCOUNT = 'ACCOUNT'
}

export enum NotificationStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED'
}

export interface Notification {
  id: string;
  recipient: string;
  subject: string;
  content: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  status: NotificationStatus;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreference {
  id?: string;
  email: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  transactionAlerts: boolean;
  securityAlerts: boolean;
  marketingAlerts: boolean;
  systemAlerts: boolean;
  accountAlerts: boolean;
  frequency: 'INSTANT' | 'DAILY' | 'WEEKLY';
  createdAt?: string;
  updatedAt?: string;
}

// Get Notifications for User
export const getNotifications = async (email: string): Promise<Notification[]> => {
  const response = await api.get<Notification[]>(`/notifications?email=${encodeURIComponent(email)}`);
  return response.data;
};

// Get Unread Notifications
export const getUnreadNotifications = async (email: string): Promise<Notification[]> => {
  const response = await api.get<Notification[]>(`/notifications/unread?email=${encodeURIComponent(email)}`);
  return response.data;
};

// Get Notifications by Category
export const getNotificationsByCategory = async (email: string, category: NotificationCategory): Promise<Notification[]> => {
  const response = await api.get<Notification[]>(`/notifications/category/${category}?email=${encodeURIComponent(email)}`);
  return response.data;
};

// Get Notifications by Priority
export const getNotificationsByPriority = async (email: string, priority: NotificationPriority): Promise<Notification[]> => {
  const response = await api.get<Notification[]>(`/notifications/priority/${priority}?email=${encodeURIComponent(email)}`);
  return response.data;
};

// Get Unread Notification Count
export const getUnreadNotificationCount = async (email: string): Promise<number> => {
  const response = await api.get<number>(`/notifications/unread/count?email=${encodeURIComponent(email)}`);
  return response.data;
};

// Mark Notification as Read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await api.put(`/notifications/${notificationId}/read`);
};

// Mark Notification as Unread
export const markNotificationAsUnread = async (notificationId: string): Promise<void> => {
  await api.put(`/notifications/${notificationId}/unread`);
};

// Mark All Notifications as Read
export const markAllAsRead = async (email: string): Promise<void> => {
  await api.put('/notifications/read-all', { email });
};

// Delete Notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  await api.delete(`/notifications/${notificationId}`);
};

// Delete All Notifications
export const deleteAllNotifications = async (email: string): Promise<void> => {
  await api.delete('/notifications/all', { data: { email } });
};

// Send Notification (Admin only)
export const sendNotification = async (notification: {
  recipient: string;
  subject: string;
  content: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  category?: NotificationCategory;
}): Promise<Notification> => {
  const response = await api.post<Notification>('/notifications/send', notification);
  return response.data;
};

// Send Bulk Notifications (Admin only)
export const sendBulkNotifications = async (notifications: {
  recipients: string[];
  subject: string;
  content: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  category?: NotificationCategory;
}): Promise<Notification[]> => {
  const response = await api.post<Notification[]>('/notifications/send/bulk', notifications);
  return response.data;
};

// Get Notification Preferences
export const getNotificationPreferences = async (email: string): Promise<NotificationPreference> => {
  const response = await api.get<NotificationPreference>(`/notifications/preferences?email=${encodeURIComponent(email)}`);
  return response.data;
};

// Update Notification Preferences
export const updateNotificationPreferences = async (preferences: NotificationPreference): Promise<NotificationPreference> => {
  const response = await api.put<NotificationPreference>('/notifications/preferences', preferences);
  return response.data;
};

// Delete Notification Preferences
export const deleteNotificationPreferences = async (email: string): Promise<void> => {
  await api.delete(`/notifications/preferences?email=${encodeURIComponent(email)}`);
};

// Default export for convenience
const notificationServiceDefault = {
  getNotifications,
  getUnreadNotifications,
  getNotificationsByCategory,
  getNotificationsByPriority,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  sendNotification,
  sendBulkNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
  deleteNotificationPreferences,
  NotificationType,
  NotificationPriority,
  NotificationCategory,
  NotificationStatus
};

export default notificationServiceDefault;
