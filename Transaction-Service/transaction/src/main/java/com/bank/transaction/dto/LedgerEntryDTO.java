package com.bank.transaction.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class LedgerEntryDTO {
    
    private Long entryId;
    private Long transactionId;
    private Long accountId;
    private Long accountNumber;
    private String entryType; // CREDIT or DEBIT
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    private String status;
    private Instant timestamp;
    private String description;
    
    // Constructors
    public LedgerEntryDTO() {}
    
    public LedgerEntryDTO(Long entryId, Long transactionId, Long accountId, Long accountNumber,
                          String entryType, BigDecimal amount, BigDecimal balanceAfter,
                          String status, Instant timestamp, String description) {
        this.entryId = entryId;
        this.transactionId = transactionId;
        this.accountId = accountId;
        this.accountNumber = accountNumber;
        this.entryType = entryType;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
        this.status = status;
        this.timestamp = timestamp;
        this.description = description;
    }
    
    // Getters and Setters
    public Long getEntryId() { return entryId; }
    public void setEntryId(Long entryId) { this.entryId = entryId; }
    
    public Long getTransactionId() { return transactionId; }
    public void setTransactionId(Long transactionId) { this.transactionId = transactionId; }
    
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    
    public Long getAccountNumber() { return accountNumber; }
    public void setAccountNumber(Long accountNumber) { this.accountNumber = accountNumber; }
    
    public String getEntryType() { return entryType; }
    public void setEntryType(String entryType) { this.entryType = entryType; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public BigDecimal getBalanceAfter() { return balanceAfter; }
    public void setBalanceAfter(BigDecimal balanceAfter) { this.balanceAfter = balanceAfter; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    // Helper method to get credit amount (null if debit)
    public BigDecimal getCredit() {
        return "CREDIT".equals(entryType) ? amount : null;
    }
    
    // Helper method to get debit amount (null if credit)
    public BigDecimal getDebit() {
        return "DEBIT".equals(entryType) ? amount : null;
    }
}
