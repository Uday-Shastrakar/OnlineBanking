/**
 * BANKING USER TYPES - REAL BANKING MODEL
 * 
 * Core Banking Rule: User ≠ Customer ≠ Account
 * 
 * User = System login identity
 * Customer = Legal banking client
 * Account = Holds money, belongs to Customer
 * 
 * Users NEVER directly own money
 */

export enum BankUserRole {
  /**
   * 1️⃣ CUSTOMER
   * Internet / Mobile Banking User
   * 
   * Can login to banking application
   * Can view own accounts
   * Can transfer money
   * Can view transaction history
   * Can update limited profile data
   * 
   * ❌ Cannot access admin features
   * ❌ Cannot view other customers
   * ❌ Cannot access audit logs
   */
  CUSTOMER = 'CUSTOMER',

  /**
   * 2️⃣ BANK_STAFF
   * Internal Bank Employee
   * 
   * Can login to internal portal
   * Can view customer profiles (read-only)
   * Can assist customers operationally
   * 
   * ❌ Cannot transfer money
   * ❌ Cannot edit balances
   * ❌ Cannot access full audit logs
   */
  BANK_STAFF = 'BANK_STAFF',

  /**
   * 3️⃣ ADMIN
   * System Administrator
   * 
   * Can manage system users
   * Can block / unblock accounts
   * Can view system metrics
   * Can access audit logs
   * 
   * ❌ Cannot credit or debit money
   * ❌ Cannot modify transaction history
   * ❌ Cannot edit balances manually
   */
  ADMIN = 'ADMIN',

  /**
   * 4️⃣ AUDITOR
   * Compliance / Regulatory User
   * 
   * Can login to audit portal
   * Can view audit logs
   * Can trace transactions
   * Can export compliance reports
   * 
   * ❌ Cannot modify any data
   * ❌ Cannot perform operations
   * ❌ Cannot access customer UI
   */
  AUDITOR = 'AUDITOR',

  /**
   * 5️⃣ SYSTEM
   * Non-Human Internal User
   * 
   * Used by internal services (Kafka consumers, schedulers)
   * No UI login
   * All actions must be audited
   */
  SYSTEM = 'SYSTEM'
}

/**
 * BANKING PERMISSIONS MATRIX
 */
export enum BankPermission {
  // CUSTOMER_USER PERMISSIONS
  CUSTOMER_LOGIN = 'PERMISSION_CUSTOMER_LOGIN',
  CUSTOMER_VIEW_BALANCE = 'PERMISSION_CUSTOMER_VIEW_BALANCE',
  CUSTOMER_VIEW_TRANSACTIONS = 'PERMISSION_CUSTOMER_VIEW_TRANSACTIONS',
  CUSTOMER_TRANSFER_OWN = 'PERMISSION_CUSTOMER_TRANSFER_OWN',
  CUSTOMER_TRANSFER_EXTERNAL = 'PERMISSION_CUSTOMER_TRANSFER_EXTERNAL',
  CUSTOMER_UPDATE_PROFILE = 'PERMISSION_CUSTOMER_UPDATE_PROFILE',

  // BANK_STAFF PERMISSIONS
  STAFF_LOGIN = 'PERMISSION_STAFF_LOGIN',
  STAFF_VIEW_CUSTOMER_PROFILE = 'PERMISSION_STAFF_VIEW_CUSTOMER_PROFILE',
  STAFF_VIEW_ACCOUNT_METADATA = 'PERMISSION_STAFF_VIEW_ACCOUNT_METADATA',
  STAFF_CUSTOMER_ASSISTANCE = 'PERMISSION_STAFF_CUSTOMER_ASSISTANCE',
  STAFF_VIEW_LIMITED_AUDIT = 'PERMISSION_STAFF_VIEW_LIMITED_AUDIT',

  // ADMIN PERMISSIONS
  ADMIN_LOGIN = 'PERMISSION_ADMIN_LOGIN',
  ADMIN_MANAGE_USERS = 'PERMISSION_ADMIN_MANAGE_USERS',
  ADMIN_BLOCK_ACCOUNTS = 'PERMISSION_ADMIN_BLOCK_ACCOUNTS',
  ADMIN_VIEW_METRICS = 'PERMISSION_ADMIN_VIEW_METRICS',
  ADMIN_ACCESS_AUDIT = 'PERMISSION_ADMIN_ACCESS_AUDIT',
  ADMIN_MANAGE_CONFIG = 'PERMISSION_ADMIN_MANAGE_CONFIG',
  ADMIN_FORCE_PASSWORD_RESET = 'PERMISSION_ADMIN_FORCE_PASSWORD_RESET',
  ADMIN_VIEW_ALL_CUSTOMERS = 'PERMISSION_ADMIN_VIEW_ALL_CUSTOMERS',

