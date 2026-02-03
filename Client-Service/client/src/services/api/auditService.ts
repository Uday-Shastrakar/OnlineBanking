import api from "../api";
import { ApiResponse } from "../api";

// Audit DTOs
export interface AuditEvent {
  id: number;
  eventId: string;
  domain: string;
  action: string;
  entityId: string;
  userId: string;
  eventTimestamp: string;
  details: any;
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility
  eventType?: string;
  serviceName?: string;
  payload?: string;
  timestamp?: string;
  status?: string;
  correlationId?: string;
}

export interface SystemMetrics {
  totalEvents: number;
  todayEvents: number;
  topDomains: Record<string, number>;
  recentActivity: AuditEvent[];
  // Legacy metrics for backward compatibility
  totalUsers: number;
  totalCustomers: number;
  totalAccounts: number;
  totalTransactions: number;
  activeSessions: number;
  failedLogins: number;
  systemUptime: string;
  lastBackup: string;
  totalLogs: number;
}

// Audit API Service
export const auditService = {
  // Get all audit logs (paginated)
  getAllAuditEvents: async (params?: {
    page?: number;
    size?: number;
    userId?: string;
    domain?: string;
  }): Promise<{ content: AuditEvent[]; totalElements: number; totalPages: number; }> => {
    try {
      const response = await api.get<any>('audit/all', {
        params: {
          page: params?.page || 0,
          size: params?.size || 50,
          userId: params?.userId,
          domain: params?.domain
        },
        headers: {
          'X-Request-ID': generateRequestId()
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch audit events:', error);
      // Return mock data for UI demonstration
      return {
        content: [
          { 
            id: 1, 
            eventId: "audit-001",
            domain: "TRANSACTION", 
            action: "TRANSFER_INITIATED", 
            entityId: "tx-001",
            userId: "admin", 
            eventTimestamp: new Date().toISOString(),
            details: { amount: 1000, currency: "USD" },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          { 
            id: 2, 
            eventId: "audit-002",
            domain: "TRANSACTION", 
            action: "TRANSFER_COMPLETED", 
            entityId: "tx-001",
            userId: "uday", 
            eventTimestamp: new Date().toISOString(),
            details: { amount: 1000, currency: "USD", status: "COMPLETED" },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        totalElements: 2,
        totalPages: 1
      };
    }
  },

  // Get system metrics
  getSystemMetrics: async (): Promise<SystemMetrics> => {
    try {
      const response = await api.get<SystemMetrics>('audit/metrics', {
        headers: {
          'X-Request-ID': generateRequestId()
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch system metrics:', error);
      // Return mock metrics for UI demonstration
      return {
        totalEvents: 1250,
        todayEvents: 45,
        topDomains: {
          "TRANSACTION": 680,
          "SECURITY": 320,
          "USER": 180,
          "ACCOUNT": 70
        },
        recentActivity: [],
        totalUsers: 1250,
        totalCustomers: 980,
        totalAccounts: 1450,
        totalTransactions: 3200,
        activeSessions: 45,
        failedLogins: 12,
        systemUptime: "15 days, 8 hours",
        lastBackup: "2026-02-03 02:00:00",
        totalLogs: 15420
      };
    }
  },

  // Legacy method for backward compatibility
  getAllLogs: async (): Promise<AuditEvent[]> => {
    const response = await api.get<any>('audit/all', {
      params: { page: 0, size: 1000 }, // Get large page for backward compatibility
      headers: {
        'X-Request-ID': generateRequestId()
      }
    });
    return response.data.content || response.data || [];
  },

  // Get audit logs by user ID
  getLogsByUserId: async (userId: number): Promise<AuditEvent[]> => {
    const response = await api.get<any>('audit/all', {
      params: { 
        userId: userId.toString(),
        page: 0,
        size: 1000
      },
      headers: {
        'X-Request-ID': generateRequestId()
      }
    });
    return response.data.content || response.data || [];
  },

  // Get audit logs by customer ID
  getLogsByCustomerId: async (customerId: number): Promise<AuditEvent[]> => {
    const response = await api.get<any>('audit/all', {
      params: { 
        userId: customerId.toString(),
        domain: 'CUSTOMER',
        page: 0,
        size: 1000
      },
      headers: {
        'X-Request-ID': generateRequestId()
      }
    });
    return response.data.content || response.data || [];
  },

  // Get audit logs by action type
  getLogsByAction: async (action: string): Promise<AuditEvent[]> => {
    const response = await api.get<any>('audit/all', {
      params: { 
        domain: action,
        page: 0,
        size: 1000
      },
      headers: {
        'X-Request-ID': generateRequestId()
      }
    });
    return response.data.content || response.data || [];
  },

  // Get audit logs by date range
  getLogsByDateRange: async (startDate: string, endDate: string): Promise<AuditEvent[]> => {
    // This would need to be implemented in the backend
    // For now, return all logs and filter client-side
    const allLogs = await auditService.getAllLogs();
    return allLogs.filter(log => {
      const logDate = new Date(log.eventTimestamp || log.timestamp || '');
      return logDate >= new Date(startDate) && logDate <= new Date(endDate);
    });
  }
};

// Helper function
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
