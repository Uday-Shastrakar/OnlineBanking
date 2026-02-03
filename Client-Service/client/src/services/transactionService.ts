import api, { ApiResponse } from "./api";
import { Transaction, TransactionStatus } from "../types/banking";

export interface TransferRequest {
  senderAccountId: number;
  receiverAccountNumber: string;
  amount: number;
  description?: string;
}

export interface UserSession {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  activeAccounts: number;
  totalBalance: number;
}

// Get Transaction Session (✅ Backend supports this)
export const getTransactionSession = async (): Promise<UserSession> => {
  try {
    const response = await api.get<UserSession>('/transaction/session');
    return response.data;
  } catch (error: any) {
    console.error("Error fetching transaction session:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch transaction session");
  }
};

// Fund Transfer (✅ Backend supports this)
export const fundTransfer = async (amount: number, receiverAccountNumber: string, idempotencyKey?: string): Promise<string> => {
  try {
    const config = idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : {};
    const response = await api.post<string>(`/transaction/transfer?receiverAmount=${amount}&receiverAccountNumber=${receiverAccountNumber}`, {}, config);
    return response.data;
  } catch (error: any) {
    console.error("Error processing fund transfer:", error);
    throw new Error(error.response?.data?.message || error.message || "Fund transfer failed");
  }
};

// Get All Transactions (✅ Backend supports this - requires accountNumber)
export const getAllTransactions = async (accountNumber: number): Promise<Transaction[]> => {
  try {
    const response = await api.get<Transaction[]>(`/transaction/getall?accountNumber=${accountNumber}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch transactions");
  }
};

// Get Transaction by ID (✅ Now supported!)
export const getTransactionById = async (transactionId: number): Promise<Transaction> => {
  try {
    const response = await api.get<Transaction>(`/transaction/${transactionId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching transaction:", error);
    throw new Error(error.response?.data?.message || error.message || "Transaction not found");
  }
};

// Get Transactions by Status (✅ Now supported!)
export const getTransactionsByStatus = async (status: TransactionStatus): Promise<Transaction[]> => {
  try {
    const response = await api.get<Transaction[]>(`/transaction/by-status?status=${status}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching transactions by status:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch transactions");
  }
};

// Get Transactions by Date Range (✅ Now supported!)
export const getTransactionsByDateRange = async (startDate: string, endDate: string): Promise<Transaction[]> => {
  try {
    const response = await api.get<Transaction[]>(`/transaction/by-date?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching transactions by date range:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch transactions");
  }
};

// Get Transactions by Amount Range (✅ Now supported!)
export const getTransactionsByAmountRange = async (minAmount: number, maxAmount: number): Promise<Transaction[]> => {
  try {
    const response = await api.get<Transaction[]>(`/transaction/by-amount?minAmount=${minAmount}&maxAmount=${maxAmount}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching transactions by amount range:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch transactions");
  }
};

// Get Recent Transactions (✅ Now supported!)
export const getRecentTransactions = async (accountNumber: number): Promise<Transaction[]> => {
  try {
    const response = await api.get<Transaction[]>(`/transaction/recent/${accountNumber}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching recent transactions:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch recent transactions");
  }
};

// Get Transaction History by User ID (✅ Now supported with role-based descriptions!)
export const getTransactionHistoryByUserId = async (userId: number): Promise<Transaction[]> => {
  try {
    const response = await api.get<Transaction[]>(`/transaction/history?userId=${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching transaction history:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch transaction history");
  }
};

// Get Sent Transactions (✅ New - sender perspective!)
export const getSentTransactions = async (userId: number): Promise<Transaction[]> => {
  try {
    const response = await api.get<Transaction[]>(`/transaction/sent?userId=${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching sent transactions:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch sent transactions");
  }
};

// Get Received Transactions (✅ New - receiver perspective!)
export const getReceivedTransactions = async (userId: number): Promise<Transaction[]> => {
  try {
    const response = await api.get<Transaction[]>(`/transaction/received?userId=${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching received transactions:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch received transactions");
  }
};

// Get Bifurcated Transaction Summary (✅ New - complete view!)
export const getBifurcatedTransactionSummary = async (userId: number): Promise<any> => {
  try {
    const response = await api.get<any>(`/transaction/bifurcated-summary?userId=${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching bifurcated transaction summary:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch transaction summary");
  }
};

// Get Banking-Grade Transaction History (✅ New - Credit/Debit Ledger!)
export const getLedgerTransactionHistory = async (userId: number, page?: number, size?: number): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append('userId', userId.toString());
    if (page !== undefined) params.append('page', page.toString());
    if (size !== undefined) params.append('size', size.toString());
    
    const response = await api.get<any>(`/transactions?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching ledger transaction history:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch transaction history");
  }
};

// Get All Ledger Transaction History (✅ New - no pagination)
export const getAllLedgerTransactionHistory = async (userId: number): Promise<any[]> => {
  try {
    const response = await api.get<any[]>(`/transactions/all?userId=${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching all ledger transaction history:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch transaction history");
  }
};

// Default export for transactionService object
const transactionService = {
  fundTransfer,
  getAllTransactions,
  getTransactionById,
  getTransactionsByStatus,
  getTransactionsByDateRange,
  getTransactionsByAmountRange,
  getTransactionHistoryByUserId,
  getSentTransactions,
  getReceivedTransactions,
  getBifurcatedTransactionSummary,
  getRecentTransactions,
  getLedgerTransactionHistory,
  getAllLedgerTransactionHistory,
  getTransactionSession
};

export default transactionService;
