/**
 * Centralized authentication storage service
 * Provides secure access to authentication data with validation
 * Reduces localStorage exposure and prevents role tampering
 */

interface AuthData {
    token: string | null;
    user: {
        userId: number | null;
        userName: string | null;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string | null;
    } | null;
    roles: string[];
    permissions: string[];
    loginTime: number | null;
}

class AuthStorage {
    private static readonly TOKEN_KEY = 'authToken';
    private static readonly USER_KEY = 'userDetails';
    private static readonly ROLES_KEY = 'roles';
    private static readonly PERMISSIONS_KEY = 'permissions';
    private static readonly LOGIN_TIME_KEY = 'loginTime';

    private static readonly BANKING_ROLES = ['ADMIN', 'CUSTOMER', 'BANK_STAFF', 'AUDITOR'];
    private static readonly LEGACY_ROLES = ['USER'];

    /**
     * Store authentication data securely
     */
    public static setAuthData(token: string, user: any, authorities: string[]): void {
        try {
            // Store token
            localStorage.setItem(this.TOKEN_KEY, token);

            // Store user data
            const userData = {
                userId: user.userId || null,
                userName: user.userName || null,
                email: user.email || null,
                firstName: user.firstName || null,
                lastName: user.lastName || null,
                phoneNumber: user.phoneNumber || null
            };
            localStorage.setItem(this.USER_KEY, JSON.stringify(userData));

            // Filter and store roles
            const validRoles = authorities.filter((role: string) =>
                this.BANKING_ROLES.includes(role) || this.LEGACY_ROLES.includes(role)
            );
            localStorage.setItem(this.ROLES_KEY, JSON.stringify(validRoles));

            // Store permissions
            const permissions = authorities.filter((item: string) =>
                item.startsWith('PERMISSION_')
            );
            localStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify(permissions));

            // Store login time
            localStorage.setItem(this.LOGIN_TIME_KEY, Date.now().toString());

        } catch (error) {
            console.error('Error storing auth data:', error);
            this.clearAuthData();
        }
    }

    /**
     * Get authentication data with validation
     */
    public static getAuthData(): AuthData {
        try {
            const token = localStorage.getItem(this.TOKEN_KEY);
            const userStr = localStorage.getItem(this.USER_KEY);
            const rolesStr = localStorage.getItem(this.ROLES_KEY);
            const permissionsStr = localStorage.getItem(this.PERMISSIONS_KEY);
            const loginTimeStr = localStorage.getItem(this.LOGIN_TIME_KEY);

            return {
                token,
                user: userStr ? JSON.parse(userStr) : null,
                roles: rolesStr ? JSON.parse(rolesStr) : [],
                permissions: permissionsStr ? JSON.parse(permissionsStr) : [],
                loginTime: loginTimeStr ? parseInt(loginTimeStr) : null
            };
        } catch (error) {
            console.error('Error retrieving auth data:', error);
            return {
                token: null,
                user: null,
                roles: [],
                permissions: [],
                loginTime: null
            };
        }
    }

    /**
     * Get JWT token
     */
    public static getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Get user data
     */
    public static getUser(): AuthData['user'] {
        try {
            const userStr = localStorage.getItem(this.USER_KEY);
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error retrieving user data:', error);
            return null;
        }
    }

    /**
     * Get roles with validation
     */
    public static getRoles(): string[] {
        try {
            const rolesStr = localStorage.getItem(this.ROLES_KEY);
            const roles = rolesStr ? JSON.parse(rolesStr) : [];

            // Validate roles against allowed banking roles
            return roles.filter((role: string) =>
                this.BANKING_ROLES.includes(role) || this.LEGACY_ROLES.includes(role)
            );
        } catch (error) {
            console.error('Error retrieving roles:', error);
            return [];
        }
    }

    /**
     * Get permissions
     */
    public static getPermissions(): string[] {
        try {
            const permissionsStr = localStorage.getItem(this.PERMISSIONS_KEY);
            return permissionsStr ? JSON.parse(permissionsStr) : [];
        } catch (error) {
            console.error('Error retrieving permissions:', error);
            return [];
        }
    }

    /**
     * Check if user has specific role
     */
    public static hasRole(role: string): boolean {
        const roles = this.getRoles();
        return roles.includes(role);
    }

    /**
     * Check if user has any of the specified roles
     */
    public static hasAnyRole(roles: string[]): boolean {
        const userRoles = this.getRoles();
        return roles.some(role => userRoles.includes(role));
    }

    /**
     * Check if user has specific permission
     */
    public static hasPermission(permission: string): boolean {
        const permissions = this.getPermissions();
        return permissions.includes(permission);
    }

    /**
     * Check if user is authenticated
     */
    public static isAuthenticated(): boolean {
        const token = this.getToken();
        const user = this.getUser();

        console.log('AuthStorage.isAuthenticated() debug:', {
            token: token ? 'exists' : 'missing',
            user: user ? 'exists' : 'missing',
            tokenLength: token?.length,
            userId: user?.userId
        });

        if (!token || !user) {
            console.log('Authentication failed: missing token or user');
            return false;
        }

        // Basic token format validation
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.log('Authentication failed: invalid token format');
                return false;
            }

            // Check if token is expired
            const payload = JSON.parse(atob(parts[1]));
            const now = Date.now() / 1000;

            if (payload.exp && payload.exp < now) {
                console.log('Authentication failed: token expired');
                return false;
            }

            console.log('Authentication successful');
            return true;
        } catch (error) {
            console.error('Error validating token:', error);
            return false;
        }
    }

    /**
     * Get token expiry time
     */
    public static getTokenExpiry(): number | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp ? payload.exp * 1000 : null;
        } catch (error) {
            console.error('Error parsing token expiry:', error);
            return null;
        }
    }

    /**
     * Check if token is expired
     */
    public static isTokenExpired(): boolean {
        const expiry = this.getTokenExpiry();
        if (!expiry) return false;

        return Date.now() >= expiry;
    }

    /**
     * Get session duration in milliseconds
     */
    public static getSessionDuration(): number {
        const loginTime = localStorage.getItem(this.LOGIN_TIME_KEY);
        if (!loginTime) return 0;

        return Date.now() - parseInt(loginTime);
    }

    /**
     * Clear all authentication data
     */
    public static clearAuthData(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.ROLES_KEY);
        localStorage.removeItem(this.PERMISSIONS_KEY);
        localStorage.removeItem(this.LOGIN_TIME_KEY);
    }

    /**
     * Validate stored data integrity
     */
    public static validateStoredData(): boolean {
        try {
            const token = this.getToken();
            const user = this.getUser();
            const roles = this.getRoles();

            if (!token || !user) {
                return false;
            }

            // Validate user object structure
            if (!user.userId || !user.userName) {
                return false;
            }

            // Validate roles
            if (!Array.isArray(roles) || roles.length === 0) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error validating stored data:', error);
            return false;
        }
    }

    /**
     * Refresh authentication data validation
     */
    public static refreshValidation(): boolean {
        const isValid = this.validateStoredData();

        if (!isValid) {
            this.clearAuthData();
            return false;
        }

        // Check token expiry
        if (this.isTokenExpired()) {
            this.clearAuthData();
            return false;
        }

        return true;
    }
}

export default AuthStorage;
