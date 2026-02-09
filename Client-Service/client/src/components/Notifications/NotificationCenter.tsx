import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Badge,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Checkbox
} from '@mui/material';
import {
  Notifications,
  MarkEmailRead,
  MarkEmailUnread,
  Delete,
  Search,
  FilterList,
  Settings,
  Refresh,
  Info,
  Campaign,
  AccountBalance,
  Security
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import notificationService, { 
  Notification, 
  NotificationPriority, 
  NotificationCategory
} from '../../services/notificationService';

// Configure dayjs plugins
dayjs.extend(relativeTime);

interface NotificationCenterProps {
  onPreferencesClick?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onPreferencesClick }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategory | 'all'>('all');
  const [priorityFilter] = useState<NotificationPriority | 'all'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

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
  const itemsPerPage = 20;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      // Apply filters
      if (filterType === 'unread') {
        response = await notificationService.getUnreadNotifications(userEmail);
      } else if (categoryFilter !== 'all') {
        response = await notificationService.getNotificationsByCategory(userEmail, categoryFilter);
      } else if (priorityFilter !== 'all') {
        response = await notificationService.getNotificationsByPriority(userEmail, priorityFilter);
      } else {
        response = await notificationService.getNotifications(userEmail);
      }

      let filteredNotifications = response || [];

      // Apply search filter
      if (searchTerm) {
        filteredNotifications = filteredNotifications.filter(notification =>
          notification.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply pagination
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

      setNotifications(paginatedNotifications);
      setTotalPages(Math.ceil(filteredNotifications.length / itemsPerPage));
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [filterType, categoryFilter, priorityFilter, page, searchTerm, userEmail]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
      showSnackbar('Notification marked as read', 'success');
    } catch (err) {
      showSnackbar('Failed to mark as read', 'error');
    }
  };

  const handleMarkAsUnread = async (notificationId: string) => {
    try {
      await notificationService.markNotificationAsUnread(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: false, readAt: undefined } : n)
      );
      showSnackbar('Notification marked as unread', 'success');
    } catch (err) {
      showSnackbar('Failed to mark as unread', 'error');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      showSnackbar('Notification deleted', 'success');
    } catch (err) {
      showSnackbar('Failed to delete notification', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userEmail);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      showSnackbar('All notifications marked as read', 'success');
    } catch (err) {
      showSnackbar('Failed to mark all as read', 'error');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await notificationService.deleteAllNotifications(userEmail);
      setNotifications([]);
      showSnackbar('All notifications deleted', 'success');
    } catch (err) {
      showSnackbar('Failed to delete all notifications', 'error');
    }
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const handleBulkAction = async (action: 'read' | 'unread' | 'delete') => {
    try {
      const promises = selectedNotifications.map(id => {
        switch (action) {
          case 'read':
            return notificationService.markNotificationAsRead(id);
          case 'unread':
            return notificationService.markNotificationAsUnread(id);
          case 'delete':
            return notificationService.deleteNotification(id);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);

      if (action === 'delete') {
        setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
      } else {
        setNotifications(prev => 
          prev.map(n => 
            selectedNotifications.includes(n.id) 
              ? { ...n, isRead: action === 'read', readAt: action === 'read' ? new Date().toISOString() : undefined }
              : n
          )
        );
      }

      setSelectedNotifications([]);
      showSnackbar(`Bulk ${action} completed`, 'success');
    } catch (err) {
      showSnackbar(`Failed to complete bulk ${action}`, 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'TRANSACTION':
        return <AccountBalance />;
      case 'SECURITY':
        return <Security />;
      case 'MARKETING':
        return <Campaign />;
      case 'ACCOUNT':
        return <Info />;
      default:
        return <Notifications />;
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

  const getCategoryColor = (category: NotificationCategory) => {
    switch (category) {
      case 'TRANSACTION':
        return 'primary';
      case 'SECURITY':
        return 'error';
      case 'MARKETING':
        return 'secondary';
      case 'ACCOUNT':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Notifications
        </Typography>
        <Box display="flex" gap={1}>
          <IconButton onClick={fetchNotifications} title="Refresh">
            <Refresh />
          </IconButton>
          <IconButton onClick={onPreferencesClick} title="Settings">
            <Settings />
          </IconButton>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          placeholder="Search notifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
        
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          Filters
        </Button>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => { setFilterType('all'); setAnchorEl(null); }}>
          All Notifications
        </MenuItem>
        <MenuItem onClick={() => { setFilterType('unread'); setAnchorEl(null); }}>
          Unread Only
        </MenuItem>
        <MenuItem onClick={() => { setFilterType('read'); setAnchorEl(null); }}>
          Read Only
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setCategoryFilter('all'); setAnchorEl(null); }}>
          All Categories
        </MenuItem>
        <MenuItem onClick={() => { setCategoryFilter(NotificationCategory.TRANSACTION); setAnchorEl(null); }}>
          Transactions
        </MenuItem>
        <MenuItem onClick={() => { setCategoryFilter(NotificationCategory.SECURITY); setAnchorEl(null); }}>
          Security
        </MenuItem>
        <MenuItem onClick={() => { setCategoryFilter(NotificationCategory.MARKETING); setAnchorEl(null); }}>
          Marketing
        </MenuItem>
        <MenuItem onClick={() => { setCategoryFilter(NotificationCategory.ACCOUNT); setAnchorEl(null); }}>
          Account
        </MenuItem>
      </Menu>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <Box display="flex" gap={1} mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {selectedNotifications.length} selected
          </Typography>
          <Button size="small" onClick={() => handleBulkAction('read')}>
            Mark as Read
          </Button>
          <Button size="small" onClick={() => handleBulkAction('unread')}>
            Mark as Unread
          </Button>
          <Button size="small" color="error" onClick={() => handleBulkAction('delete')}>
            Delete
          </Button>
        </Box>
      )}

      {/* Quick Actions */}
      <Box display="flex" gap={1} mb={2}>
        <Button size="small" onClick={handleMarkAllAsRead}>
          Mark All as Read
        </Button>
        <Button size="small" color="error" onClick={handleDeleteAll}>
          Delete All
        </Button>
        <Button size="small" onClick={handleSelectAll}>
          {selectedNotifications.length === notifications.length ? 'Deselect All' : 'Select All'}
        </Button>
      </Box>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Notifications sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No notifications found
          </Typography>
        </Box>
      ) : (
        <List>
          {notifications.map((notification) => (
            <ListItem
              key={notification.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                bgcolor: notification.isRead ? 'transparent' : 'grey.50',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ListItemIcon>
                <Checkbox
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={() => handleSelectNotification(notification.id)}
                />
              </ListItemIcon>
              
              <ListItemIcon>
                <Badge color={getPriorityColor(notification.priority)} variant="dot">
                  {getCategoryIcon(notification.category)}
                </Badge>
              </ListItemIcon>

              <ListItemText
                primaryTypographyProps={{
                  variant: 'subtitle2',
                  fontWeight: notification.isRead ? 'normal' : 'bold',
                  component: 'span'
                }}
                secondaryTypographyProps={{
                  variant: 'body2',
                  color: 'text.secondary',
                  component: 'span'
                }}
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>{notification.subject}</span>
                    <Chip
                      label={notification.category}
                      size="small"
                      color={getCategoryColor(notification.category)}
                    />
                    <Chip
                      label={notification.priority}
                      size="small"
                      color={getPriorityColor(notification.priority)}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <span>{notification.content}</span>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(notification.createdAt).fromNow()}
                    </Typography>
                  </Box>
                }
              />

              <Box display="flex" flexDirection="column" gap={1}>
                {notification.isRead ? (
                  <IconButton
                    size="small"
                    onClick={() => handleMarkAsUnread(notification.id)}
                    title="Mark as unread"
                  >
                    <MarkEmailUnread />
                  </IconButton>
                ) : (
                  <IconButton
                    size="small"
                    onClick={() => handleMarkAsRead(notification.id)}
                    title="Mark as read"
                  >
                    <MarkEmailRead />
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(notification.id)}
                  title="Delete"
                >
                  <Delete />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationCenter;
