import api, { ApiResponse } from "./api";

// Card Service API (Custom Enhancement)
export interface BankCard {
  cardId: string;
  userId: number;
  accountId: number;
  cardNumber: string;
  cardType: 'DEBIT' | 'CREDIT';
  cardBrand: 'VISA' | 'MASTERCARD' | 'RUPAY';
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
  status: 'ACTIVE' | 'BLOCKED' | 'EXPIRED' | 'CANCELLED';
  dailyLimit: number;
  monthlyLimit: number;
  internationalUsage: boolean;
  onlineUsage: boolean;
  contactless: boolean;
  issuedAt: string;
  lastUsed?: string;
}

export interface CardRequest {
  accountId: number;
  cardType: 'DEBIT' | 'CREDIT';
  cardBrand: 'VISA' | 'MASTERCARD' | 'RUPAY';
  cardHolderName: string;
  dailyLimit: number;
  monthlyLimit: number;
  internationalUsage: boolean;
  onlineUsage: boolean;
  contactless: boolean;
}

export interface CardTransaction {
  transactionId: string;
  cardId: string;
  amount: number;
  currency: string;
  merchant: string;
  category: string;
  description: string;
  timestamp: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  location?: string;
  cardPresent: boolean;
}

export interface CardSettings {
  cardId: string;
  dailyLimit: number;
  monthlyLimit: number;
  internationalUsage: boolean;
  onlineUsage: boolean;
  contactless: boolean;
  notificationSettings: {
    transactionAlerts: boolean;
    dailyLimitAlerts: boolean;
    monthlyLimitAlerts: boolean;
    internationalUsageAlerts: boolean;
  };
}

// Request New Card
export const requestNewCard = async (cardRequest: CardRequest): Promise<BankCard> => {
  try {
    const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    const userId = userDetails?.userId;

    if (!userId) {
      throw new Error('User not logged in');
    }

    const response = await api.post<BankCard>('/cards/request', { ...cardRequest, userId });
    return response.data;
  } catch (error: any) {
    console.error("Error requesting new card:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to request new card");
  }
};

// Get User Cards
export const getUserCards = async (userId: number): Promise<BankCard[]> => {
  try {
    const response = await api.get<BankCard[]>(`/cards?userId=${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching user cards:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch cards");
  }
};

// Get Card Details
export const getCardDetails = async (cardId: string): Promise<BankCard> => {
  try {
    const response = await api.get<BankCard>(`/cards/${cardId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching card details:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch card details");
  }
};

// Block Card
export const blockCard = async (cardId: string, reason: string): Promise<void> => {
  try {
    await api.post(`/cards/${cardId}/block`, { reason });
  } catch (error: any) {
    console.error("Error blocking card:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to block card");
  }
};

// Unblock Card
export const unblockCard = async (cardId: string): Promise<void> => {
  try {
    await api.post(`/cards/${cardId}/unblock`);
  } catch (error: any) {
    console.error("Error unblocking card:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to unblock card");
  }
};

// Update Card Settings
export const updateCardSettings = async (cardId: string, settings: Partial<CardSettings>): Promise<CardSettings> => {
  try {
    const response = await api.put<CardSettings>(`/cards/${cardId}/settings`, settings);
    return response.data;
  } catch (error: any) {
    console.error("Error updating card settings:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to update card settings");
  }
};

// Get Card Transactions
export const getCardTransactions = async (cardId: string, startDate?: string, endDate?: string): Promise<CardTransaction[]> => {
  try {
    let url = `/cards/${cardId}/transactions`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await api.get<CardTransaction[]>(url);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching card transactions:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch card transactions");
  }
};

// Report Lost Card
export const reportLostCard = async (cardId: string, incidentDetails: {
  dateOfIncident: string;
  location: string;
  circumstances: string;
  policeReportFiled: boolean;
  policeReportNumber?: string;
}): Promise<void> => {
  try {
    await api.post(`/cards/${cardId}/report-lost`, incidentDetails);
  } catch (error: any) {
    console.error("Error reporting lost card:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to report lost card");
  }
};

// Request Card Replacement
export const requestCardReplacement = async (cardId: string, reason: string, urgent: boolean = false): Promise<BankCard> => {
  try {
    const response = await api.post<BankCard>(`/cards/${cardId}/replace`, { reason, urgent });
    return response.data;
  } catch (error: any) {
    console.error("Error requesting card replacement:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to request card replacement");
  }
};

// Activate Card
export const activateCard = async (cardId: string, activationDetails: {
  last4Digits: string;
  expiryDate: string;
  cvv: string;
}): Promise<void> => {
  try {
    await api.post(`/cards/${cardId}/activate`, activationDetails);
  } catch (error: any) {
    console.error("Error activating card:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to activate card");
  }
};

// Set PIN
export const setCardPIN = async (cardId: string, pin: string, confirmPin: string): Promise<void> => {
  try {
    await api.post(`/cards/${cardId}/set-pin`, { pin, confirmPin });
  } catch (error: any) {
    console.error("Error setting card PIN:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to set card PIN");
  }
};

// Change PIN
export const changeCardPIN = async (cardId: string, currentPin: string, newPin: string, confirmPin: string): Promise<void> => {
  try {
    await api.post(`/cards/${cardId}/change-pin`, { currentPin, newPin, confirmPin });
  } catch (error: any) {
    console.error("Error changing card PIN:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to change card PIN");
  }
};

// Get Card Limits
export const getCardLimits = async (cardId: string): Promise<{
  dailyLimit: number;
  monthlyLimit: number;
  dailySpent: number;
  monthlySpent: number;
  availableDaily: number;
  availableMonthly: number;
}> => {
  try {
    const response = await api.get<any>(`/cards/${cardId}/limits`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching card limits:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch card limits");
  }
};

// Update Card Limits
export const updateCardLimits = async (cardId: string, limits: {
  dailyLimit: number;
  monthlyLimit: number;
}): Promise<void> => {
  try {
    await api.put(`/cards/${cardId}/limits`, limits);
  } catch (error: any) {
    console.error("Error updating card limits:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to update card limits");
  }
};

// Get Card Usage Analytics
export const getCardUsageAnalytics = async (cardId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<{
  totalTransactions: number;
  totalAmount: number;
  averageAmount: number;
  topCategories: { category: string; amount: number; count: number }[];
  spendingTrend: { date: string; amount: number }[];
}> => {
  try {
    const response = await api.get<any>(`/cards/${cardId}/analytics?period=${period}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching card usage analytics:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch card usage analytics");
  }
};

// Cancel Card
export const cancelCard = async (cardId: string, reason: string): Promise<void> => {
  try {
    await api.post(`/cards/${cardId}/cancel`, { reason });
  } catch (error: any) {
    console.error("Error canceling card:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to cancel card");
  }
};

const cardService = {
  requestNewCard,
  getUserCards,
  getCardDetails,
  blockCard,
  unblockCard,
  updateCardSettings,
  getCardTransactions,
  reportLostCard,
  requestCardReplacement,
  activateCard,
  setCardPIN,
  changeCardPIN,
  getCardLimits,
  updateCardLimits,
  getCardUsageAnalytics,
  cancelCard
};

export default cardService;
