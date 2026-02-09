import { Notification } from './notificationService';

export interface WebSocketMessage {
  type: 'notification' | 'unread_count' | 'connection_status';
  data?: Notification | number | { status: 'connected' | 'disconnected' | 'error' };
  timestamp?: string;
}

export interface WebSocketCallbacks {
  onNotification?: (notification: Notification) => void;
  onUnreadCount?: (count: number) => void;
  onConnectionStatus?: (status: 'connected' | 'disconnected' | 'error') => void;
  onError?: (error: Error) => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private callbacks: WebSocketCallbacks = {};
  private isManualClose = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(url: string = 'ws://localhost:9098/ws-notifications') {
    this.url = url;
  }

  connect(callbacks: WebSocketCallbacks = {}): Promise<void> {
    this.callbacks = { ...this.callbacks, ...callbacks };
    this.isManualClose = false;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.callbacks.onConnectionStatus?.('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            this.callbacks.onError?.(error as Error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.stopHeartbeat();
          this.callbacks.onConnectionStatus?.('disconnected');
          
          if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.callbacks.onConnectionStatus?.('error');
          this.callbacks.onError?.(new Error('WebSocket connection error'));
          reject(error);
        };
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'notification':
        if (message.data && typeof message.data === 'object' && 'id' in message.data) {
          this.callbacks.onNotification?.(message.data as Notification);
        }
        break;
      case 'unread_count':
        if (typeof message.data === 'number') {
          this.callbacks.onUnreadCount?.(message.data);
        }
        break;
      case 'connection_status':
        if (message.data && typeof message.data === 'object' && 'status' in message.data) {
          this.callbacks.onConnectionStatus?.(message.data.status as 'connected' | 'disconnected' | 'error');
        }
        break;
      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff, max 30s
    console.log(`Attempting to reconnect in ${delay / 1000} seconds...`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(this.callbacks).catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  disconnect(): void {
    this.isManualClose = true;
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'DISCONNECTED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'CONNECTED';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }

  // Send a message to the server
  send(message: any): void {
    if (this.isConnected() && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('Cannot send message: WebSocket is not connected');
    }
  }

  // Subscribe to user-specific notifications
  subscribeToUserNotifications(email: string): void {
    this.send({
      type: 'subscribe',
      channel: 'user_notifications',
      email: email
    });
  }

  // Unsubscribe from user notifications
  unsubscribeFromUserNotifications(email: string): void {
    this.send({
      type: 'unsubscribe',
      channel: 'user_notifications',
      email: email
    });
  }

  // Update callbacks
  updateCallbacks(callbacks: Partial<WebSocketCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Get connection statistics
  getConnectionStats(): {
    isConnected: boolean;
    state: string;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
  } {
    return {
      isConnected: this.isConnected(),
      state: this.getConnectionState(),
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
