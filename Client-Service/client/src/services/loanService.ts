import api, { ApiResponse } from "./api";

// Loan Service API (Custom Enhancement)
export interface Loan {
  loanId: string;
  userId: number;
  accountId: number;
  loanType: 'PERSONAL' | 'HOME' | 'CAR' | 'EDUCATION' | 'BUSINESS';
  loanAmount: number;
  interestRate: number;
  tenure: number; // in months
  emi: number;
  totalInterest: number;
  totalAmount: number;
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'REJECTED' | 'CLOSED';
  appliedAt: string;
  approvedAt?: string;
  disbursedAt?: string;
  completedAt?: string;
  nextEmiDate?: string;
  remainingAmount: number;
  paidAmount: number;
  overdueAmount: number;
}

export interface LoanApplication {
  userId: number;
  accountId: number;
  loanType: 'PERSONAL' | 'HOME' | 'CAR' | 'EDUCATION' | 'BUSINESS';
  loanAmount: number;
  tenure: number;
  purpose: string;
  income: number;
  employmentType: 'SALARIED' | 'SELF_EMPLOYED' | 'BUSINESS';
  companyName?: string;
  monthlyIncome: number;
  existingEMIs: number;
  collateral?: string;
  documents?: File[];
}

export interface LoanRepayment {
  repaymentId: string;
  loanId: string;
  amount: number;
  emiNumber: number;
  paidAt: string;
  mode: 'AUTO_DEBIT' | 'CHEQUE' | 'CASH' | 'ONLINE';
  status: 'PAID' | 'PENDING' | 'BOUNCED';
  lateFee?: number;
}

export interface LoanEligibility {
  eligible: boolean;
  maxLoanAmount: number;
  minInterestRate: number;
  maxTenure: number;
  emi: number;
  reasons?: string[];
}

