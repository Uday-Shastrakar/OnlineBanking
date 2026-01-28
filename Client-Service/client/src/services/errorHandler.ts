import { AxiosError } from 'axios';

export interface ErrorHandlerConfig {
    showNotification?: boolean;
    logToConsole?: boolean;
    redirectToLogin?: boolean;
    customMessage?: string;
}

/**
 * Centralized error handler for the banking application
 * Provides consistent error handling across all API calls
 */
export class ErrorHandler {
    private static instance: ErrorHandler;
    private errorCallbacks: Map<string, (error: any) => void> = new Map();

    private constructor() {}

    public static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }

    /**
     * Register a callback for specific error types
     */
    public registerErrorCallback(errorType: string, callback: (error: any) => void): void {
        this.errorCallbacks.set(errorType, callback);
    }

    /**
     * Handle API errors with banking-grade error management
     */
    public handleApiError(error: any, config: ErrorHandlerConfig = {}): void {
        const {
            showNotification = true,
            logToConsole = true,
            redirectToLogin = false,
            customMessage
        } = config;

        // Log error to console in development
        if (logToConsole || process.env.NODE_ENV === 'development') {
            console.error('API Error:', error);
        }

        // Handle different error types
        if (this.isAxiosError(error)) {
            this.handleAxiosError(error, { showNotification, redirectToLogin, customMessage });
        } else {
            this.handleGenericError(error, { showNotification, customMessage });
        }

        // Trigger registered callbacks
        const errorType = this.getErrorType(error);
        const callback = this.errorCallbacks.get(errorType);
        if (callback) {
            callback(error);
        }
    }

    private isAxiosError(error: any): error is AxiosError {
        return error && error.isAxiosError;
    }

    private handleAxiosError(error: AxiosError, config: Partial<ErrorHandlerConfig>): void {
        const { showNotification = true, redirectToLogin = false, customMessage } = config;

        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const data = error.response.data;

            switch (status) {
                case 401:
                    this.handleUnauthorizedError(customMessage);
                    if (redirectToLogin) {
                        this.redirectToLogin();
                    }
                    break;

                case 403:
                    this.handleForbiddenError(customMessage);
                    break;

                case 404:
                    this.handleNotFoundError(customMessage);
                    break;

                case 409:
                    this.handleConflictError(customMessage);
                    break;

                case 422:
                    this.handleValidationError(data, customMessage);
                    break;

                case 429:
                    this.handleRateLimitError(customMessage);
                    break;

                case 500:
                case 502:
                case 503:
                case 504:
                    this.handleServerError(status, customMessage);
                    break;

                default:
                    this.handleGenericApiError(status, data, customMessage);
            }
        } else if (error.request) {
            // Request was made but no response received
            this.handleNetworkError(customMessage);
        } else {
            // Something happened in setting up the request
            this.handleRequestSetupError(error, customMessage);
        }

        if (showNotification) {
            this.showErrorNotification(customMessage || 'An error occurred. Please try again.');
        }
    }

    private handleGenericError(error: any, config: Partial<ErrorHandlerConfig>): void {
        const { showNotification = true, customMessage } = config;

        console.error('Generic Error:', error);

        if (showNotification) {
            this.showErrorNotification(customMessage || 'An unexpected error occurred.');
        }
    }

    private handleUnauthorizedError(customMessage?: string): void {
        const message = customMessage || 'Your session has expired. Please log in again.';
        this.showErrorNotification(message, 'warning');
    }

    private handleConflictError(customMessage?: string): void {
        const message = customMessage || 'Username already exists. Please choose a different username.';
        this.showErrorNotification(message, 'warning');
    }

    private handleForbiddenError(customMessage?: string): void {
        const message = customMessage || 'You do not have permission to perform this action.';
        this.showErrorNotification(message, 'error');
    }

    private handleNotFoundError(customMessage?: string): void {
        const message = customMessage || 'The requested resource was not found.';
        this.showErrorNotification(message, 'error');
    }

    private handleValidationError(data: any, customMessage?: string): void {
        const message = customMessage || data?.message || 'Invalid data provided.';
        this.showErrorNotification(message, 'error');
    }

    private handleRateLimitError(customMessage?: string): void {
        const message = customMessage || 'Too many requests. Please try again later.';
        this.showErrorNotification(message, 'warning');
    }

    private handleServerError(status: number, customMessage?: string): void {
        const message = customMessage || 'Server error occurred. Please try again later.';
        this.showErrorNotification(message, 'error');
    }

    private handleGenericApiError(status: number, data: any, customMessage?: string): void {
        const message = customMessage || data?.message || `Request failed with status ${status}.`;
        this.showErrorNotification(message, 'error');
    }

    private handleNetworkError(customMessage?: string): void {
        const message = customMessage || 'Network error. Please check your connection.';
        this.showErrorNotification(message, 'error');
    }

    private handleRequestSetupError(error: any, customMessage?: string): void {
        const message = customMessage || 'Request setup failed. Please try again.';
        this.showErrorNotification(message, 'error');
    }

    private getErrorType(error: any): string {
        if (this.isAxiosError(error)) {
            if (error.response) {
                return `HTTP_${error.response.status}`;
            } else if (error.request) {
                return 'NETWORK_ERROR';
            }
        }
        return 'GENERIC_ERROR';
    }

    private showErrorNotification(message: string, severity: 'error' | 'warning' | 'info' = 'error'): void {
        // This would integrate with your notification system
        // For now, using alert as fallback
        console.error(`[${severity.toUpperCase()}] ${message}`);
        
        // In a real implementation, you would use a toast/notification library
        // Example: toast.error(message);
        alert(message);
    }

    private redirectToLogin(): void {
        window.location.href = '/login';
    }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Export convenience function for direct usage
export const handleApiError = (error: any, config?: ErrorHandlerConfig): void => {
    errorHandler.handleApiError(error, config);
};
