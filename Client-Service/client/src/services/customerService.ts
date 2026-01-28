import { CustomerRegisterForm, GetCustomer } from "../Types";
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

  // API call for fetching customer details by userId
  getCustomer: async (userId: number): Promise<GetCustomer | null> => {
    try {
      const response = await api.get<GetCustomer>(`customer/${userId}`);
      console.log(response);  // Can be removed in production
      return response.data;
    } catch (error: any) {
      console.error("Error fetching customer data:", error);
      
      // Check if this is an admin user trying to access customer data
      const userRoles = JSON.parse(localStorage.getItem('roles') || '[]');
      const isAdmin = userRoles.includes('ADMIN');
      
      if (isAdmin) {
        console.log('Admin user accessing customer data - returning null instead of error');
        return null; // Return null for admin users instead of throwing error
      }
      
      throw new Error("Error fetching customer data. Please try again.");
    }
  },

  // Register new customer
  register: async (registerForm: CustomerRegisterForm): Promise<CustomerRegisterForm> => {
    const response = await api.post<CustomerRegisterForm>('users/customer', registerForm);
    return response.data;
  },

  // Upload customer document
  uploadDocument: async (customerId: number, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`customer/${customerId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};