  // AUDITOR PERMISSIONS
  AUDITOR_LOGIN = 'PERMISSION_AUDITOR_LOGIN',
  AUDITOR_VIEW_AUDIT_LOGS = 'PERMISSION_AUDITOR_VIEW_AUDIT_LOGS',
  AUDITOR_TRACE_TRANSACTIONS = 'PERMISSION_AUDITOR_TRACE_TRANSACTIONS',
  AUDITOR_EXPORT_REPORTS = 'PERMISSION_AUDITOR_EXPORT_REPORTS',
  AUDITOR_INVESTIGATE = 'PERMISSION_AUDITOR_INVESTIGATE',

  // SYSTEM PERMISSIONS
  SYSTEM_SERVICE_AUTH = 'PERMISSION_SYSTEM_SERVICE_AUTH',
  SYSTEM_PUBLISH_EVENTS = 'PERMISSION_SYSTEM_PUBLISH_EVENTS',
  SYSTEM_CONSUME_AUDIT = 'PERMISSION_SYSTEM_CONSUME_AUDIT',
  SYSTEM_SCHEDULED_TASKS = 'PERMISSION_SYSTEM_SCHEDULED_TASKS'
}

/**
 * ROLE-PERMISSION MAPPING
 */
export const ROLE_PERMISSIONS: Record<BankUserRole, BankPermission[]> = {
  [BankUserRole.CUSTOMER]: [
    BankPermission.CUSTOMER_LOGIN,
    BankPermission.CUSTOMER_VIEW_BALANCE,
    BankPermission.CUSTOMER_VIEW_TRANSACTIONS,
    BankPermission.CUSTOMER_TRANSFER_OWN,
    BankPermission.CUSTOMER_TRANSFER_EXTERNAL,
    BankPermission.CUSTOMER_UPDATE_PROFILE
  ],

  [BankUserRole.BANK_STAFF]: [
    BankPermission.STAFF_LOGIN,
    BankPermission.STAFF_VIEW_CUSTOMER_PROFILE,
    BankPermission.STAFF_VIEW_ACCOUNT_METADATA,
    BankPermission.STAFF_CUSTOMER_ASSISTANCE,
    BankPermission.STAFF_VIEW_LIMITED_AUDIT
  ],

  [BankUserRole.ADMIN]: [
    BankPermission.ADMIN_LOGIN,
    BankPermission.ADMIN_MANAGE_USERS,
    BankPermission.ADMIN_BLOCK_ACCOUNTS,
    BankPermission.ADMIN_VIEW_METRICS,
    BankPermission.ADMIN_ACCESS_AUDIT,
    BankPermission.ADMIN_MANAGE_CONFIG,
    BankPermission.ADMIN_FORCE_PASSWORD_RESET,
    BankPermission.ADMIN_VIEW_ALL_CUSTOMERS
  ],

  [BankUserRole.AUDITOR]: [
    BankPermission.AUDITOR_LOGIN,
    BankPermission.AUDITOR_VIEW_AUDIT_LOGS,
    BankPermission.AUDITOR_TRACE_TRANSACTIONS,
    BankPermission.AUDITOR_EXPORT_REPORTS,
    BankPermission.AUDITOR_INVESTIGATE
  ],

  [BankUserRole.SYSTEM]: [
    BankPermission.SYSTEM_SERVICE_AUTH,
    BankPermission.SYSTEM_PUBLISH_EVENTS,
    BankPermission.SYSTEM_CONSUME_AUDIT,
    BankPermission.SYSTEM_SCHEDULED_TASKS
  ]
};

/**
 * ROLE METADATA AND UTILITIES
 */
export const ROLE_METADATA = {
  [BankUserRole.CUSTOMER]: {
    name: 'Customer User',
    description: 'Internet/Mobile Banking User',
    canLoginToUI: true,
    canInitiateTransactions: true,
    hasAdministrativePrivileges: false,
    hasAuditAccess: false,
    canViewCustomerData: true,
    canModifyCustomerData: false,
    isInternalUser: false,
    isHumanUser: true,
    uiPath: '/customer',
    dashboardPath: '/dashboard'
  },

  [BankUserRole.BANK_STAFF]: {
    name: 'Bank Staff',
    description: 'Internal Bank Employee',
    canLoginToUI: true,
    canInitiateTransactions: false,
    hasAdministrativePrivileges: false,
    hasAuditAccess: false,
    canViewCustomerData: true,
    canModifyCustomerData: false,
    isInternalUser: true,
    isHumanUser: true,
    uiPath: '/staff',
    dashboardPath: '/staff/dashboard'
  },

  [BankUserRole.ADMIN]: {
    name: 'Administrator',
    description: 'System Administrator',
    canLoginToUI: true,
    canInitiateTransactions: false,
    hasAdministrativePrivileges: true,
    hasAuditAccess: true,
    canViewCustomerData: true,
    canModifyCustomerData: true,
    isInternalUser: true,
    isHumanUser: true,
    uiPath: '/admin',
    dashboardPath: '/admin/dashboard'
  },

  [BankUserRole.AUDITOR]: {
    name: 'Auditor',
    description: 'Compliance/Regulatory User',
    canLoginToUI: true,
    canInitiateTransactions: false,
    hasAdministrativePrivileges: false,
    hasAuditAccess: true,
    canViewCustomerData: false,
    canModifyCustomerData: false,
    isInternalUser: true,
    isHumanUser: true,
    uiPath: '/audit',
    dashboardPath: '/audit/dashboard'
  },

  [BankUserRole.SYSTEM]: {
    name: 'System',
    description: 'Internal System Service',
    canLoginToUI: false,
    canInitiateTransactions: false,
    hasAdministrativePrivileges: false,
    hasAuditAccess: false,
    canViewCustomerData: false,
    canModifyCustomerData: false,
    isInternalUser: true,
    isHumanUser: false,
    uiPath: null,
    dashboardPath: null
  }
};

