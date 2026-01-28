import api, { ApiResponse } from "./api";

// Admin Service API - Banking-Grade Admin Operations
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

export interface AdminSessionData {
  user_id: number;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  token_type: string;
  session_id: string;
  expiration: string;
  last_login?: string;
  failed_attempts: number;
  locked_until?: string;
}

export interface SystemMetrics {
  total_users: number;
  admin_users: number;
  customer_users: number;
  staff_users: number;
  auditor_users: number;
  active_users: number;
  locked_users: number;
  system_health: {
    status: string;
    lock_rate: number;
    total_users: number;
    locked_users: number;
  };
  last_updated: string;
}

export interface CustomerStatistics {
  total_customers: number;
  new_this_month: number;
  new_this_week: number;
  active_customers: number;
}

export interface TransactionStatistics {
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  pending_transactions: number;
  total_volume: number;
  average_transaction_amount: number;
  peak_hour: string;
  last_updated: string;
}

export interface FailedTransactions {
  failed_last_24h: number;
  failure_rate: number;
  common_failure_reasons: string[];
  affected_users: number;
  period_start: string;
  period_end: string;
}

// STEP 2: ADMIN SESSION INITIALIZATION
export const getAdminSession = async (): Promise<AdminSessionData> => {
  const response = await api.get<ApiResponse<AdminSessionData>>('/admin/me');
  return response.data.data;
};

// STEP 3: ADMIN DASHBOARD METRICS
export const getSystemMetrics = async (): Promise<SystemMetrics> => {
  const response = await api.get<ApiResponse<SystemMetrics>>('/admin/dashboard/metrics');
  return response.data.data;
};

export const getCustomerStatistics = async (): Promise<CustomerStatistics> => {
  const response = await api.get<ApiResponse<CustomerStatistics>>('/admin/dashboard/customers');
  return response.data.data;
};

export const getTransactionStatistics = async (): Promise<TransactionStatistics> => {
  const response = await api.get<ApiResponse<TransactionStatistics>>('/admin/dashboard/transactions');
  return response.data.data;
};

export const getFailedTransactions = async (): Promise<FailedTransactions> => {
  const response = await api.get<ApiResponse<FailedTransactions>>('/admin/dashboard/failed-transactions');
  return response.data.data;
};

// STEP 4: USER MANAGEMENT
export const getAllUsers = async (): Promise<UserDetailDto[]> => {
  const response = await api.get<ApiResponse<UserDetailDto[]>>('/admin/users');
  return response.data.data;
};

export const lockUser = async (userId: number, reason?: string): Promise<string> => {
  const response = await api.post<ApiResponse<string>>(`/admin/users/${userId}/lock`, { reason });
  return response.data.data;
};

export const unlockUser = async (userId: number, reason?: string): Promise<string> => {
  const response = await api.post<ApiResponse<string>>(`/admin/users/${userId}/unlock`, { reason });
  return response.data.data;
};

export const forcePasswordReset = async (userId: number, reason?: string): Promise<string> => {
  const response = await api.post<ApiResponse<string>>(`/admin/users/${userId}/force-password-reset`, { reason });
  return response.data.data;
};

// STEP 8: ADMIN LOGOUT
export const adminLogout = async (): Promise<string> => {
  const response = await api.post<ApiResponse<string>>('/admin/logout');
  return response.data.data;
};

// Legacy methods (for backward compatibility)
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

// Reset User Password
export const resetUserPassword = async (userId: number, newPassword: string): Promise<void> => {
  await api.post(`/users/${userId}/reset-password`, { newPassword });
};

// Get User Activity
export const getUserActivity = async (userId: number): Promise<any[]> => {
  const response = await api.get<any[]>(`/users/${userId}/activity`);
  return response.data;
};
