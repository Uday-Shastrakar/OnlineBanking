import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export interface UserCustomerMapping {
  mappingId: number;
  userId: number;
  customerId: number;
  relationshipType: 'PRIMARY' | 'JOINT' | 'VIEW_ONLY' | 'AUTHORIZED_SIGNATORY';
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMappingRequest {
  userId: number;
  customerId: number;
  relationshipType: UserCustomerMapping['relationshipType'];
}

class UserCustomerMappingService {
  // Create a new user-customer mapping
  async createMapping(request: CreateMappingRequest): Promise<UserCustomerMapping> {
    try {
      const response = await axios.post<UserCustomerMapping>(
        `${API_BASE_URL}/user-customer-mappings/create`,
        null,
        {
          params: request,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating user-customer mapping:', error);
      throw error;
    }
  }

  // Get all mappings for a user
  async getMappingsByUserId(userId: number): Promise<UserCustomerMapping[]> {
    try {
      const response = await axios.get<UserCustomerMapping[]>(
        `${API_BASE_URL}/user-customer-mappings/user/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting mappings by user ID:', error);
      throw error;
    }
  }

  // Get all mappings for a customer
  async getMappingsByCustomerId(customerId: number): Promise<UserCustomerMapping[]> {
    try {
      const response = await axios.get<UserCustomerMapping[]>(
        `${API_BASE_URL}/user-customer-mappings/customer/${customerId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting mappings by customer ID:', error);
      throw error;
    }
  }

  // Check if user has access to customer
  async checkAccess(userId: number, customerId: number): Promise<boolean> {
    try {
      const response = await axios.get<boolean>(
        `${API_BASE_URL}/user-customer-mappings/check-access`,
        {
          params: { userId, customerId },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error checking user access:', error);
      throw error;
    }
  }

  // Deactivate a mapping
  async deactivateMapping(mappingId: number): Promise<UserCustomerMapping> {
    try {
      const response = await axios.put<UserCustomerMapping>(
        `${API_BASE_URL}/user-customer-mappings/${mappingId}/deactivate`,
        null,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deactivating mapping:', error);
      throw error;
    }
  }

  // Get current user's accessible customers
  async getCurrentUserCustomers(): Promise<UserCustomerMapping[]> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not logged in');
      }
      return await this.getMappingsByUserId(userId);
    } catch (error) {
      console.error('Error getting current user customers:', error);
      throw error;
    }
  }

  // Helper method to get current user ID from token or localStorage
  private getCurrentUserId(): number | null {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      // Parse JWT token to get user ID (assuming it's stored in the token)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || null;
    } catch (error) {
      console.error('Error parsing user ID from token:', error);
      return null;
    }
  }

  // Check if current user can access specific customer
  async canAccessCustomer(customerId: number): Promise<boolean> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        return false;
      }
      return await this.checkAccess(userId, customerId);
    } catch (error) {
      console.error('Error checking customer access:', error);
      return false;
    }
  }
}

export default new UserCustomerMappingService();
