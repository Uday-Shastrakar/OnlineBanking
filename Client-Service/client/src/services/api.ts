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
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      config.headers['X-User-Id'] = userData.userId || userData.id;
      config.headers['X-Permissions'] = userData.permissions || userData.roles?.join(',') || 'USER';
    }

    // Add X-Request-ID for tracking
    if (!config.headers['X-Request-ID']) {
      config.headers['X-Request-ID'] = generateRequestId();
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
    // Use centralized error handler
    if (error.response?.status === 401) {
      // Handle unauthorized - token expired
      handleApiError(error, {
        showNotification: true,
        redirectToLogin: true,
        customMessage: 'Your session has expired. Please log in again.'
      });
    } else if (error.response?.status === 403) {
      // Handle forbidden - insufficient permissions
      handleApiError(error, {
        showNotification: true,
        customMessage: 'You do not have permission to perform this action.'
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



