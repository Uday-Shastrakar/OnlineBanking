import api from "./api"
import { ApiResponse } from "./api"
import { Credentials, LoginResponse, RegisterForm, User } from "../Types";


export const login = async (credentials: Credentials): Promise<void> => {
    const response = await api.post<LoginResponse>('auth/login', credentials);


    // Destructure data from the response
    const { jwtToken, userName, authorities, userId, email, firstName, lastName, phoneNumber } = response.data.data;

    // Store JWT token in localStorage
    localStorage.setItem('authToken', jwtToken);
    // Store userName in localStorage
    localStorage.setItem("userName", userName);
    // Store roles and permissions - support banking-grade roles
    localStorage.setItem("roles", JSON.stringify(authorities.filter((item: string) => 
        ["ADMIN", "CUSTOMER_USER", "BANK_STAFF", "AUDITOR", "CUSTOMER", "USER"].includes(item)
    )));
    localStorage.setItem("permissions", JSON.stringify(authorities.filter((item: string) => ["PERMISSION_READ", "PERMISSION_WRITE"].includes(item))));

    // Store user details in an array format
    const userDetails = [
        {
            userId,
            email,
            userName,
            firstName,
            lastName,
            phoneNumber // If phoneNumber exists in the response
        }
    ];

    // Store the array in localStorage
    localStorage.setItem("userDetails", JSON.stringify(userDetails));
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
    // Clear all authentication-related data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('roles');
    localStorage.removeItem('permissions');
    localStorage.removeItem('userDetails');
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