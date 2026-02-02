package com.bank.authentication.security;

import com.bank.authentication.enums.BankPermission;
import com.bank.authentication.enums.BankUserRole;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * BANKING ROLE-PERMISSION MAPPING
 * 
 * Defines which permissions each role has in the banking system
 * Following strict banking compliance and segregation of duties
 */
@Component
public class BankingRolePermissionMapper {

    private final Map<BankUserRole, Set<BankPermission>> rolePermissionMap;

    public BankingRolePermissionMapper() {
        this.rolePermissionMap = initializeRolePermissions();
    }

    /**
     * Initialize role-permission mapping following banking standards
     */
    private Map<BankUserRole, Set<BankPermission>> initializeRolePermissions() {
        Map<BankUserRole, Set<BankPermission>> map = new EnumMap<>(BankUserRole.class);

        // ==================== CUSTOMER PERMISSIONS ====================
        Set<BankPermission> customerPermissions = EnumSet.of(
                BankPermission.CUSTOMER_LOGIN,
                BankPermission.CUSTOMER_VIEW_BALANCE,
                BankPermission.CUSTOMER_VIEW_TRANSACTIONS,
                BankPermission.CUSTOMER_TRANSFER_OWN,
                BankPermission.CUSTOMER_TRANSFER_EXTERNAL,
                BankPermission.CUSTOMER_UPDATE_PROFILE);
        map.put(BankUserRole.CUSTOMER, customerPermissions);

        // ==================== BANK_STAFF PERMISSIONS ====================
        Set<BankPermission> bankStaffPermissions = EnumSet.of(
                BankPermission.STAFF_LOGIN,
                BankPermission.STAFF_VIEW_CUSTOMER_PROFILE,
                BankPermission.STAFF_VIEW_ACCOUNT_METADATA,
                BankPermission.STAFF_CUSTOMER_ASSISTANCE,
                BankPermission.STAFF_VIEW_LIMITED_AUDIT);
        map.put(BankUserRole.BANK_STAFF, bankStaffPermissions);

        // ==================== ADMIN PERMISSIONS ====================
        Set<BankPermission> adminPermissions = EnumSet.of(
                BankPermission.ADMIN_LOGIN,
                BankPermission.ADMIN_MANAGE_USERS,
                BankPermission.ADMIN_BLOCK_ACCOUNTS,
                BankPermission.ADMIN_VIEW_METRICS,
                BankPermission.ADMIN_ACCESS_AUDIT,
                BankPermission.ADMIN_MANAGE_CONFIG,
                BankPermission.ADMIN_FORCE_PASSWORD_RESET,
                BankPermission.ADMIN_VIEW_ALL_CUSTOMERS);
        map.put(BankUserRole.ADMIN, adminPermissions);

        // ==================== AUDITOR PERMISSIONS ====================
        Set<BankPermission> auditorPermissions = EnumSet.of(
                BankPermission.AUDITOR_LOGIN,
                BankPermission.AUDITOR_VIEW_AUDIT_LOGS,
                BankPermission.AUDITOR_TRACE_TRANSACTIONS,
                BankPermission.AUDITOR_EXPORT_REPORTS,
                BankPermission.AUDITOR_INVESTIGATE);
        map.put(BankUserRole.AUDITOR, auditorPermissions);

        // ==================== SYSTEM PERMISSIONS ====================
        Set<BankPermission> systemPermissions = EnumSet.of(
                BankPermission.SYSTEM_SERVICE_AUTH,
                BankPermission.SYSTEM_PUBLISH_EVENTS,
                BankPermission.SYSTEM_CONSUME_AUDIT,
                BankPermission.SYSTEM_SCHEDULED_TASKS);
        map.put(BankUserRole.SYSTEM, systemPermissions);

        return map;
    }

    /**
     * Get permissions for a specific role
     */
    public Set<BankPermission> getPermissionsForRole(BankUserRole role) {
        return rolePermissionMap.getOrDefault(role, Collections.emptySet());
    }

    /**
     * Get permission authorities for Spring Security
     */
    public Set<String> getPermissionAuthorities(BankUserRole role) {
        return getPermissionsForRole(role).stream()
                .map(BankPermission::getAuthority)
                .collect(Collectors.toSet());
    }

    /**
     * Get role authorities for Spring Security
     */
    public Set<String> getRoleAuthorities(BankUserRole role) {
        return Set.of(role.getAuthority());
    }

    /**
     * Check if role has specific permission
     */
    public boolean hasPermission(BankUserRole role, BankPermission permission) {
        return getPermissionsForRole(role).contains(permission);
    }

    /**
     * Check if role can login to UI
     */
    public boolean canLoginToUI(BankUserRole role) {
        return role.canLoginToUI();
    }

    /**
     * Check if role can initiate transactions
     */
    public boolean canInitiateTransactions(BankUserRole role) {
        return role.canInitiateTransactions();
    }

    /**
     * Check if role has administrative privileges
     */
    public boolean hasAdministrativePrivileges(BankUserRole role) {
        return role.hasAdministrativePrivileges();
    }

    /**
     * Check if role has audit access
     */
    public boolean hasAuditAccess(BankUserRole role) {
        return role.hasAuditAccess();
    }

    /**
     * Check if role can view customer data
     */
    public boolean canViewCustomerData(BankUserRole role) {
        return role.canViewCustomerData();
    }

    /**
     * Check if role can modify customer data
     */
    public boolean canModifyCustomerData(BankUserRole role) {
        return role.canModifyCustomerData();
    }

    /**
     * Get all permissions as string authorities
     */
    public Set<String> getAllPermissionAuthorities() {
        return Arrays.stream(BankPermission.values())
                .map(BankPermission::getAuthority)
                .collect(Collectors.toSet());
    }

    /**
     * Get all role authorities
     */
    public Set<String> getAllRoleAuthorities() {
        return Arrays.stream(BankUserRole.values())
                .map(BankUserRole::getAuthority)
                .collect(Collectors.toSet());
    }

    /**
     * Validate role-permission mapping integrity
     */
    public boolean validateRolePermissionMapping() {
        // Ensure no role can both transfer money and modify balances
        boolean customerValid = !hasPermission(BankUserRole.CUSTOMER, BankPermission.ADMIN_MANAGE_CONFIG);
        boolean bankStaffValid = !hasPermission(BankUserRole.BANK_STAFF, BankPermission.CUSTOMER_TRANSFER_OWN);
        boolean adminValid = !hasPermission(BankUserRole.ADMIN, BankPermission.CUSTOMER_TRANSFER_EXTERNAL);
        boolean auditorValid = !hasPermission(BankUserRole.AUDITOR, BankPermission.ADMIN_MANAGE_USERS);

        return customerValid && bankStaffValid && adminValid && auditorValid;
    }
}
