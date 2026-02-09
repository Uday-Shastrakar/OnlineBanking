package com.bank.transaction.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public class TransactionEvent {
    
    private Long id;
    private Long debitAmount;
    private Long creditAmount;
    private Long senderAccountNumber;
    private Long receiverAccountNumber;
    private Instant transactionDateTime;
    private String description;
    private String status;
    
    // Additional fields for audit
    private Long userId;
    private String userEmail;
    private String correlationId;
    private String eventType = "transaction-completed";
    
    public TransactionEvent() {}
    
    // Constructor from Transaction entity
    public TransactionEvent(com.bank.transaction.model.Transaction transaction, Long userId, String userEmail) {
        this.id = transaction.getId();
        this.debitAmount = transaction.getDebitAmount() != null ? transaction.getDebitAmount().longValue() : null;
        this.creditAmount = transaction.getCreditAmount() != null ? transaction.getCreditAmount().longValue() : null;
        this.senderAccountNumber = transaction.getSenderAccountNumber();
        this.receiverAccountNumber = transaction.getReceiverAccountNumber();
        this.transactionDateTime = transaction.getTransactionDateTime();
        this.description = transaction.getDescription();
        this.status = transaction.getStatus();
        this.userId = userId;
        this.userEmail = userEmail;
        this.correlationId = "TXN-" + transaction.getId() + "-" + System.currentTimeMillis();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getDebitAmount() { return debitAmount; }
    public void setDebitAmount(Long debitAmount) { this.debitAmount = debitAmount; }
    
    public Long getCreditAmount() { return creditAmount; }
    public void setCreditAmount(Long creditAmount) { this.creditAmount = creditAmount; }
    
    public Long getSenderAccountNumber() { return senderAccountNumber; }
    public void setSenderAccountNumber(Long senderAccountNumber) { this.senderAccountNumber = senderAccountNumber; }
    
    public Long getReceiverAccountNumber() { return receiverAccountNumber; }
    public void setReceiverAccountNumber(Long receiverAccountNumber) { this.receiverAccountNumber = receiverAccountNumber; }
    
    public Instant getTransactionDateTime() { return transactionDateTime; }
    public void setTransactionDateTime(Instant transactionDateTime) { this.transactionDateTime = transactionDateTime; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    @JsonProperty("createdBy")
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    
    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }
    
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
}
