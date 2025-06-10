import { CustomerRegisterForm , GetCustomer} from "../Types";
import api from "./api";

// API call for customer registration
export const register = async (registerForm: CustomerRegisterForm): Promise<CustomerRegisterForm> => {
    const response = await api.post<CustomerRegisterForm>('/users/customer', registerForm);
    return response.data;
};


// API call for fetching customer details by userId
export const getCustomer = async (userId: number): Promise<GetCustomer | null> => {
    try {
      const response = await api.get<GetCustomer>(`/customer-service/${userId}/get`);
      console.log(response);  // Can be removed in production
      return response.data;
    } catch (error) {
      console.error("Error fetching customer data:", error);
      throw new Error("Error fetching customer data. Please try again.");
    }
  };