import api from "../api";
import { ApiResponse } from "../api";

// Transaction DTOs
export interface Transaction {
  transactionId: string;
  sourceAccountId: number;
  destinationAccountId: number;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  requestId: string;
}

export interface TransactionRequest {
  sourceAccountId: number;
  destinationAccountId: number;
  amount: number;
  currency: string;
  description?: string;
}

export interface TransactionResponse {
  transactionId: string;
  sourceAccountId: number;
  destinationAccountId: number;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  requestId: string;
}

export interface UserSession {
  userId: number;
  username: string;
  roles: string[];
  sessionId: string;
}

export interface TransferRequest {
  receiverAmount: number;
  receiverAccountNumber: number;
  idempotencyKey?: string;
}

// Transaction API Service
export const transactionService = {
  // Get current user session (deprecated - will return 410 Gone)
  getSession: async (): Promise<string> => {
    try {
      const response = await api.get<string>('transaction/session');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 410) {
        throw new Error('Session endpoint deprecated. Use gateway authentication.');
      }
      throw error;
    }
  },

  // New transfer API with gateway headers
  initiateTransfer: async (transferData: TransactionRequest): Promise<TransactionResponse> => {
    const response = await api.post<TransactionResponse>('transaction/transfer', transferData, {
      headers: {
        'X-Request-ID': generateRequestId(),
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  // Legacy fund transfer (for backward compatibility)
  fundTransfer: async (transferData: TransferRequest): Promise<string> => {
    const response = await api.post<string>('transaction/transfer', null, {
      params: {
        receiverAmount: transferData.receiverAmount,
        receiverAccountNumber: transferData.receiverAccountNumber
      },
      headers: {
        'Idempotency-Key': transferData.idempotencyKey || generateIdempotencyKey(),
        'X-Request-ID': generateRequestId()
      }
    });
    return response.data;
  },

  // Get all transactions for an account
  getAllTransactions: async (accountNumber: number): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>('transaction/getall', {
      params: { accountNumber },
      headers: {
        'X-Request-ID': generateRequestId()
      }
    });
    return response.data;
  },

  // Get transaction history for customer (by customer ID)
  getTransactionHistoryByCustomerId: async (customerId: number): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>('transaction/getall', {
      params: { customerId },
      headers: {
        'X-Request-ID': generateRequestId()
      }
    });
    return response.data;
  },

  // Get transaction history for user (legacy support)
  getTransactionHistoryByUserId: async (userId: number): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>('transaction/getall', {
      params: { userId },
      headers: {
        'X-Request-ID': generateRequestId()
      }
    });
    return response.data;
  }
};

// Helper functions
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateIdempotencyKey(): string {
  return `idemp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
