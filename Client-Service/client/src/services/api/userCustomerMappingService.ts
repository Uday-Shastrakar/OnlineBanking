import api from "../api";
import { ApiResponse } from "../api";

// User-Customer Mapping DTOs
export interface UserCustomerMapping {
  mappingId: number;
  userId: number;
  customerId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMappingRequest {
  userId: number;
  customerId: number;
}

export interface MappingResponse {
  success: boolean;
  message: string;
  mapping?: UserCustomerMapping;
}

// User-Customer Mapping API Service
export const userCustomerMappingService = {
  // Create mapping between user and customer
  createMapping: async (mappingData: CreateMappingRequest): Promise<UserCustomerMapping> => {
    const response = await api.post<UserCustomerMapping>('user-customer-mapping/create', mappingData);
    return response.data;
  },

  // Get mapping by user ID
  getMappingByUserId: async (userId: number): Promise<UserCustomerMapping | null> => {
    const response = await api.get<UserCustomerMapping>(`user-customer-mapping/user/${userId}`);
    return response.data;
  },

  // Get mapping by customer ID
  getMappingByCustomerId: async (customerId: number): Promise<UserCustomerMapping | null> => {
    const response = await api.get<UserCustomerMapping>(`user-customer-mapping/customer/${customerId}`);
    return response.data;
  },

  // Get all mappings for a user
  getAllMappingsForUser: async (userId: number): Promise<UserCustomerMapping[]> => {
    const response = await api.get<UserCustomerMapping[]>(`user-customer-mapping/user/${userId}/all`);
    return response.data;
  },

  // Get all mappings for a customer
  getAllMappingsForCustomer: async (customerId: number): Promise<UserCustomerMapping[]> => {
    const response = await api.get<UserCustomerMapping[]>(`user-customer-mapping/customer/${customerId}/all`);
    return response.data;
  },

  // Update mapping status
  updateMappingStatus: async (mappingId: number, status: string): Promise<UserCustomerMapping> => {
    const response = await api.put<UserCustomerMapping>(`user-customer-mapping/${mappingId}/status`, {
      status
    });
    return response.data;
  },

  // Delete mapping
  deleteMapping: async (mappingId: number): Promise<void> => {
    await api.delete(`user-customer-mapping/${mappingId}`);
  },

  // Delete mapping by user and customer
  deleteMappingByUserAndCustomer: async (userId: number, customerId: number): Promise<void> => {
    await api.delete(`user-customer-mapping/user/${userId}/customer/${customerId}`);
  },

  // Get customer ID for current user
  getCustomerIdForCurrentUser: async (): Promise<number | null> => {
    const response = await api.get<number>('user-customer-mapping/current/customer-id');
    return response.data;
  },

  // Get user ID for customer
  getUserIdForCustomer: async (customerId: number): Promise<number | null> => {
    const response = await api.get<number>(`user-customer-mapping/customer/${customerId}/user-id`);
    return response.data;
  },

  // Verify if user has access to customer
  verifyUserCustomerAccess: async (userId: number, customerId: number): Promise<boolean> => {
    const response = await api.get<boolean>(`user-customer-mapping/verify/${userId}/${customerId}`);
    return response.data;
  }
};
