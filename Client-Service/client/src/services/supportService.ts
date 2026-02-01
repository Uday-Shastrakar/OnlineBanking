import api, { ApiResponse } from "./api";

// Support Service API (Custom Enhancement)
export interface SupportTicket {
  ticketId: string;
  userId: number;
  subject: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolution?: string;
  attachments?: string[];
}

export interface SupportRequest {
  subject: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  attachments?: File[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  views: number;
  helpful: number;
  createdAt: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  views: number;
}

export interface ChatSession {
  sessionId: string;
  userId: number;
  agentId?: number;
  status: 'ACTIVE' | 'CLOSED';
  startTime: string;
  endTime?: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: number;
  senderType: 'USER' | 'AGENT';
  message: string;
  timestamp: string;
  read: boolean;
}

// Create Support Ticket
export const createSupportTicket = async (request: SupportRequest): Promise<SupportTicket> => {
  try {
    const formData = new FormData();
    formData.append('subject', request.subject);
    formData.append('description', request.description);
    formData.append('category', request.category);
    formData.append('priority', request.priority);

    if (request.attachments) {
      request.attachments.forEach((file, index) => {
        formData.append(`attachment${index}`, file);
      });
    }

    const response = await api.post<SupportTicket>('/support/tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error: any) {
    console.error("Error creating support ticket:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to create support ticket");
  }
};

// Get User Tickets
export const getUserTickets = async (userId: number): Promise<SupportTicket[]> => {
  try {
    const response = await api.get<SupportTicket[]>(`/support/tickets?userId=${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching user tickets:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch tickets");
  }
};

// Get Ticket Details
export const getTicketDetails = async (ticketId: string): Promise<SupportTicket> => {
  try {
    const response = await api.get<SupportTicket>(`/support/tickets/${ticketId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching ticket details:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch ticket details");
  }
};

// Update Ticket
export const updateTicket = async (ticketId: string, updates: Partial<SupportTicket>): Promise<SupportTicket> => {
  try {
    const response = await api.put<SupportTicket>(`/support/tickets/${ticketId}`, updates);
    return response.data;
  } catch (error: any) {
    console.error("Error updating ticket:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to update ticket");
  }
};

// Close Ticket
export const closeTicket = async (ticketId: string, rating?: number, feedback?: string): Promise<void> => {
  try {
    await api.post(`/support/tickets/${ticketId}/close`, { rating, feedback });
  } catch (error: any) {
    console.error("Error closing ticket:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to close ticket");
  }
};

// Get FAQs
export const getFAQs = async (category?: string): Promise<FAQ[]> => {
  try {
    const url = category ? `/support/faqs?category=${category}` : '/support/faqs';
    const response = await api.get<FAQ[]>(url);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching FAQs:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch FAQs");
  }
};

// Search FAQs
export const searchFAQs = async (query: string): Promise<FAQ[]> => {
  try {
    const response = await api.get<FAQ[]>(`/support/faqs/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error: any) {
    console.error("Error searching FAQs:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to search FAQs");
  }
};

// Get Knowledge Base Articles
export const getKnowledgeBaseArticles = async (category?: string): Promise<KnowledgeBaseArticle[]> => {
  try {
    const url = category ? `/support/knowledge-base?category=${category}` : '/support/knowledge-base';
    const response = await api.get<KnowledgeBaseArticle[]>(url);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching knowledge base articles:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch knowledge base articles");
  }
};

// Get Knowledge Base Article
export const getKnowledgeBaseArticle = async (articleId: string): Promise<KnowledgeBaseArticle> => {
  try {
    const response = await api.get<KnowledgeBaseArticle>(`/support/knowledge-base/${articleId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching knowledge base article:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch article");
  }
};

// Start Chat Session
export const startChatSession = async (userId: number): Promise<ChatSession> => {
  try {
    const response = await api.post<ChatSession>('/support/chat/start', { userId });
    return response.data;
  } catch (error: any) {
    console.error("Error starting chat session:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to start chat session");
  }
};

// Get Chat Sessions
export const getChatSessions = async (userId: number): Promise<ChatSession[]> => {
  try {
    const response = await api.get<ChatSession[]>(`/support/chat/sessions?userId=${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching chat sessions:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch chat sessions");
  }
};

// Get Chat Messages
export const getChatMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  try {
    const response = await api.get<ChatMessage[]>(`/support/chat/${sessionId}/messages`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching chat messages:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch chat messages");
  }
};

// Send Chat Message
export const sendChatMessage = async (sessionId: string, message: string): Promise<ChatMessage> => {
  try {
    const response = await api.post<ChatMessage>(`/support/chat/${sessionId}/messages`, { message });
    return response.data;
  } catch (error: any) {
    console.error("Error sending chat message:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to send chat message");
  }
};

// End Chat Session
export const endChatSession = async (sessionId: string): Promise<void> => {
  try {
    await api.post(`/support/chat/${sessionId}/end`);
  } catch (error: any) {
    console.error("Error ending chat session:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to end chat session");
  }
};

// Rate FAQ or Article
export const rateContent = async (contentId: string, contentType: 'FAQ' | 'ARTICLE', helpful: boolean): Promise<void> => {
  try {
    await api.post(`/support/${contentType.toLowerCase()}/${contentId}/rate`, { helpful });
  } catch (error: any) {
    console.error("Error rating content:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to rate content");
  }
};

// Get Support Categories
export const getSupportCategories = async (): Promise<string[]> => {
  try {
    const response = await api.get<string[]>('/support/categories');
    return response.data;
  } catch (error: any) {
    console.error("Error fetching support categories:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch support categories");
  }
};

const supportService = {
  createSupportTicket,
  getUserTickets,
  getTicketDetails,
  updateTicket,
  closeTicket,
  getFAQs,
  searchFAQs,
  getKnowledgeBaseArticles,
  getKnowledgeBaseArticle,
  startChatSession,
  getChatSessions,
  getChatMessages,
  sendChatMessage,
  endChatSession,
  rateContent,
  getSupportCategories
};

export default supportService;
