package com.bank.accounts.dto;

import com.bank.accounts.models.AccountType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountQueryDto {

    private Long id;

    private Long userId;

    private Long customerId;

    private Long accountNumber;

    private String accountType;

    private BigDecimal balance;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String status;


}
