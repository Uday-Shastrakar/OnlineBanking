import api, { ApiResponse } from "./api";

export interface AccountRequest {
  accountType: "SAVING" | "CURRENT" | "BUSINESS" | "STUDENT" | "SENIOR";
  initialDeposit: number;
  accountStatus?: "ACTIVE" | "INACTIVE" | "FROZEN";
}

export interface EnhancedRegistrationRequest {
  // User Information
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  
  // Customer Information
  gender: string;
  address: string;
  dateOfBirth: string;
  customerStatus?: string;
  
  // Account Information
  accounts: AccountRequest[];
  
  // Roles and Permissions
  roleNames?: string[];
  permissionNames?: string[];
}

export interface AccountType {
  type: string;
  description: string;
  minDeposit: number;
  maxDeposit: number;
}

// Enhanced Registration Service
export const enhancedRegistrationService = {
  // Register user with multiple accounts
  registerWithAccounts: async (registrationData: EnhancedRegistrationRequest): Promise<any> => {
    try {
      const response = await api.post('/users/register-with-accounts', registrationData);
      return response.data;
    } catch (error: any) {
      console.error("Enhanced registration failed:", error);
      throw new Error(error.response?.data?.message || error.message || "Registration failed");
    }
  },

  // Get available account types
  getAccountTypes: async (): Promise<AccountType[]> => {
    try {
      const response = await api.get('/users/account-types');
      return response.data;
    } catch (error: any) {
      console.error("Failed to get account types:", error);
      throw new Error(error.response?.data?.message || error.message || "Failed to get account types");
    }
  },

  // Validate account request
  validateAccountRequest: (account: AccountRequest, accountTypes: AccountType[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    const accountType = accountTypes.find(type => type.type === account.accountType);
    
    if (!accountType) {
      errors.push(`Invalid account type: ${account.accountType}`);
    } else {
      if (account.initialDeposit < accountType.minDeposit) {
        errors.push(`Minimum deposit for ${account.accountType} is ${accountType.minDeposit}`);
      }
      if (account.initialDeposit > accountType.maxDeposit) {
        errors.push(`Maximum deposit for ${account.accountType} is ${accountType.maxDeposit}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Helper function to create registration request
export const createRegistrationRequest = (userData: any, selectedAccounts: AccountRequest[]): EnhancedRegistrationRequest => {
  return {
    username: userData.username,
    password: userData.password,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    phoneNumber: userData.phoneNumber,
    gender: userData.gender || "Male",
    address: userData.address || "",
    dateOfBirth: userData.dateOfBirth || "",
    customerStatus: "Active",
    accounts: selectedAccounts,
    roleNames: ["CUSTOMER_USER"],
    permissionNames: ["PERMISSION_READ", "PERMISSION_WRITE"]
  };
};
