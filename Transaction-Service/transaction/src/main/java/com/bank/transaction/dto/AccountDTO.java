package com.bank.transaction.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AccountDTO {
    private Long id;
    private Long accountNumber;
    private BigDecimal balance;
    private String accountType;
    private String status;
    private Long userId;
}
