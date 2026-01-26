import { useState, useCallback } from 'react';
import { handleApiError } from '../services/errorHandler';

interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface UseApiCallOptions {
    showLoading?: boolean;
    errorMessage?: string;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}

/**
 * Simple API call hook without JSX complications
 */
export const useApiCall = <T = any>(options: UseApiCallOptions = {}) => {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null
    });

    const {
        showLoading = true,
        errorMessage,
        onSuccess,
        onError
    } = options;

    const executeCall = useCallback(async (
        apiCall: () => Promise<T>,
        customOptions?: UseApiCallOptions
    ): Promise<T | null> => {
        const opts = { ...options, ...customOptions };

        try {
            // Set loading state
            if (opts.showLoading !== false) {
                setState(prev => ({ ...prev, loading: true, error: null }));
            }

            // Execute API call
            const result = await apiCall();

            // Update state with success
            setState({
                data: result,
                loading: false,
                error: null
            });

            // Call success callback
            if (opts.onSuccess) {
                opts.onSuccess(result);
            }

            return result;

        } catch (error: any) {
            // Handle error with centralized error handler
            handleApiError(error, {
                customMessage: opts.errorMessage || errorMessage,
                showNotification: true
            });

            // Update state with error
            setState(prev => ({
                ...prev,
                loading: false,
                error: opts.errorMessage || errorMessage || 'An error occurred'
            }));

            // Call error callback
            if (opts.onError) {
                opts.onError(error);
            }

            return null;
        }
    }, [options, errorMessage]);

    const reset = useCallback(() => {
        setState({
            data: null,
            loading: false,
            error: null
        });
    }, []);

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    return {
        ...state,
        executeCall,
        reset,
        clearError
    };
};

export default useApiCall;
