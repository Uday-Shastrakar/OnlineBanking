import api, { ApiResponse } from "./api";

// Admin Service API
export interface UserDetailDto {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[];
  permissions: string[];
  status: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserCreationRequestDto {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roleNames: string[];
  permissionNames: string[];
}

export interface AccountManagerRequestDTO {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roleNames: string[];
  permissionNames: string[];
  userId?: number;
}

// Get All Users
export const getAllUsers = async (): Promise<UserDetailDto[]> => {
  const response = await api.get<UserDetailDto[]>('/users/get');
  return response.data;
};

// Create User
export const createUser = async (userData: UserCreationRequestDto): Promise<UserDetailDto> => {
  const response = await api.post<UserDetailDto>('/users/create', userData);
  return response.data;
};

// Create Account Manager
export const createAccountManager = async (accountManagerData: AccountManagerRequestDTO): Promise<UserDetailDto> => {
  const response = await api.post<UserDetailDto>('/users/account-manager', accountManagerData);
  return response.data;
};

// Get User by ID
export const getUserById = async (userId: number): Promise<UserDetailDto> => {
  const response = await api.get<UserDetailDto>(`/users/${userId}`);
  return response.data;
};

// Update User
export const updateUser = async (userId: number, userData: Partial<UserDetailDto>): Promise<UserDetailDto> => {
  const response = await api.put<UserDetailDto>(`/users/${userId}`, userData);
  return response.data;
};

// Delete User
export const deleteUser = async (userId: number): Promise<void> => {
  await api.delete(`/users/${userId}`);
};

// Lock User
export const lockUser = async (userId: number): Promise<void> => {
  await api.post(`/users/${userId}/lock`);
};

// Unlock User
export const unlockUser = async (userId: number): Promise<void> => {
  await api.post(`/users/${userId}/unlock`);
};

// Reset User Password
export const resetUserPassword = async (userId: number, newPassword: string): Promise<void> => {
  await api.post(`/users/${userId}/reset-password`, { newPassword });
};

// Get User Activity
export const getUserActivity = async (userId: number): Promise<any[]> => {
  const response = await api.get<any[]>(`/users/${userId}/activity`);
  return response.data;
};
