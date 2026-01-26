import api from "../api";
import { ApiResponse } from "../api";

// User DTOs
export interface UserDetailDto {
  userId: number;
  username: string;
  email?: string; // KYC fields - null in banking model
  phoneNumber?: string; // KYC fields - null in banking model
  firstName?: string; // KYC fields - null in banking model
  lastName?: string; // KYC fields - null in banking model
  roles: RoleDto[];
  permissions: PermissionDto[];
  status: string;
  failedLoginAttempts?: number;
  lastLoginAt?: string;
  lockedUntil?: string;
}

export interface RoleDto {
  roleId: number;
  roleName: string;
}

export interface PermissionDto {
  permissionId: number;
  permissionName: string;
}

export interface UserCreationRequestDto {
  username: string;
  password: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  roleNames: string[];
  permissionNames: string[];
}

export interface CustomerCredentialRequestDTO {
  username: string;
  password: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  roleNames: string[];
  permissionNames: string[];
  createCustomerDto: any;
}

export interface AccountManagerRequestDTO {
  username: string;
  password: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  roleNames: string[];
  permissionNames: string[];
  userId?: number;
}

// User API Service
export const userService = {
  // Create user
  createUser: async (userData: UserCreationRequestDto): Promise<UserDetailDto> => {
    const response = await api.post<UserDetailDto>('users/create', userData);
    return response.data;
  },

  // Create customer user (banking-grade registration)
  createCustomerUser: async (userData: CustomerCredentialRequestDTO): Promise<UserDetailDto> => {
    const response = await api.post<UserDetailDto>('users/customer', userData);
    return response.data;
  },

  // Create account manager
  createAccountManager: async (userData: AccountManagerRequestDTO): Promise<UserDetailDto> => {
    const response = await api.post<UserDetailDto>('users/account-manager', userData);
    return response.data;
  },

  // Get all users
  getAllUsers: async (): Promise<UserDetailDto[]> => {
    const response = await api.get<UserDetailDto[]>('users/get');
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId: number): Promise<UserDetailDto> => {
    const response = await api.get<UserDetailDto>(`users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId: number, userData: Partial<UserDetailDto>): Promise<UserDetailDto> => {
    const response = await api.put<UserDetailDto>(`users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`users/${userId}`);
  },

  // Get user profile (current user)
  getUserProfile: async (): Promise<UserDetailDto> => {
    const response = await api.get<UserDetailDto>('users/profile');
    return response.data;
  },

  // Update user profile
  updateUserProfile: async (userData: Partial<UserDetailDto>): Promise<UserDetailDto> => {
    const response = await api.put<UserDetailDto>('users/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.post('users/change-password', {
      oldPassword,
      newPassword
    });
  },

  // Lock user account
  lockUser: async (userId: number): Promise<void> => {
    await api.post(`users/${userId}/lock`);
  },

  // Unlock user account
  unlockUser: async (userId: number): Promise<void> => {
    await api.post(`users/${userId}/unlock`);
  },

  // Reset failed login attempts
  resetFailedAttempts: async (userId: number): Promise<void> => {
    await api.post(`users/${userId}/reset-attempts`);
  }
};
