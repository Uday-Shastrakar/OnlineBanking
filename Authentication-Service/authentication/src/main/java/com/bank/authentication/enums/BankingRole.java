package com.bank.authentication.enums;

public enum BankingRole {
    CUSTOMER("Customer Internet Banking User", "Access to personal banking operations"),
    BANK_STAFF("Bank Staff/Teller", "Access to customer service operations"),
    ADMIN("System Administrator", "Full system access and configuration"),
    AUDITOR("Read-only Audit Access", "Access to audit logs and reports");

    private final String displayName;
    private final String description;

    BankingRole(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public String getRoleName() {
        return this.name();
    }
}
