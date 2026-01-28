import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthStorage from '../services/authStorage';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('ADMIN' | 'CUSTOMER_USER' | 'BANK_STAFF' | 'AUDITOR' | 'CUSTOMER' | 'USER')[];
}

/**
 * Higher-Order Component to protect routes based on JWT existence and User Roles.
 * Ensures banking-grade role-based access control:
 * - CUSTOMER_USER: Can access customer portal features
 * - BANK_STAFF: Can access banking operations
 * - ADMIN: Can access admin dashboard and system management
 * - AUDITOR: Can access audit and compliance features
 * - CUSTOMER/USER: Legacy support for backward compatibility
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const location = useLocation();

    // Use centralized authentication storage
    const isAuthenticated = AuthStorage.isAuthenticated();
    const userRoles = AuthStorage.getRoles();

    console.log('ProtectedRoute Debug:', {
        isAuthenticated,
        userRoles,
        allowedRoles,
        currentPath: location.pathname
    });

    // 1. Check for Authentication
    if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Check for Authorization (Role-based)
    if (allowedRoles && allowedRoles.length > 0) {
        const hasRequiredRole = allowedRoles.some((role) => userRoles.includes(role));

        if (!hasRequiredRole) {
            // Redirect to unauthorized or dashboard if access is denied
            console.warn(`Access denied for roles: ${userRoles}. Required: ${allowedRoles}`);
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
