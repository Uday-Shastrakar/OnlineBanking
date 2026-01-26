package com.bank.transaction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    
    private String transactionId;
    
    private Long sourceAccountId;
    
    private Long destinationAccountId;
    
    private BigDecimal amount;
    
    private String currency;
    
    private String status;
    
    private String description;
    
    private Instant createdAt;
    
    private Instant updatedAt;
    
    private String requestId;
    
    public static TransactionResponse from(com.bank.transaction.model.Transaction transaction) {
        return TransactionResponse.builder()
                .transactionId(transaction.getId() != null ? String.valueOf(transaction.getId()) : null)
                .sourceAccountId(transaction.getSenderAccountNumber())
                .destinationAccountId(transaction.getReceiverAccountNumber())
                .amount(transaction.getDebitAmount())
                .currency(null)
                .status(transaction.getStatus())
                .description(transaction.getDescription())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .requestId(null)
                .build();
    }
}
