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

// Get Transaction Session (already implemented)
export const getTransactionSession = async (): Promise<UserSession> => {
  try {
    const response = await api.get<UserSession>('/transaction/session');
    return response.data;
  } catch (error: any) {
    console.error("Error fetching transaction session:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch transaction session");
  }
};

// Fund Transfer (already implemented)
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

// Get All Transactions (missing implementation)
export const getAllTransactions = async (accountNumber?: number): Promise<Transaction[]> => {
  try {
    const url = accountNumber ? `/transaction/getall?accountNumber=${accountNumber}` : '/transaction/getall';
    const response = await api.get<Transaction[]>(url);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch transactions");
  }
};

// Get Transaction by ID
export const getTransactionById = async (transactionId: number): Promise<Transaction> => {
  try {
    const response = await api.get<Transaction>(`/transaction/${transactionId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching transaction:", error);
    throw new Error(error.response?.data?.message || error.message || "Transaction not found");
  }
};

// Get Transactions by Status
export const getTransactionsByStatus = async (status: TransactionStatus): Promise<Transaction[]> => {
  try {
    const response = await api.get<Transaction[]>(`/transaction/by-status?status=${status}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching transactions by status:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch transactions");
  }
};

// Get Transactions by Date Range
export const getTransactionsByDateRange = async (startDate: string, endDate: string): Promise<Transaction[]> => {
  try {
    const response = await api.get<Transaction[]>(`/transaction/by-date?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching transactions by date range:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch transactions");
  }
};

// Get Transactions by Amount Range
export const getTransactionsByAmountRange = async (minAmount: number, maxAmount: number): Promise<Transaction[]> => {
  try {
    const response = await api.get<Transaction[]>(`/transaction/by-amount?minAmount=${minAmount}&maxAmount=${maxAmount}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching transactions by amount range:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch transactions");
  }
};
