import api, { ApiResponse } from "./api";

// Reporting Service API (Custom Enhancement)
export interface ReportRequest {
  reportType: string;
  startDate: string;
  endDate: string;
  userId?: number;
  accountNumber?: string;
  format?: 'PDF' | 'EXCEL' | 'CSV';
  filters?: Record<string, any>;
}

export interface ReportData {
  reportId: string;
  reportName: string;
  reportType: string;
  generatedAt: string;
  fileSize: number;
  downloadUrl: string;
  format: string;
}

export interface FinancialSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  netBalance: number;
  transactionCount: number;
  averageTransaction: number;
  period: string;
}

export interface AccountAnalytics {
  accountId: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  transactionCount: number;
  lastActivity: string;
  monthlyGrowth: number;
  riskScore: number;
}

export interface TransactionAnalytics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalAmount: number;
  averageAmount: number;
  peakHours: string[];
  popularDestinations: string[];
}

// Generate Account Statement
export const generateAccountStatement = async (request: ReportRequest): Promise<ReportData> => {
  try {
    const response = await api.post<ReportData>('/reports/account-statement', request);
    return response.data;
  } catch (error: any) {
    console.error("Error generating account statement:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to generate account statement");
  }
};

// Generate Transaction Report
export const generateTransactionReport = async (request: ReportRequest): Promise<ReportData> => {
  try {
    const response = await api.post<ReportData>('/reports/transaction-report', request);
    return response.data;
  } catch (error: any) {
    console.error("Error generating transaction report:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to generate transaction report");
  }
};

// Generate Tax Report
export const generateTaxReport = async (request: ReportRequest): Promise<ReportData> => {
  try {
    const response = await api.post<ReportData>('/reports/tax-report', request);
    return response.data;
  } catch (error: any) {
    console.error("Error generating tax report:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to generate tax report");
  }
};

// Generate Annual Summary
export const generateAnnualSummary = async (year: number, userId: number): Promise<ReportData> => {
  try {
    const response = await api.post<ReportData>('/reports/annual-summary', { year, userId });
    return response.data;
  } catch (error: any) {
    console.error("Error generating annual summary:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to generate annual summary");
  }
};

// Get Financial Summary
export const getFinancialSummary = async (userId: number, period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<FinancialSummary> => {
  try {
    const response = await api.get<FinancialSummary>(`/reports/financial-summary?userId=${userId}&period=${period}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching financial summary:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch financial summary");
  }
};

// Get Account Analytics
export const getAccountAnalytics = async (userId: number): Promise<AccountAnalytics[]> => {
  try {
    const response = await api.get<AccountAnalytics[]>(`/reports/account-analytics?userId=${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching account analytics:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch account analytics");
  }
};

// Get Transaction Analytics
export const getTransactionAnalytics = async (userId: number, period: string): Promise<TransactionAnalytics> => {
  try {
    const response = await api.get<TransactionAnalytics>(`/reports/transaction-analytics?userId=${userId}&period=${period}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching transaction analytics:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch transaction analytics");
  }
};

// Download Report
export const downloadReport = async (reportId: string): Promise<Blob> => {
  try {
    const response = await api.get<Blob>(`/reports/download/${reportId}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    console.error("Error downloading report:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to download report");
  }
};

// Get Report History
export const getReportHistory = async (userId: number): Promise<ReportData[]> => {
  try {
    const response = await api.get<ReportData[]>(`/reports/history?userId=${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching report history:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch report history");
  }
};

// Delete Report
export const deleteReport = async (reportId: string): Promise<void> => {
  try {
    await api.delete(`/reports/${reportId}`);
  } catch (error: any) {
    console.error("Error deleting report:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to delete report");
  }
};

// Schedule Report Generation
export const scheduleReport = async (request: ReportRequest & { schedule: string }): Promise<string> => {
  try {
    const response = await api.post<string>('/reports/schedule', request);
    return response.data;
  } catch (error: any) {
    console.error("Error scheduling report:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to schedule report");
  }
};

// Get Scheduled Reports
export const getScheduledReports = async (userId: number): Promise<any[]> => {
  try {
    const response = await api.get<any[]>(`/reports/scheduled?userId=${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching scheduled reports:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch scheduled reports");
  }
};

// Cancel Scheduled Report
export const cancelScheduledReport = async (scheduleId: string): Promise<void> => {
  try {
    await api.delete(`/reports/schedule/${scheduleId}`);
  } catch (error: any) {
    console.error("Error canceling scheduled report:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to cancel scheduled report");
  }
};

const reportingService = {
  generateAccountStatement,
  generateTransactionReport,
  generateTaxReport,
  generateAnnualSummary,
  getFinancialSummary,
  getAccountAnalytics,
  getTransactionAnalytics,
  downloadReport,
  getReportHistory,
  deleteReport,
  scheduleReport,
  getScheduledReports,
  cancelScheduledReport
};

export default reportingService;
