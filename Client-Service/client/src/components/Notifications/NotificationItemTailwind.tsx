import React from 'react';
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

const NotificationItemTailwind: React.FC<NotificationItemProps> = ({
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
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: NotificationCategory) => {
    switch (category) {
      case 'TRANSACTION':
        return 'bg-green-100 text-green-800';
      case 'SECURITY':
        return 'bg-red-100 text-red-800';
      case 'MARKETING':
        return 'bg-purple-100 text-purple-800';
      case 'ACCOUNT':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div
      className={`
        p-4 border rounded-lg mb-2 cursor-pointer
        transition-all duration-200 ease-in-out
        ${notification.isRead 
          ? 'bg-white border-gray-200 hover:bg-gray-50' 
          : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
        }
        hover:shadow-md
      `}
      onClick={() => onClick?.(notification)}
    >
      <div className="flex items-start gap-3">
        {/* Category Icon */}
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-lg flex-shrink-0">
          {getCategoryIcon(notification.category)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`
                text-sm font-medium truncate flex-1 min-w-0
                ${notification.isRead ? 'font-normal' : 'font-semibold'}
              `}
            >
              {notification.subject}
            </h3>
            
            {/* Priority and Category Badges */}
            <span className={`
              px-2 py-1 text-xs font-medium rounded-full border
              ${getPriorityColor(notification.priority)}
            `}>
              {notification.priority}
            </span>
            <span className={`
              px-2 py-1 text-xs font-medium rounded-full
              ${getCategoryColor(notification.category)}
            `}>
              {notification.category}
            </span>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {notification.content}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {dayjs(notification.createdAt).fromNow()}
            </span>

            {/* Action Menu */}
            <button
              className="p-1 rounded hover:bg-gray-200 transition-colors"
              onClick={handleMenuOpen}
            >
              <MoreVert fontSize="small" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Menu - Using Material-UI Menu for now */}
      {/* You can replace this with a custom Tailwind dropdown */}
      <div
        className="hidden absolute right-4 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
        style={{ display: anchorEl ? 'block' : 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        {!notification.isRead && onMarkAsRead && (
          <button
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            onClick={() => handleAction(() => onMarkAsRead(notification.id))}
          >
            <MarkEmailRead fontSize="small" className="mr-2" />
            Mark as Read
          </button>
        )}
        
        {notification.isRead && onMarkAsUnread && (
          <button
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            onClick={() => handleAction(() => onMarkAsUnread(notification.id))}
          >
            <MarkEmailUnread fontSize="small" className="mr-2" />
            Mark as Unread
          </button>
        )}

        <button
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          onClick={() => handleAction(() => onClick?.(notification))}
        >
          <OpenInNew fontSize="small" className="mr-2" />
          View Details
        </button>

        <button
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          onClick={() => handleAction(() => {
            if (navigator.share) {
              navigator.share({
                title: notification.subject,
                text: notification.content
              });
            }
          })}
        >
          <Share fontSize="small" className="mr-2" />
          Share
        </button>

        <div className="border-t border-gray-100 my-1"></div>

        <button
          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
          onClick={() => handleAction(() => onDelete?.(notification.id))}
        >
          <Delete fontSize="small" className="mr-2" />
          Delete
        </button>
      </div>

      {/* Overlay to close menu */}
      {anchorEl && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleMenuClose}
        />
      )}
    </div>
  );
};

export default NotificationItemTailwind;
