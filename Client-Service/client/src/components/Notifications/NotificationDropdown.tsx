import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Badge,
  Button,
  Paper,
  ClickAwayListener,
  Divider,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Notifications,
  MarkEmailRead,
  Delete,
  Settings,
  Launch,
  Refresh
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import notificationService, { Notification, NotificationPriority, NotificationCategory } from '../../services/notificationService';

// Configure dayjs plugins
dayjs.extend(relativeTime);

interface NotificationDropdownProps {
  onOpenNotificationCenter?: () => void;
  onOpenPreferences?: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onOpenNotificationCenter,
  onOpenPreferences
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const getUserEmail = () => {
    // Try multiple sources for user email
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) return userEmail;
    
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      try {
        const user = JSON.parse(userDetails);
        return user.email || user.userName || '';
      } catch (e) {
        console.error('Error parsing userDetails:', e);
      }
    }
    
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      try {
        const user = JSON.parse(authUser);
        return user.email || user.userName || '';
      } catch (e) {
        console.error('Error parsing authUser:', e);
      }
    }
    
    return '';
  };
  
  const userEmail = getUserEmail();

  useEffect(() => {
    fetchUnreadCount();
    // Fetch unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchRecentNotifications();
    }
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadNotificationCount(userEmail);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      setLoading(true);
      const allNotifications = await notificationService.getNotifications(userEmail);
      const recentNotifications = allNotifications
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5); // Show only 5 most recent
      setNotifications(recentNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }
    setIsOpen(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userEmail);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'URGENT':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'default';
      default:
        return 'default';
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'TRANSACTION':
        return '💳';
      case 'SECURITY':
        return '🔒';
      case 'MARKETING':
        return '📢';
      case 'ACCOUNT':
        return '👤';
      default:
        return '📢';
    }
  };

  return (
    <>
      {/* Notification Button */}
      <IconButton
        ref={anchorRef}
        onClick={handleToggle}
        sx={{ p: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <Notifications />
        </Badge>
      </IconButton>

      {/* Dropdown */}
      {isOpen && (
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            sx={{
              position: 'absolute',
              top: '100%',
              right: 0,
              mt: 1,
              width: 380,
              maxHeight: 480,
              overflow: 'hidden',
              zIndex: 1000,
              boxShadow: 3,
              borderRadius: 2
            }}
          >
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">
                  Notifications
                </Typography>
                <Box display="flex" gap={1}>
                  <IconButton size="small" onClick={fetchRecentNotifications} title="Refresh">
                    <Refresh fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={onOpenPreferences} title="Settings">
                    <Settings fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {/* Content */}
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : notifications.length === 0 ? (
              <Box textAlign="center" p={3}>
                <Notifications sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No notifications
                </Typography>
              </Box>
            ) : (
              <>
                {/* Quick Actions */}
                {unreadCount > 0 && (
                  <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                    <Button
                      size="small"
                      startIcon={<MarkEmailRead />}
                      onClick={handleMarkAllAsRead}
                      fullWidth
                    >
                      Mark All as Read ({unreadCount})
                    </Button>
                  </Box>
                )}

                {/* Notifications List */}
                <List sx={{ p: 0, maxHeight: 300, overflow: 'auto' }}>
                  {notifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <ListItem
                        sx={{
                          px: 2,
                          py: 1.5,
                          bgcolor: notification.isRead ? 'transparent' : 'grey.50',
                          '&:hover': { bgcolor: 'action.hover' },
                          cursor: 'pointer'
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Box
                            sx={{
                              fontSize: 20,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: 'grey.100'
                            }}
                          >
                            {getCategoryIcon(notification.category)}
                          </Box>
                        </ListItemIcon>

                        <ListItemText
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: notification.isRead ? 'normal' : 'bold',
                            noWrap: true,
                            component: 'span'
                          }}
                          secondaryTypographyProps={{
                            variant: 'body2',
                            color: 'text.secondary',
                            component: 'span'
                          }}
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <span style={{ flexGrow: 1, minWidth: 0 }}>
                                {notification.subject}
                              </span>
                              <Chip
                                label={notification.priority}
                                size="small"
                                color={getPriorityColor(notification.priority)}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <span
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  marginBottom: '4px'
                                }}
                              >
                                {notification.content}
                              </span>
                              <Typography variant="caption" color="text.secondary">
                                {dayjs(notification.createdAt).fromNow()}
                              </Typography>
                            </Box>
                          }
                        />

                        <Box display="flex" flexDirection="column" gap={0.5}>
                          {!notification.isRead && (
                            <IconButton
                              size="small"
                              onClick={() => handleMarkAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <MarkEmailRead fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(notification.id)}
                            title="Delete"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItem>
                      {index < notifications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>

                {/* Footer */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Launch />}
                    onClick={onOpenNotificationCenter}
                    fullWidth
                  >
                    View All Notifications
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </ClickAwayListener>
      )}
    </>
  );
};

export default NotificationDropdown;