// Apply for Loan
export const applyForLoan = async (application: LoanApplication): Promise<Loan> => {
  try {
    const formData = new FormData();
    formData.append('userId', application.userId.toString());
    formData.append('accountId', application.accountId.toString());
    formData.append('loanType', application.loanType);
    formData.append('loanAmount', application.loanAmount.toString());
    formData.append('tenure', application.tenure.toString());
    formData.append('purpose', application.purpose);
    formData.append('income', application.income.toString());
    formData.append('employmentType', application.employmentType);
    formData.append('monthlyIncome', application.monthlyIncome.toString());
    formData.append('existingEMIs', application.existingEMIs.toString());
    
    if (application.companyName) {
      formData.append('companyName', application.companyName);
    }
    if (application.collateral) {
      formData.append('collateral', application.collateral);
    }
    if (application.documents) {
      application.documents.forEach((file, index) => {
        formData.append(`document${index}`, file);
      });
    }

    const response = await api.post<Loan>('/loans/apply', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error: any) {
    console.error("Error applying for loan:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to apply for loan");
  }
};

// Get User Loans
export const getUserLoans = async (userId: number): Promise<Loan[]> => {
  try {
    const response = await api.get<Loan[]>(`/loans?userId=${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching user loans:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch loans");
  }
};

// Get Loan Details
export const getLoanDetails = async (loanId: string): Promise<Loan> => {
  try {
    const response = await api.get<Loan>(`/loans/${loanId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching loan details:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch loan details");
  }
};

// Check Loan Eligibility
export const checkLoanEligibility = async (userId: number, loanType: string, loanAmount: number, tenure: number): Promise<LoanEligibility> => {
  try {
    const response = await api.post<LoanEligibility>('/loans/check-eligibility', {
      userId,
      loanType,
      loanAmount,
      tenure
    });
    return response.data;
  } catch (error: any) {
    console.error("Error checking loan eligibility:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to check loan eligibility");
  }
};

// Calculate EMI
export const calculateEMI = async (loanAmount: number, interestRate: number, tenure: number): Promise<{
  emi: number;
  totalInterest: number;
  totalAmount: number;
  amortizationSchedule: { month: number; emi: number; principal: number; interest: number; balance: number }[];
}> => {
  try {
    const response = await api.post<any>('/loans/calculate-emi', {
      loanAmount,
      interestRate,
      tenure
    });
    return response.data;
  } catch (error: any) {
    console.error("Error calculating EMI:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to calculate EMI");
  }
};

// Make Loan Repayment
export const makeLoanRepayment = async (loanId: string, amount: number, mode: 'AUTO_DEBIT' | 'CHEQUE' | 'CASH' | 'ONLINE'): Promise<LoanRepayment> => {
  try {
    const response = await api.post<LoanRepayment>(`/loans/${loanId}/repay`, {
      amount,
      mode
    });
    return response.data;
  } catch (error: any) {
    console.error("Error making loan repayment:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to make loan repayment");
  }
};

// Get Loan Repayments
export const getLoanRepayments = async (loanId: string): Promise<LoanRepayment[]> => {
  try {
    const response = await api.get<LoanRepayment[]>(`/loans/${loanId}/repayments`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching loan repayments:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch loan repayments");
  }
};

// Pre-calculate Loan Prepayment
export const calculatePrepayment = async (loanId: string, prepaymentAmount: number): Promise<{
  savings: number;
  newTenure: number;
  reducedEmi: number;
  foreclosureCharges: number;
}> => {
  try {
    const response = await api.post<any>(`/loans/${loanId}/prepayment-calculation`, {
      prepaymentAmount
    });
    return response.data;
  } catch (error: any) {
    console.error("Error calculating prepayment:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to calculate prepayment");
  }
};

// Make Loan Prepayment
export const makeLoanPrepayment = async (loanId: string, amount: number): Promise<void> => {
  try {
    await api.post(`/loans/${loanId}/prepay`, { amount });
  } catch (error: any) {
    console.error("Error making loan prepayment:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to make loan prepayment");
  }
};

// Get Loan Statement
export const getLoanStatement = async (loanId: string, startDate: string, endDate: string): Promise<Blob> => {
  try {
    const response = await api.get<Blob>(`/loans/${loanId}/statement?startDate=${startDate}&endDate=${endDate}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching loan statement:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch loan statement");
  }
};

// Get Loan Offers
export const getLoanOffers = async (userId: number): Promise<{
  loanType: string;
  maxAmount: number;
  interestRate: number;
  tenure: number;
  processingFee: number;
  specialOffers: string[];
  validUntil: string;
}[]> => {
  try {
    const response = await api.get<any[]>(`/loans/offers?userId=${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching loan offers:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch loan offers");
  }
};

// Foreclose Loan
export const forecloseLoan = async (loanId: string): Promise<void> => {
  try {
    await api.post(`/loans/${loanId}/foreclose`);
  } catch (error: any) {
    console.error("Error foreclosing loan:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to foreclose loan");
  }
};

// Get Loan Schedule
export const getLoanSchedule = async (loanId: string): Promise<{
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}[]> => {
  try {
    const response = await api.get<any[]>(`/loans/${loanId}/schedule`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching loan schedule:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch loan schedule");
  }
};

// Update Auto-debit Settings
export const updateAutoDebitSettings = async (loanId: string, accountId: number, enabled: boolean): Promise<void> => {
  try {
    await api.put(`/loans/${loanId}/auto-debit`, { accountId, enabled });
  } catch (error: any) {
    console.error("Error updating auto-debit settings:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to update auto-debit settings");
  }
};

// Get Loan Interest Certificate
export const getLoanInterestCertificate = async (loanId: string, financialYear: string): Promise<Blob> => {
  try {
    const response = await api.get<Blob>(`/loans/${loanId}/interest-certificate?financialYear=${financialYear}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching interest certificate:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch interest certificate");
  }
};

const loanService = {
  applyForLoan,
  getUserLoans,
  getLoanDetails,
  checkLoanEligibility,
  calculateEMI,
  makeLoanRepayment,
  getLoanRepayments,
  calculatePrepayment,
  makeLoanPrepayment,
  getLoanStatement,
  getLoanOffers,
  forecloseLoan,
  getLoanSchedule,
  updateAutoDebitSettings,
  getLoanInterestCertificate
};

export default loanService;
