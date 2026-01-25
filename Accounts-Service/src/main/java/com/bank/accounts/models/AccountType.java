package com.bank.accounts.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;


public enum AccountType {

    SAVING,
    CURRENT;



    public static AccountType fromString(String accountTypeStr) {
        for (AccountType accountType : AccountType.values()) {
            if (accountType.name().equalsIgnoreCase(accountTypeStr)) {
                return accountType;
            }
        }
        throw new IllegalArgumentException("Unknown account type: " + accountTypeStr);
    }

    }
