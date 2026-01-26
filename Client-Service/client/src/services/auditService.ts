import api, { ApiResponse } from "./api";

// Audit Service API
export interface AuditEvent {
  id: number;
  timestamp: string;
  userId: string;
  action: string;
  status: string;
  correlationId: string;
  details?: string;
}

export interface SystemMetrics {
  totalUsers: number;
  totalAccounts: number;
  totalTransactions: number;
  failedTransactions: number;
  activeUsers: number;
  blockedUsers: number;
  systemHealth: string;
  lastUpdated: string;
}

// Get All Audit Logs
export const getAllAuditLogs = async (): Promise<AuditEvent[]> => {
  const response = await api.get<AuditEvent[]>('/audit/all');
  return response.data;
};

// Get System Metrics
export const getSystemMetrics = async (): Promise<SystemMetrics> => {
  const response = await api.get<SystemMetrics>('/audit/metrics');
  return response.data;
};

// Get Audit Logs by Action
export const getAuditLogsByAction = async (action: string): Promise<AuditEvent[]> => {
  const response = await api.get<AuditEvent[]>(`/audit/by-action?action=${action}`);
  return response.data;
};

// Get Audit Logs by User
export const getAuditLogsByUser = async (userId: string): Promise<AuditEvent[]> => {
  const response = await api.get<AuditEvent[]>(`/audit/by-user?userId=${userId}`);
  return response.data;
};

// Get Audit Logs by Date Range
export const getAuditLogsByDateRange = async (startDate: string, endDate: string): Promise<AuditEvent[]> => {
  const response = await api.get<AuditEvent[]>(`/audit/by-date?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};
