import React, { useEffect, useState } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Box,
  Typography,
  Chip,
  Slide,
  SlideProps
} from '@mui/material';
import {
  Close,
  Notifications,
  AccountBalance,
  Security,
  Campaign,
  SystemUpdate,
  Person,
  OpenInNew
} from '@mui/icons-material';
import { Notification, NotificationPriority, NotificationCategory } from '../../services/notificationService';

interface NotificationToastProps {
  notification: Notification;
  open: boolean;
  onClose: () => void;
  autoHideDuration?: number;
  onViewDetails?: (notification: Notification) => void;
}

// Slide transition for toast
const SlideTransition = (props: SlideProps) => {
  return <Slide {...props} direction="down" />;
};

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  open,
  onClose,
  autoHideDuration = 6000,
  onViewDetails
}) => {
  const [extendedOpen, setExtendedOpen] = useState(false);

  useEffect(() => {
    // Reset extended state when notification changes
    setExtendedOpen(false);
  }, [notification.id]);

  const getSeverity = (priority: NotificationPriority): 'success' | 'info' | 'warning' | 'error' => {
    switch (priority) {
      case 'URGENT':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'success';
      default:
        return 'info';
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'TRANSACTION':
        return <AccountBalance />;
      case 'SECURITY':
        return <Security />;
      case 'MARKETING':
        return <Campaign />;
      case 'SYSTEM':
        return <SystemUpdate />;
      case 'ACCOUNT':
        return <Person />;
      default:
        return <Notifications />;
    }
  };

  const getCategoryColor = (category: NotificationCategory): 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default' => {
    switch (category) {
      case 'TRANSACTION':
        return 'primary';
      case 'SECURITY':
        return 'error';
      case 'MARKETING':
        return 'secondary';
      case 'SYSTEM':
        return 'warning';
      case 'ACCOUNT':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleViewDetails = () => {
    onViewDetails?.(notification);
    onClose();
  };

  const handleExtend = () => {
    setExtendedOpen(true);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={extendedOpen ? null : autoHideDuration}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        mt: 8, // Account for navbar
        '& .MuiSnackbar-root': {
          maxWidth: 500
        }
      }}
    >
      <Alert
        severity={getSeverity(notification.priority)}
        onClose={onClose}
        sx={{
          width: '100%',
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
        action={
          <Box display="flex" gap={0.5}>
            {onViewDetails && (
              <IconButton
                size="small"
                onClick={handleViewDetails}
                title="View Details"
              >
                <OpenInNew fontSize="small" />
              </IconButton>
            )}
            <IconButton size="small" onClick={onClose}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getCategoryIcon(notification.category)}
          {notification.subject}
        </AlertTitle>

        <Box onClick={handleExtend} sx={{ cursor: 'pointer' }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {extendedOpen ? notification.content : `${notification.content.substring(0, 100)}${notification.content.length > 100 ? '...' : ''}`}
          </Typography>
          
          {notification.content.length > 100 && !extendedOpen && (
            <Typography variant="caption" color="primary">
              Click to expand...
            </Typography>
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={1} mt={1}>
          <Chip
            label={notification.category}
            size="small"
            color={getCategoryColor(notification.category)}
            variant="outlined"
          />
          <Chip
            label={notification.priority}
            size="small"
            color={getSeverity(notification.priority)}
            variant="filled"
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            Just now
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default NotificationToast;
