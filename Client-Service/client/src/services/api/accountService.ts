import api from "../api";
import { ApiResponse } from "../api";

// Account DTOs
export interface AccountCommandDto {
  accountNumber?: string;
  accountType: string;
  balance: number;
  status: string;
  customerId?: number;
  userId?: number;
}

export interface AccountQueryDto {
  accountId: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  status: string;
  customerId?: number;
  userId?: number;
}

export interface AccountManagerDTO {
  accountManagerId: string;
  name: string;
  email: string;
  department: string;
}

export interface CombineAccountDetailsDTO {
  senderAccount: AccountQueryDto;
  receiverAccount: AccountQueryDto;
}

export interface UpdateAccountDetails {
  accountId: string;
  accountType?: string;
  status?: string;
}

// Account API Service
export const accountService = {
  // Create new account
  createAccount: async (accountData: AccountCommandDto): Promise<AccountQueryDto> => {
    const response = await api.post<AccountQueryDto>('account/create-account', accountData);
    return response.data;
  },

  // Create account manager
  createAccountManager: async (managerData: AccountManagerDTO): Promise<AccountManagerDTO> => {
    const response = await api.post<AccountManagerDTO>('account/create-account-manager', managerData);
    return response.data;
  },

  // Get account details for transfer
  getAccountDetails: async (userId: number, receiverAccountNumber: number): Promise<CombineAccountDetailsDTO> => {
    const response = await api.get<CombineAccountDetailsDTO>('account/get-details', {
      params: { userId, receiverAccountNumber }
    });
    return response.data;
  },

  // Update account details
  updateAccount: async (updateData: UpdateAccountDetails): Promise<string> => {
    const response = await api.put<string>('account/update-details', updateData);
    return response.data;
  },

  // Debit account
  debitAccount: async (accountId: string, amount: number): Promise<string> => {
    const response = await api.post<string>('account/debit', null, {
      params: { accountId, amount }
    });
    return response.data;
  },

  // Credit account
  creditAccount: async (accountId: string, amount: number): Promise<string> => {
    const response = await api.post<string>('account/credit', null, {
      params: { accountId, amount }
    });
    return response.data;
  },

  // Get all accounts for a user
  getAllAccounts: async (userId: number): Promise<AccountQueryDto[]> => {
    const response = await api.get<AccountQueryDto[]>('account/getall', {
      params: { userId }
    });
    return response.data;
  },

  // Get all accounts for a customer (banking-grade model)
  getAccountsByCustomerId: async (customerId: number): Promise<AccountQueryDto[]> => {
    const response = await api.get<AccountQueryDto[]>('account/getall', {
      params: { customerId }
    });
    return response.data;
  }
};
