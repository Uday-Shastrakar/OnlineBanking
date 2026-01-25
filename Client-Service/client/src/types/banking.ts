/**
 * Production-grade TypeScript interfaces for Banking Operations
 */

export type AccountType = 'SAVING' | 'BUSINESS' | 'CURRENT';
export type AccountStatus = 'ACTIVE' | 'BLOCKED';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'COMPENSATED';
export type AuditAction = 'LOGIN' | 'TRANSFER' | 'BLOCK' | 'PROFILE_UPDATE' | 'CUSTOMER_REGISTER';

export interface BankAccount {
    id: number;
    userId: number;
    accountNumber: string; // Will be masked in UI
    accountType: AccountType;
    balance: number;
    status: AccountStatus;
    version: number;
}

export interface Transaction {
    id: number;
    debitAmount: number;
    creditAmount: number;
    senderAccountNumber: string;
    receiverAccountNumber: string;
    transactionDateTime: string;
    description: string;
    status: TransactionStatus;
    correlationId?: string;
}

export interface AuditLog {
    id: number;
    timestamp: string;
    userId: string;
    action: AuditAction;
    status: string;
    correlationId: string;
    details?: string;
}

export interface UserSummary {
    userId: number;
    userName: string;
    email: string;
    role: 'ADMIN' | 'CUSTOMER' | 'USER';
    status: 'ACTIVE' | 'LOCKED';
}

export interface AdminMetrics {
    totalUsers: number;
    totalAccounts: number;
    totalTransactions: number;
    failedTransactions: number;
}

export interface TransferRequest {
    senderAccountId: number;
    receiverAccountNumber: string;
    amount: number;
    description?: string;
}
