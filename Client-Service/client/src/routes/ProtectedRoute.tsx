import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('ADMIN' | 'CUSTOMER' | 'USER')[];
}

/**
 * Higher-Order Component to protect routes based on JWT existence and User Roles.
 * Ensures that Customers cannot access Admin pages and vice-versa.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const location = useLocation();

    const token = localStorage.getItem('authToken');
    const userRolesRaw = localStorage.getItem('roles');
    const userRoles: string[] = userRolesRaw ? JSON.parse(userRolesRaw) : [];

    // 1. Check for Authentication
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Check for Authorization (Role-based)
    if (allowedRoles && allowedRoles.length > 0) {
        const hasRequiredRole = allowedRoles.some((role) => userRoles.includes(role));

        if (!hasRequiredRole) {
            // Redirect to unauthorized or dashboard if access is denied
            console.warn(`Access denied for roles: ${userRoles}. Required: ${allowedRoles}`);
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