/**
 * REQUIRED SUMMARY TABLE
 * 
 * User Type        | Login UI | Can Transact | Can Admin | Can Audit
 * ----------------|----------|--------------|------------|-----------
 * CUSTOMER_USER    |    ✅    |      ✅       |     ❌      |     ❌
 * BANK_STAFF       |    ✅    |      ❌       |     ❌      |     ❌
 * ADMIN            |    ✅    |      ❌       |     ✅      |     ✅
 * AUDITOR          |    ✅    |      ❌       |     ❌      |     ✅
 * SYSTEM           |    ❌    |      ❌       |     ❌      |     ❌
 */

export const USER_TYPE_SUMMARY = [
  {
    userType: 'CUSTOMER',
    loginUI: true,
    canTransact: true,
    canAdmin: false,
    canAudit: false
  },
  {
    userType: 'BANK_STAFF',
    loginUI: true,
    canTransact: false,
    canAdmin: false,
    canAudit: false
  },
  {
    userType: 'ADMIN',
    loginUI: true,
    canTransact: false,
    canAdmin: true,
    canAudit: true
  },
  {
    userType: 'AUDITOR',
    loginUI: true,
    canTransact: false,
    canAdmin: false,
    canAudit: true
  },
  {
    userType: 'SYSTEM',
    loginUI: false,
    canTransact: false,
    canAdmin: false,
    canAudit: false
  }
];

/**
 * UTILITY FUNCTIONS
 */
export class BankingRoleUtils {
  /**
   * Get permissions for a role
   */
  static getPermissionsForRole(role: BankUserRole): BankPermission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Check if role has specific permission
   */
  static hasPermission(role: BankUserRole, permission: BankPermission): boolean {
    return this.getPermissionsForRole(role).includes(permission);
  }

  /**
   * Check if role can login to UI
   */
  static canLoginToUI(role: BankUserRole): boolean {
    return ROLE_METADATA[role]?.canLoginToUI || false;
  }

  /**
   * Check if role can initiate transactions
   */
  static canInitiateTransactions(role: BankUserRole): boolean {
    return ROLE_METADATA[role]?.canInitiateTransactions || false;
  }

  /**
   * Check if role has administrative privileges
   */
  static hasAdministrativePrivileges(role: BankUserRole): boolean {
    return ROLE_METADATA[role]?.hasAdministrativePrivileges || false;
  }

  /**
   * Check if role has audit access
   */
  static hasAuditAccess(role: BankUserRole): boolean {
    return ROLE_METADATA[role]?.hasAuditAccess || false;
  }

  /**
   * Check if role is internal user
   */
  static isInternalUser(role: BankUserRole): boolean {
    return ROLE_METADATA[role]?.isInternalUser || false;
  }

  /**
   * Get UI path for role
   */
  static getUIPath(role: BankUserRole): string | null {
    return ROLE_METADATA[role]?.uiPath || null;
  }

  /**
   * Get dashboard path for role
   */
  static getDashboardPath(role: BankUserRole): string | null {
    return ROLE_METADATA[role]?.dashboardPath || null;
  }

  /**
   * Validate role-permission mapping integrity
   */
  static validateRolePermissionMapping(): boolean {
    // Ensure no role can both transfer money and modify balances
    const customerValid = !this.hasPermission(BankUserRole.CUSTOMER, BankPermission.ADMIN_MANAGE_CONFIG);
    const bankStaffValid = !this.hasPermission(BankUserRole.BANK_STAFF, BankPermission.CUSTOMER_TRANSFER_OWN);
    const adminValid = !this.hasPermission(BankUserRole.ADMIN, BankPermission.CUSTOMER_TRANSFER_EXTERNAL);
    const auditorValid = !this.hasPermission(BankUserRole.AUDITOR, BankPermission.ADMIN_MANAGE_USERS);

    return customerValid && bankStaffValid && adminValid && auditorValid;
  }
}
