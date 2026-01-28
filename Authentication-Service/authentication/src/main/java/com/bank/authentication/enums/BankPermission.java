package com.bank.authentication.enums;

/**
 * BANKING SYSTEM PERMISSIONS MATRIX
 * 
 * Fine-grained permissions following banking compliance standards
 * Each permission represents a specific actionable capability
 */
public enum BankPermission {
    
    // ==================== CUSTOMER_USER PERMISSIONS ====================
    
    /**
     * CUSTOMER_USER: Can login to internet banking
     */
    CUSTOMER_LOGIN("PERMISSION_CUSTOMER_LOGIN", "Login to internet banking"),
    
    /**
     * CUSTOMER_USER: Can view own account balances
     */
    CUSTOMER_VIEW_BALANCE("PERMISSION_CUSTOMER_VIEW_BALANCE", "View own account balances"),
    
    /**
     * CUSTOMER_USER: Can view own transaction history
     */
    CUSTOMER_VIEW_TRANSACTIONS("PERMISSION_CUSTOMER_VIEW_TRANSACTIONS", "View own transaction history"),
    
    /**
     * CUSTOMER_USER: Can transfer money between own accounts
     */
    CUSTOMER_TRANSFER_OWN("PERMISSION_CUSTOMER_TRANSFER_OWN", "Transfer money between own accounts"),
    
    /**
     * CUSTOMER_USER: Can transfer to other customers
     */
    CUSTOMER_TRANSFER_EXTERNAL("PERMISSION_CUSTOMER_TRANSFER_EXTERNAL", "Transfer money to other customers"),
    
    /**
     * CUSTOMER_USER: Can update limited profile data
     */
    CUSTOMER_UPDATE_PROFILE("PERMISSION_CUSTOMER_UPDATE_PROFILE", "Update limited profile data"),
    
    // ==================== BANK_STAFF PERMISSIONS ====================
    
    /**
     * BANK_STAFF: Can login to internal portal
     */
    STAFF_LOGIN("PERMISSION_STAFF_LOGIN", "Login to internal bank portal"),
    
    /**
     * BANK_STAFF: Can view customer profiles (read-only)
     */
    STAFF_VIEW_CUSTOMER_PROFILE("PERMISSION_STAFF_VIEW_CUSTOMER_PROFILE", "View customer profiles (read-only)"),
    
    /**
     * BANK_STAFF: Can view account metadata (no balances)
     */
    STAFF_VIEW_ACCOUNT_METADATA("PERMISSION_STAFF_VIEW_ACCOUNT_METADATA", "View account metadata (no balances)"),
    
    /**
     * BANK_STAFF: Can assist customers operationally
     */
    STAFF_CUSTOMER_ASSISTANCE("PERMISSION_STAFF_CUSTOMER_ASSISTANCE", "Provide customer assistance"),
    
    /**
     * BANK_STAFF: Can view limited audit logs
     */
    STAFF_VIEW_LIMITED_AUDIT("PERMISSION_STAFF_VIEW_LIMITED_AUDIT", "View limited audit logs"),
    
    // ==================== ADMIN PERMISSIONS ====================
    
    /**
     * ADMIN: Can login to admin portal
     */
    ADMIN_LOGIN("PERMISSION_ADMIN_LOGIN", "Login to admin portal"),
    
    /**
     * ADMIN: Can manage system users
     */
    ADMIN_MANAGE_USERS("PERMISSION_ADMIN_MANAGE_USERS", "Manage system users"),
    
    /**
     * ADMIN: Can block/unblock accounts
     */
    ADMIN_BLOCK_ACCOUNTS("PERMISSION_ADMIN_BLOCK_ACCOUNTS", "Block/unblock accounts"),
    
    /**
     * ADMIN: Can view system metrics
     */
    ADMIN_VIEW_METRICS("PERMISSION_ADMIN_VIEW_METRICS", "View system metrics"),
    
    /**
     * ADMIN: Can access full audit logs
     */
    ADMIN_ACCESS_AUDIT("PERMISSION_ADMIN_ACCESS_AUDIT", "Access full audit logs"),
    
    /**
     * ADMIN: Can manage system configuration
     */
    ADMIN_MANAGE_CONFIG("PERMISSION_ADMIN_MANAGE_CONFIG", "Manage system configuration"),
    
    /**
     * ADMIN: Can force password reset
     */
    ADMIN_FORCE_PASSWORD_RESET("PERMISSION_ADMIN_FORCE_PASSWORD_RESET", "Force password reset"),
    
    /**
     * ADMIN: Can view all customer data
     */
    ADMIN_VIEW_ALL_CUSTOMERS("PERMISSION_ADMIN_VIEW_ALL_CUSTOMERS", "View all customer data"),
    
    // ==================== AUDITOR PERMISSIONS ====================
    
    /**
     * AUDITOR: Can login to audit portal
     */
    AUDITOR_LOGIN("PERMISSION_AUDITOR_LOGIN", "Login to audit portal"),
    
    /**
     * AUDITOR: Can view all audit logs
     */
    AUDITOR_VIEW_AUDIT_LOGS("PERMISSION_AUDITOR_VIEW_AUDIT_LOGS", "View all audit logs"),
    
    /**
     * AUDITOR: Can trace transactions
     */
    AUDITOR_TRACE_TRANSACTIONS("PERMISSION_AUDITOR_TRACE_TRANSACTIONS", "Trace transactions"),
    
    /**
     * AUDITOR: Can export compliance reports
     */
    AUDITOR_EXPORT_REPORTS("PERMISSION_AUDITOR_EXPORT_REPORTS", "Export compliance reports"),
    
    /**
     * AUDITOR: Can investigate incidents
     */
    AUDITOR_INVESTIGATE("PERMISSION_AUDITOR_INVESTIGATE", "Investigate incidents"),
    
    // ==================== SYSTEM PERMISSIONS ====================
    
    /**
     * SYSTEM: Can authenticate service-to-service
     */
    SYSTEM_SERVICE_AUTH("PERMISSION_SYSTEM_SERVICE_AUTH", "Service-to-service authentication"),
    
    /**
     * SYSTEM: Can publish events to Kafka
     */
    SYSTEM_PUBLISH_EVENTS("PERMISSION_SYSTEM_PUBLISH_EVENTS", "Publish events to Kafka"),
    
    /**
     * SYSTEM: Can consume audit events
     */
    SYSTEM_CONSUME_AUDIT("PERMISSION_SYSTEM_CONSUME_AUDIT", "Consume audit events"),
    
    /**
     * SYSTEM: Can perform scheduled tasks
     */
    SYSTEM_SCHEDULED_TASKS("PERMISSION_SYSTEM_SCHEDULED_TASKS", "Perform scheduled tasks");
    
    private final String authority;
    private final String description;
    
    BankPermission(String authority, String description) {
        this.authority = authority;
        this.description = description;
    }
    
    public String getAuthority() {
        return authority;
    }
    
    public String getDescription() {
        return description;
    }
}
