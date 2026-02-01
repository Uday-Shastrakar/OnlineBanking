import api from "./api"
import { ApiResponse } from "./api"
import { Credentials, LoginResponse, RegisterForm, User } from "../Types";
import AuthStorage from './authStorage';

export const login = async (credentials: Credentials): Promise<void> => {
    try {
        const response = await api.post<ApiResponse<LoginResponse>>('auth/login', credentials);

        // Debug the response structure
        console.log('Login response structure:', response);
        console.log('Response data:', response.data);

        // The backend returns { success: true, data: LoginResponseDto, message: "Login Successfully" }
        // So we need to access response.data.data directly
        const loginData = response.data.data;

        if (!loginData) {
            console.error('Login data is missing. Response structure:', response);
            throw new Error('Invalid login response from server');
        }

        // Destructure the actual login data
        const { jwtToken, userName, authorities, userId, email, firstName, lastName, phoneNumber } = loginData;

        console.log('Login data extracted:', { jwtToken: jwtToken ? 'exists' : 'missing', userName, authorities, userId, email, firstName, lastName });

        // Use AuthStorage to store authentication data properly
        AuthStorage.setAuthData(jwtToken, {
            userId,
            userName,
            email,
            firstName,
            lastName,
            phoneNumber
        }, authorities);

        console.log('Authentication data stored successfully via AuthStorage');
    } catch (error: any) {
        console.error('Login error:', error);

        // Handle different types of errors
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const status = error.response.status;
            const message = error.response.data?.message || error.response.data?.error || 'Login failed';

            if (status === 401) {
                throw new Error('Invalid username or password');
            } else if (status === 403) {
                throw new Error('Access forbidden. Please contact administrator.');
            } else if (status === 404) {
                throw new Error('User not found');
            } else {
                throw new Error(message || `Login failed with status ${status}`);
            }
        } else if (error.request) {
            // The request was made but no response was received
            throw new Error('Network error. Please check your connection.');
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error(error.message || 'Login failed. Please try again.');
        }
    }
};



export const register = async (registerForm: RegisterForm): Promise<RegisterForm> => {
    const response = await api.post<RegisterForm>('users/create', registerForm);
    return response.data;
};

// API call for user forgot password
export const forgotPassword = async (email: string): Promise<String> => {
    const response = await api.post<String>(`auth/forgot-password?email=${encodeURIComponent(email)}`);
    return response.data;
};


// API call for verifying OTP
export const verifyOtp = async (otp: string): Promise<ApiResponse<string>> => {
    const response = await api.post<ApiResponse<string>>(`auth/verify-otp?otp=${encodeURIComponent(otp)}`);
    return response.data;
};

// API call for reset password
export const resetPassword = async (otp: string, password: string): Promise<ApiResponse<string>> => {
    const response = await api.post<ApiResponse<string>>(`auth/reset-password?otp=${encodeURIComponent(otp)}&newPassword=${encodeURIComponent(password)}`);
    return response.data;
};

// API call for fetching Users
export const fetchUsers = async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get<ApiResponse<User[]>>(`users/get`);
    return response.data;
}

// API call for upload document
export const uploadDoc = async (userId: number, file: File): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>(`{userId}/upload`);
    return response.data;
}

// Logout functionality - centralized logout handler
export const logout = (): void => {
    AuthStorage.clearAuthData();
    localStorage.removeItem('sidebarCollapsed');

    // Clear any session-related data
    sessionStorage.clear();
};

// Get token expiry time from JWT
export const getTokenExpiry = (): number | null => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
    } catch (error) {
        console.error('Error parsing JWT token:', error);
        return null;
    }
};

// Check if token is expired
export const isTokenExpired = (): boolean => {
    const expiry = getTokenExpiry();
    if (!expiry) return false;

    return Date.now() >= expiry;
};

// Get remaining time until token expiry (in milliseconds)
export const getTokenRemainingTime = (): number => {
    const expiry = getTokenExpiry();
    if (!expiry) return 0;

    return Math.max(0, expiry - Date.now());
};

// Secure token validation
export const validateToken = (): boolean => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    // Check if token is expired
    if (isTokenExpired()) {
        logout();
        return false;
    }

    return true;
};