import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  MoreVert,
  MarkEmailRead,
  MarkEmailUnread,
  Delete,
  OpenInNew,
  Share
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Notification, NotificationPriority, NotificationCategory } from '../../services/notificationService';

// Configure dayjs plugins
dayjs.extend(relativeTime);

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onMarkAsUnread?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  onClick
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    action();
    handleMenuClose();
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
    <Box
      className="transition-all duration-200 ease-in-out hover:shadow-md"
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        mb: 1,
        bgcolor: notification.isRead ? 'transparent' : 'grey.50',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
          boxShadow: 1
        }
      }}
      onClick={() => onClick?.(notification)}
    >
      <Box className="flex items-start gap-2">
        {/* Category Icon */}
        <Box
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-lg"
          sx={{
            fontSize: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: 'grey.100'
          }}
        >
          {getCategoryIcon(notification.category)}
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }} className="flex-1 min-w-0">
          {/* Header */}
          <Box className="flex items-center gap-1 mb-0.5">
            <Typography
              variant="subtitle2"
              fontWeight={notification.isRead ? 'normal' : 'bold'}
              className="flex-1 min-w-0 truncate"
              sx={{ flexGrow: 1, minWidth: 0 }}
              noWrap
            >
              {notification.subject}
            </Typography>
            
            {/* Priority and Category Chips */}
            <Chip
              label={notification.priority}
              size="small"
              color={getPriorityColor(notification.priority)}
              variant="outlined"
              className="ml-1"
            />
            <Chip
              label={notification.category}
              size="small"
              color={getCategoryColor(notification.category)}
              variant="filled"
              className="ml-1"
            />
          </Box>

          {/* Message */}
          <Typography
            variant="body2"
            color="text.secondary"
            className="mb-1 line-clamp-2"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1
            }}
          >
            {notification.content}
          </Typography>

          {/* Footer */}
          <Box className="flex items-center justify-between">
            <Typography variant="caption" color="text.secondary">
              {dayjs(notification.createdAt).fromNow()}
            </Typography>

            {/* Action Menu */}
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              className="p-0.5"
              sx={{ p: 0.5 }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        {!notification.isRead && onMarkAsRead && (
          <MenuItem onClick={() => handleAction(() => onMarkAsRead(notification.id))}>
            <ListItemIcon>
              <MarkEmailRead fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Read</ListItemText>
          </MenuItem>
        )}
        
        {notification.isRead && onMarkAsUnread && (
          <MenuItem onClick={() => handleAction(() => onMarkAsUnread(notification.id))}>
            <ListItemIcon>
              <MarkEmailUnread fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Unread</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={() => handleAction(() => onClick?.(notification))}>
          <ListItemIcon>
            <OpenInNew fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleAction(() => {
          if (navigator.share) {
            navigator.share({
              title: notification.subject,
              text: notification.content
            });
          }
        })}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => handleAction(() => onDelete?.(notification.id))}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default NotificationItem;
