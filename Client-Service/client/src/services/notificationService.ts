import api, { ApiResponse } from "./api";

// Notification Service API
export interface Notification {
  id: number;
  userId: string;
  email: string;
  message: string;
  type: string;
  status: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationPreference {
  email: string;
  sms: boolean;
  push: boolean;
  transactionAlerts: boolean;
  accountAlerts: boolean;
  securityAlerts: boolean;
}

// Get Notifications for User
export const getNotifications = async (email: string): Promise<Notification[]> => {
  const response = await api.get<Notification[]>(`/notifications?email=${encodeURIComponent(email)}`);
  return response.data;
};

// Mark Notification as Read
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  await api.put(`/notifications/${notificationId}/read`);
};

// Delete Notification
export const deleteNotification = async (notificationId: number): Promise<void> => {
  await api.delete(`/notifications/${notificationId}`);
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

// Send Notification (Admin only)
export const sendNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<Notification> => {
  const response = await api.post<Notification>('/notifications/send', notification);
  return response.data;
};

// Get Unread Notification Count
export const getUnreadNotificationCount = async (email: string): Promise<number> => {
  const response = await api.get<number>(`/notifications/unread-count?email=${encodeURIComponent(email)}`);
  return response.data;
};
