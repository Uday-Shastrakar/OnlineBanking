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
      
      // Handle different response structures
      const data = response.data;
      if (Array.isArray(data)) {
        // Backend returns array directly, convert to paginated format
        return {
          content: data.map(transformAuditEvent),
          totalElements: data.length,
          totalPages: Math.ceil(data.length / (params?.size || 50))
        };
      } else if (data.content) {
        // Backend returns paginated format
        return {
          content: data.content.map(transformAuditEvent),
          totalElements: data.totalElements || data.content.length,
          totalPages: data.totalPages || 1
        };
      } else {
        // Fallback
        return {
          content: [],
          totalElements: 0,
          totalPages: 0
        };
      }
    } catch (error: any) {
      console.error('Failed to fetch audit events:', error);
      // Return empty result instead of mock data
      return {
        content: [],
        totalElements: 0,
        totalPages: 0
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
    try {
      const response = await api.get<any>('audit/all', {
        params: { page: 0, size: 1000 }, // Get large page for backward compatibility
        headers: {
          'X-Request-ID': generateRequestId()
        }
      });
      const data = response.data;
      if (Array.isArray(data)) {
        return data.map(transformAuditEvent);
      } else if (data.content) {
        return data.content.map(transformAuditEvent);
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
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

// Transform backend audit event to frontend format
function transformAuditEvent(backendEvent: any): AuditEvent {
  return {
    id: backendEvent.id,
    eventId: backendEvent.auditId || `audit-${backendEvent.id}`,
    domain: backendEvent.eventType || 'SYSTEM',
    action: backendEvent.action || 'UNKNOWN',
    entityId: backendEvent.customerId?.toString() || backendEvent.userId?.toString() || 'unknown',
    userId: backendEvent.userId?.toString() || 'unknown',
    eventTimestamp: backendEvent.timestamp || backendEvent.eventTimestamp || new Date().toISOString(),
    details: backendEvent.payload ? JSON.parse(backendEvent.payload) : {},
    createdAt: backendEvent.timestamp || new Date().toISOString(),
    updatedAt: backendEvent.timestamp || new Date().toISOString(),
    // Legacy fields for backward compatibility
    eventType: backendEvent.eventType,
    serviceName: backendEvent.serviceName,
    payload: backendEvent.payload,
    timestamp: backendEvent.timestamp,
    status: backendEvent.status,
    correlationId: backendEvent.correlationId
  };
}

// Helper function
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
