package com.bank.authentication.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Set;
import java.util.List;

@Getter
@Setter
public class EnhancedCustomerRegistrationDTO {
    // User Information
    private String username;
    private String password;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    
    // Customer Information
    private String gender;
    private String address;
    private String dateOfBirth;
    private String customerStatus;
    
    // Account Information
    private List<AccountRequestDTO> accounts;
    
    // Roles and Permissions
    private Set<String> roleNames;
    private Set<String> permissionNames;
    
    @Getter
    @Setter
    public static class AccountRequestDTO {
        private String accountType;  // SAVING, CURRENT, BUSINESS, STUDENT, SENIOR
        private BigDecimal initialDeposit;
        private String accountStatus;  // ACTIVE, INACTIVE, FROZEN
    }
}
