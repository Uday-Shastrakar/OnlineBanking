import api from "./api";
import { ApiResponse } from "./api";
import { CreateCustomerDto } from "../Types";

// Customer API Service - Banking-Grade Model
export const customerService = {
  // Create new customer
  createCustomer: async (customerData: CreateCustomerDto): Promise<CreateCustomerDto> => {
    const response = await api.post<CreateCustomerDto>('customer/create-customer', customerData);
    return response.data;
  },

  // Get customer by user ID (legacy support)
  getCustomerByUserId: async (userId: number): Promise<CreateCustomerDto> => {
    const response = await api.get<CreateCustomerDto>(`customer/${userId}`);
    return response.data;
  },

  // Get customer by customer ID (banking-grade model)
  getCustomerById: async (customerId: number): Promise<CreateCustomerDto> => {
    const response = await api.get<CreateCustomerDto>(`customer/single/${customerId}`);
    return response.data;
  },

  // Get all customers
  getAllCustomers: async (): Promise<CreateCustomerDto[]> => {
    const response = await api.get<CreateCustomerDto[]>('customer/getall');
    return response.data;
  },

  // Update customer
  updateCustomer: async (customerId: number, customerData: Partial<CreateCustomerDto>): Promise<CreateCustomerDto> => {
    const response = await api.put<CreateCustomerDto>(`customer/${customerId}/update`, customerData);
    return response.data;
  },

  // Delete customer
  deleteCustomer: async (customerId: number): Promise<void> => {
    await api.delete(`customer/${customerId}/delete`);
  },

  // Upload document for customer
  uploadDocument: async (customerId: number, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<string>(`customer/${customerId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get customer by current user (using user-customer mapping)
  getCurrentCustomer: async (): Promise<CreateCustomerDto | null> => {
    try {
      const response = await api.get<CreateCustomerDto>('customer/current');
      return response.data;
    } catch (error) {
      console.error('No customer found for current user:', error);
      return null;
    }
  },

  // Update KYC status
  updateKycStatus: async (customerId: number, kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'): Promise<CreateCustomerDto> => {
    const response = await api.put<CreateCustomerDto>(`customer/${customerId}/kyc-status`, {
      kycStatus
    });
    return response.data;
  },

  // Update customer status
  updateCustomerStatus: async (customerId: number, status: string): Promise<CreateCustomerDto> => {
    const response = await api.put<CreateCustomerDto>(`customer/${customerId}/status`, {
      status
    });
    return response.data;
  },

  // Search customers by name or email
  searchCustomers: async (searchTerm: string): Promise<CreateCustomerDto[]> => {
    const response = await api.get<CreateCustomerDto[]>('customer/search', {
      params: { searchTerm }
    });
    return response.data;
  },

  // Get customers by KYC status
  getCustomersByKycStatus: async (kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'): Promise<CreateCustomerDto[]> => {
    const response = await api.get<CreateCustomerDto[]>(`customer/kyc-status/${kycStatus}`);
    return response.data;
  },

  // Get customers by status
  getCustomersByStatus: async (status: string): Promise<CreateCustomerDto[]> => {
    const response = await api.get<CreateCustomerDto[]>(`customer/status/${status}`);
    return response.data;
  }
};

// Legacy function for backward compatibility
export const getCustomer = async (userId: number): Promise<CreateCustomerDto | null> => {
  try {
    const response = await api.get<CreateCustomerDto>(`customer/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer data:", error);
    throw new Error("Error fetching customer data. Please try again.");
  }
};
