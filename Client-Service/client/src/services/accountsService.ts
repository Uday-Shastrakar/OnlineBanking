import api, { ApiResponse } from "./api";

// Account Management API Service
export interface Account {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  status: string;
  userId: number;
  version: number;
}

export interface AccountCommandDto {
  accountType: string;
  balance: number;
  status: string;
  userId: number;
}

export interface AccountManagerDTO {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface UpdateAccountDetails {
  accountId: number;
  accountType?: string;
  status?: string;
}

export interface CombineAccountDetailsDTO {
  senderAccount: Account;
  receiverAccount: Account;
}

// Create Account
export const createAccount = async (accountData: AccountCommandDto): Promise<Account> => {
  const response = await api.post<Account>('/account/create-account', accountData);
  return response.data;
};

// Create Account Manager
export const createAccountManager = async (accountManagerData: AccountManagerDTO): Promise<AccountManagerDTO> => {
  const response = await api.post<AccountManagerDTO>('/account/create-account-manager', accountManagerData);
  return response.data;
};

// Get Account Details
export const getAccountDetails = async (userId: number, receiverAccountNumber: number): Promise<CombineAccountDetailsDTO> => {
  const response = await api.get<CombineAccountDetailsDTO>(`/account/get-details?userId=${userId}&receiverAccountNumber=${receiverAccountNumber}`);
  return response.data;
};

// Update Account Details
export const updateAccountDetails = async (updateData: UpdateAccountDetails): Promise<string> => {
  const response = await api.put<string>('/account/update-details', updateData);
  return response.data;
};

// Debit Account
export const debitAccount = async (accountId: number, amount: number): Promise<string> => {
  const response = await api.post<string>(`/account/debit?accountId=${accountId}&amount=${amount}`);
  return response.data;
};

// Credit Account
export const creditAccount = async (accountId: number, amount: number): Promise<string> => {
  const response = await api.post<string>(`/account/credit?accountId=${accountId}&amount=${amount}`);
  return response.data;
};

// Get All Accounts (already implemented but adding here for completeness)
export const getAllAccounts = async (userId: number): Promise<Account[]> => {
  const response = await api.get<Account[]>(`/account/getall?userId=${userId}`);
  return response.data;
};
