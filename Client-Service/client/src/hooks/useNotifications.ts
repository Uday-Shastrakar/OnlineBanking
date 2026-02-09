import { useState, useEffect, useCallback, useRef } from 'react';
import notificationService, { Notification, NotificationPreference, NotificationType, NotificationPriority, NotificationCategory } from '../services/notificationService';
import webSocketService, { WebSocketCallbacks } from '../services/websocketService';

export interface UseNotificationsOptions {
  email?: string;
  enableWebSocket?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  preferences: NotificationPreference | null;
  actions: {
    fetchNotifications: () => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAsUnread: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    deleteAllNotifications: () => Promise<void>;
    sendNotification: (notification: {
      recipient: string;
      subject: string;
      content: string;
      type?: NotificationType;
      priority?: NotificationPriority;
      category?: NotificationCategory;
    }) => Promise<Notification>;
    refresh: () => void;
    connectWebSocket: () => Promise<void>;
    disconnectWebSocket: () => Promise<void>;
    fetchPreferences: () => Promise<void>;
    updatePreferences: (preferences: NotificationPreference) => Promise<void>;
  };
}

export const useNotifications = (options: UseNotificationsOptions = {}): UseNotificationsReturn => {
  const {
    email: userEmail,
    enableWebSocket = true,
    autoRefresh = false,
    refreshInterval = 30000 // 30 seconds
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const email = userEmail || localStorage.getItem('userEmail') || '';

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!email) return;

    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getNotifications(email);
      setNotifications(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [email]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!email) return;

    try {
      const count = await notificationService.getUnreadNotificationCount(email);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [email]);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!email) return;

    try {
      const prefs = await notificationService.getNotificationPreferences(email);
      setPreferences(prefs);
    } catch (err) {
      console.error('Error fetching preferences:', err);
    }
  }, [email]);

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as read';
      setError(errorMessage);
      console.error('Error marking as read:', err);
    }
  }, []);

  // Mark as unread
  const markAsUnread = useCallback(async (id: string) => {
    try {
      await notificationService.markNotificationAsUnread(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: false, readAt: undefined } : n)
      );
      setUnreadCount(prev => prev + 1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark as unread';
      setError(errorMessage);
      console.error('Error marking as unread:', err);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!email) return;

    try {
      await notificationService.markAllAsRead(email);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all as read';
      setError(errorMessage);
      console.error('Error marking all as read:', err);
    }
  }, [email]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      const deletedNotification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification';
      setError(errorMessage);
      console.error('Error deleting notification:', err);
    }
  }, [notifications]);

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    if (!email) return;

    try {
      await notificationService.deleteAllNotifications(email);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete all notifications';
      setError(errorMessage);
      console.error('Error deleting all notifications:', err);
    }
  }, [email]);

  // Send notification
  const sendNotification = useCallback(async (notification: {
    recipient: string;
    subject: string;
    content: string;
    type?: NotificationType;
    priority?: NotificationPriority;
    category?: NotificationCategory;
  }) => {
    try {
      const newNotification = await notificationService.sendNotification(notification);
      setNotifications(prev => [newNotification, ...prev]);
      if (!newNotification.isRead) {
        setUnreadCount(prev => prev + 1);
      }
      return newNotification;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send notification';
      setError(errorMessage);
      console.error('Error sending notification:', err);
      throw err;
    }
  }, []);

  // Refresh all data
  const refresh = useCallback(() => {
    fetchNotifications();
    fetchUnreadCount();
    fetchPreferences();
  }, [fetchNotifications, fetchUnreadCount, fetchPreferences]);

  // Update preferences
  const updatePreferences = useCallback(async (prefs: NotificationPreference) => {
    try {
      const updatedPrefs = await notificationService.updateNotificationPreferences(prefs);
      setPreferences(updatedPrefs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(errorMessage);
      console.error('Error updating preferences:', err);
    }
  }, []);

  // WebSocket connection
  const connectWebSocket = useCallback(async () => {
    if (!enableWebSocket || !email) return;

    try {
      const callbacks: WebSocketCallbacks = {
        onNotification: (notification) => {
          setNotifications(prev => [notification, ...prev]);
          if (!notification.isRead) {
            setUnreadCount(prev => prev + 1);
          }
        },
        onUnreadCount: (count) => {
          setUnreadCount(count);
        },
        onConnectionStatus: (status) => {
          setIsConnected(status === 'connected');
        },
        onError: (error) => {
          console.error('WebSocket error:', error);
        }
      };

      await webSocketService.connect(callbacks);
      webSocketService.subscribeToUserNotifications(email);
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setIsConnected(false);
    }
  }, [enableWebSocket, email]);

  const disconnectWebSocket = useCallback((): Promise<void> => {
    webSocketService.disconnect();
    setIsConnected(false);
    return Promise.resolve();
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (email) {
      fetchNotifications();
      fetchUnreadCount();
      fetchPreferences();
    }
  }, [email, fetchNotifications, fetchUnreadCount, fetchPreferences]);

  // WebSocket connection
  useEffect(() => {
    if (enableWebSocket && email) {
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [enableWebSocket, email, connectWebSocket, disconnectWebSocket]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        fetchUnreadCount();
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    isConnected,
    preferences,
    actions: {
      fetchNotifications,
      fetchUnreadCount,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      deleteNotification,
      deleteAllNotifications,
      sendNotification,
      refresh,
      connectWebSocket,
      disconnectWebSocket,
      fetchPreferences,
      updatePreferences
    }
  };
};
