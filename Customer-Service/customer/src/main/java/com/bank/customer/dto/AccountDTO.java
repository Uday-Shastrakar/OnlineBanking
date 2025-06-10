package com.bank.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountDTO {

    private Long id;

    private Long userId;

    private Long customerId;

    private Long accountNumber;

    private String accountType;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String status;
}
