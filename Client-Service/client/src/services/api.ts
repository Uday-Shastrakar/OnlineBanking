import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Create an Axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://192.168.1.100:9093/api'  ,// Base URL for your API

  // baseURL: 'http://192.168.1.100:909yar3/api',

  // baseURL: process.env.REACT_APP_API_BASE_URL,
  
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Retrieve the token from local storage or a state management library
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add the token to the Authorization header
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
    if (error.response && error.response.status === 401) {
      // Handle unauthorized responses (e.g., token expired)
      // Redirect to login page or show an alert
    }
    return Promise.reject(error);
  }
);


export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export default api;



