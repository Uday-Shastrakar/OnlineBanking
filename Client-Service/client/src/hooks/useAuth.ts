import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, validateToken, getTokenRemainingTime, getTokenExpiry } from '../services/authService';

interface AuthState {
    isAuthenticated: boolean;
    isTokenExpired: boolean;
    remainingTime: number;
    lastActivity: number;
}

interface UseAuthReturn extends AuthState {
    logout: () => void;
    refreshToken: () => void;
    updateActivity: () => void;
}

/**
 * Custom hook for centralized authentication management
 * Handles token validation, expiry, and session timeout
 */
export const useAuth = (): UseAuthReturn => {
    const navigate = useNavigate();
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        isTokenExpired: false,
        remainingTime: 0,
        lastActivity: Date.now()
    });

    // Update activity timestamp
    const updateActivity = useCallback(() => {
        setAuthState(prev => ({ ...prev, lastActivity: Date.now() }));
    }, []);

    // Centralized logout handler
    const handleLogout = useCallback(() => {
        logout();
        navigate('/login');
    }, [navigate]);

    // Check authentication status
    const checkAuthStatus = useCallback(() => {
        const isValid = validateToken();
        const isExpired = !isValid;
        const remaining = getTokenRemainingTime();
        
        setAuthState(prev => ({
            ...prev,
            isAuthenticated: isValid,
            isTokenExpired: isExpired,
            remainingTime: remaining
        }));

        return isValid;
    }, []);

    // Initialize authentication state
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    // Token expiry monitoring
    useEffect(() => {
        const interval = setInterval(() => {
            const isValid = checkAuthStatus();
            
            // Auto-logout if token is expired
            if (!isValid && authState.isAuthenticated) {
                handleLogout();
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [checkAuthStatus, handleLogout, authState.isAuthenticated]);

    // Session timeout monitoring (15 minutes of inactivity)
    useEffect(() => {
        const timeout = setTimeout(() => {
            const inactiveTime = Date.now() - authState.lastActivity;
            if (inactiveTime >= 15 * 60 * 1000) { // 15 minutes
                handleLogout();
            }
        }, 15 * 60 * 1000); // 15 minutes

        return () => clearTimeout(timeout);
    }, [authState.lastActivity, handleLogout]);

    return {
        ...authState,
        logout: handleLogout,
        refreshToken: checkAuthStatus,
        updateActivity
    };
};
