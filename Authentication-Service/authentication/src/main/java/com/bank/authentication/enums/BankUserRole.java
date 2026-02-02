package com.bank.authentication.enums;

/**
 * CORE BANKING USER ROLES
 * 
 * Real banking system follows strict separation:
 * User ≠ Customer ≠ Account
 * 
 * User = System login identity
 * Customer = Legal banking client
 * Account = Holds money, belongs to Customer
 * 
 * Users NEVER directly own money
 */
public enum BankUserRole {

    /**
     * 1️⃣ CUSTOMER
     * Internet / Mobile Banking User
     * 
     * Can login to banking application
     * Can view own accounts
     * Can transfer money (own accounts only)
     * Can view transaction history (own accounts only)
     * Can update limited profile data
     * 
     * ❌ Cannot access admin features
     * ❌ Cannot view other customers
     * ❌ Cannot access audit logs
     */
    CUSTOMER("ROLE_CUSTOMER", "Customer Internet Banking User"),

    /**
     * 2️⃣ BANK_STAFF
     * Internal Bank Employee
     * 
     * Can login to internal portal
     * Can view customer profiles (read-only)
     * Can assist customers operationally
     * Can view account metadata (no balances)
     * 
     * ❌ Cannot transfer money
     * ❌ Cannot edit balances
     * ❌ Cannot access full audit logs
     */
    BANK_STAFF("ROLE_BANK_STAFF", "Bank Staff Employee"),

    /**
     * 3️⃣ ADMIN
     * System Administrator
     * 
     * Can manage system users
     * Can block / unblock accounts
     * Can view system metrics
     * Can access audit logs
     * Can manage system configuration
     * 
     * ❌ Cannot credit or debit money
     * ❌ Cannot modify transaction history
     * ❌ Cannot edit balances manually
     */
    ADMIN("ROLE_ADMIN", "System Administrator"),

    /**
     * 4️⃣ AUDITOR
     * Compliance / Regulatory User
     * 
     * Can login to audit portal
     * Can view audit logs
     * Can trace transactions
     * Can export compliance reports
     * Can investigate incidents
     * 
     * ❌ Cannot modify any data
     * ❌ Cannot perform operations
     * ❌ Cannot access customer UI
     */
    AUDITOR("ROLE_AUDITOR", "Compliance Auditor"),

    /**
     * 5️⃣ SYSTEM
     * Non-Human Internal User
     * 
     * Used by internal services (Kafka consumers, schedulers)
     * No UI login
     * All actions must be audited
     * Service-to-service authentication
     * 
     * ❌ Cannot login via UI
     * ❌ Cannot perform user operations
     * ❌ Cannot access customer data directly
     */
    SYSTEM("ROLE_SYSTEM", "Internal System Service");

    private final String authority;
    private final String description;

    BankUserRole(String authority, String description) {
        this.authority = authority;
        this.description = description;
    }

    public String getAuthority() {
        return authority;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Check if role can login to UI
     */
    public boolean canLoginToUI() {
        return this != SYSTEM;
    }

    /**
     * Check if role can initiate transactions
     */
    public boolean canInitiateTransactions() {
        return this == CUSTOMER;
    }

    /**
     * Check if role has administrative privileges
     */
    public boolean hasAdministrativePrivileges() {
        return this == ADMIN;
    }

    /**
     * Check if role has audit access
     */
    public boolean hasAuditAccess() {
        return this == ADMIN || this == AUDITOR;
    }

    /**
     * Check if role can view customer data
     */
    public boolean canViewCustomerData() {
        return this == CUSTOMER || this == BANK_STAFF || this == ADMIN;
    }

    /**
     * Check if role can modify customer data
     */
    public boolean canModifyCustomerData() {
        return this == ADMIN; // Only admin can modify, staff is read-only
    }

    /**
     * Check if role is internal (non-customer)
     */
    public boolean isInternalUser() {
        return this == BANK_STAFF || this == ADMIN || this == AUDITOR || this == SYSTEM;
    }

    /**
     * Check if role is human user
     */
    public boolean isHumanUser() {
        return this != SYSTEM;
    }
}
