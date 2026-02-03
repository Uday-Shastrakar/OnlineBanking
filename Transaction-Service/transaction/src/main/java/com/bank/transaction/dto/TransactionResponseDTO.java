package com.bank.transaction.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class TransactionResponseDTO {
    private String transactionId;
    private Long sourceAccountId;
    private Long destinationAccountId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String description;
    private Instant createdAt;

    // Default constructor
    public TransactionResponseDTO() {}

    // All args constructor
    public TransactionResponseDTO(String transactionId, Long sourceAccountId, Long destinationAccountId, BigDecimal amount, String currency, String status, String description, Instant createdAt) {
        this.transactionId = transactionId;
        this.sourceAccountId = sourceAccountId;
        this.destinationAccountId = destinationAccountId;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.description = description;
        this.createdAt = createdAt;
    }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String transactionId;
        private Long sourceAccountId;
        private Long destinationAccountId;
        private BigDecimal amount;
        private String currency;
        private String status;
        private String description;
        private Instant createdAt;

        public Builder transactionId(String transactionId) {
            this.transactionId = transactionId;
            return this;
        }

        public Builder sourceAccountId(Long sourceAccountId) {
            this.sourceAccountId = sourceAccountId;
            return this;
        }

        public Builder destinationAccountId(Long destinationAccountId) {
            this.destinationAccountId = destinationAccountId;
            return this;
        }

        public Builder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public Builder currency(String currency) {
            this.currency = currency;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder createdAt(Instant createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public TransactionResponseDTO build() {
            return new TransactionResponseDTO(transactionId, sourceAccountId, destinationAccountId, amount, currency, status, description, createdAt);
        }
    }

    // Getters and Setters
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public Long getSourceAccountId() { return sourceAccountId; }
    public void setSourceAccountId(Long sourceAccountId) { this.sourceAccountId = sourceAccountId; }

    public Long getDestinationAccountId() { return destinationAccountId; }
    public void setDestinationAccountId(Long destinationAccountId) { this.destinationAccountId = destinationAccountId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
