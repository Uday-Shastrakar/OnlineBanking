import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { handleApiError } from './errorHandler';

// Create an Axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',// Base URL for your API Gateway

  // baseURL: 'http://192.168.1.100:9093/api',

  // baseURL: process.env.REACT_APP_API_BASE_URL,

  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token and gateway headers
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add gateway headers for secure endpoints
    const user = localStorage.getItem('userDetails');
    if (user) {
      const userData = JSON.parse(user);
      const userId = userData.userId || userData.id;
      const userEmail = userData.email || userData.userName || '';

      config.headers['X-User-Id'] = userId;
      config.headers['userId'] = userId;
      config.headers['email'] = userEmail;

      const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
      const roles = JSON.parse(localStorage.getItem('roles') || '[]');
      const allAuth = [...permissions, ...roles];
      config.headers['X-Permissions'] = allAuth.length > 0 ? JSON.stringify(allAuth) : 'USER';
    }

    // Add X-Request-ID for tracking
    if (!config.headers['X-Request-Id']) {
      config.headers['X-Request-Id'] = generateRequestId();
    }
    // Also add X-Request-ID for backward compatibility
    if (!config.headers['X-Request-ID']) {
      config.headers['X-Request-ID'] = config.headers['X-Request-Id'];
    }

    // Add Idempotency-Key if provided in request config
    if (config.idempotencyKey) {
      config.headers['Idempotency-Key'] = config.idempotencyKey;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle responses
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  (error: AxiosError) => {
    // Check if this is a login request - don't show session expiry for login failures
    const isLoginRequest = error.config?.url?.includes('auth/login');

    // Use centralized error handler
    if (error.response?.status === 401) {
      if (isLoginRequest) {
        // For login requests, let the login component handle the error
        // Don't show session expiry message for wrong credentials
        console.log('Login failed - letting login component handle error');
      } else {
        // Handle unauthorized - token expired for other requests
        handleApiError(error, {
          showNotification: true,
          redirectToLogin: true,
          customMessage: 'Your session has expired. Please log in again.'
        });
      }
    } else if (error.response?.status === 403) {
      // Handle forbidden - insufficient permissions
      handleApiError(error, {
        showNotification: true,
        customMessage: 'You do not have permission to perform this action.'
      });
    } else if (error.response?.status === 409) {
      // Handle conflict - username already exists
      handleApiError(error, {
        showNotification: true,
        customMessage: 'Username already exists. Please choose a different username.'
      });
    } else if (error.response?.status === 410) {
      // Handle gone - deprecated endpoint
      handleApiError(error, {
        showNotification: true,
        customMessage: 'This feature is no longer available.'
      });
    } else {
      // Handle other errors
      handleApiError(error, {
        showNotification: true,
        logToConsole: true
      });
    }

    return Promise.reject(error);
  }
);


export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

// Helper function to generate request IDs
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default api;



