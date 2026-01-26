import api, { ApiResponse } from "./api";

// Email Service API
export interface OtpRequest {
  toEmail: string;
  otp: string;
}

export interface AgreementData {
  effectiveDate: string;
  voiceOverArtistName: string;
  voiceOverArtistAddress: string;
  voiceOverArtistPAN: string;
  voiceOverArtistGST: string;
  companyName: string;
  companyRepresentativeName: string;
  companyRepresentativeDesignation: string;
  companyRepresentativeEmail: string;
  projectTitle: string;
  recordings: RecordingDetails[];
}

export interface RecordingDetails {
  numberOfRecordings: string;
  projectTitle: string;
  language: string;
  voiceoverArtist: string;
  scriptBy: string;
  duration: string;
}

export interface EmailTemplate {
  templateId: string;
  templateName: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface EmailRequest {
  toEmail: string;
  subject: string;
  body: string;
  attachments?: File[];
  templateId?: string;
  templateVariables?: Record<string, string>;
}

// Send OTP Email
export const sendOtpEmail = async (otpRequest: OtpRequest): Promise<string> => {
  try {
    const response = await api.post<string>('/email/send-otp', otpRequest);
    return response.data;
  } catch (error: any) {
    console.error("Error sending OTP email:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to send OTP email");
  }
};

// Generate PDF Document
export const generatePdf = async (agreementData: AgreementData): Promise<Blob> => {
  try {
    const response = await api.post<Blob>('/document/generate', agreementData, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to generate PDF");
  }
};

// Send Email with PDF Attachment
export const sendEmailWithPdf = async (agreementData: AgreementData): Promise<string> => {
  try {
    const response = await api.post<string>('/document/send-email', agreementData);
    return response.data;
  } catch (error: any) {
    console.error("Error sending email with PDF:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to send email with PDF");
  }
};

// Send Custom Email
export const sendEmail = async (emailRequest: EmailRequest): Promise<string> => {
  try {
    const response = await api.post<string>('/email/send', emailRequest);
    return response.data;
  } catch (error: any) {
    console.error("Error sending email:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to send email");
  }
};

// Send Bulk Email
export const sendBulkEmail = async (emailRequests: EmailRequest[]): Promise<string> => {
  try {
    const response = await api.post<string>('/email/send-bulk', emailRequests);
    return response.data;
  } catch (error: any) {
    console.error("Error sending bulk email:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to send bulk email");
  }
};

// Get Email Templates
export const getEmailTemplates = async (): Promise<EmailTemplate[]> => {
  try {
    const response = await api.get<EmailTemplate[]>('/email/templates');
    return response.data;
  } catch (error: any) {
    console.error("Error fetching email templates:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch email templates");
  }
};

// Create Email Template
export const createEmailTemplate = async (template: EmailTemplate): Promise<EmailTemplate> => {
  try {
    const response = await api.post<EmailTemplate>('/email/templates', template);
    return response.data;
  } catch (error: any) {
    console.error("Error creating email template:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to create email template");
  }
};

// Update Email Template
export const updateEmailTemplate = async (templateId: string, template: EmailTemplate): Promise<EmailTemplate> => {
  try {
    const response = await api.put<EmailTemplate>(`/email/templates/${templateId}`, template);
    return response.data;
  } catch (error: any) {
    console.error("Error updating email template:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to update email template");
  }
};

// Delete Email Template
export const deleteEmailTemplate = async (templateId: string): Promise<void> => {
  try {
    await api.delete(`/email/templates/${templateId}`);
  } catch (error: any) {
    console.error("Error deleting email template:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to delete email template");
  }
};

// Send Account Statement Email
export const sendAccountStatement = async (userId: number, accountNumber: string, startDate: string, endDate: string): Promise<string> => {
  try {
    const response = await api.post<string>('/email/account-statement', {
      userId,
      accountNumber,
      startDate,
      endDate
    });
    return response.data;
  } catch (error: any) {
    console.error("Error sending account statement:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to send account statement");
  }
};

// Send Transaction Confirmation Email
export const sendTransactionConfirmation = async (transactionId: number, email: string): Promise<string> => {
  try {
    const response = await api.post<string>('/email/transaction-confirmation', {
      transactionId,
      email
    });
    return response.data;
  } catch (error: any) {
    console.error("Error sending transaction confirmation:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to send transaction confirmation");
  }
};

// Send Welcome Email
export const sendWelcomeEmail = async (userId: number, email: string): Promise<string> => {
  try {
    const response = await api.post<string>('/email/welcome', {
      userId,
      email
    });
    return response.data;
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    throw new Error(error.response?.data?.message || error.message || "Failed to send welcome email");
  }
};
