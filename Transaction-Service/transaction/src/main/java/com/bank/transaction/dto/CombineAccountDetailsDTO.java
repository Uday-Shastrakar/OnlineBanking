package com.bank.transaction.dto;

import java.math.BigDecimal;

public class CombineAccountDetailsDTO {

    private Long senderAccountNumber;
    private BigDecimal senderAccountBalance;
    private Long senderAccountId;
    private Long receiverAccountNumber;
    private BigDecimal receiverAccountBalance;
    private Long receiverAccountId;

    // Default constructor
    public CombineAccountDetailsDTO() {}

    // All args constructor
    public CombineAccountDetailsDTO(Long senderAccountNumber, BigDecimal senderAccountBalance, Long senderAccountId, Long receiverAccountNumber, BigDecimal receiverAccountBalance, Long receiverAccountId) {
        this.senderAccountNumber = senderAccountNumber;
        this.senderAccountBalance = senderAccountBalance;
        this.senderAccountId = senderAccountId;
        this.receiverAccountNumber = receiverAccountNumber;
        this.receiverAccountBalance = receiverAccountBalance;
        this.receiverAccountId = receiverAccountId;
    }

    // Getters and Setters
    public Long getSenderAccountNumber() { return senderAccountNumber; }
    public void setSenderAccountNumber(Long senderAccountNumber) { this.senderAccountNumber = senderAccountNumber; }

    public BigDecimal getSenderAccountBalance() { return senderAccountBalance; }
    public void setSenderAccountBalance(BigDecimal senderAccountBalance) { this.senderAccountBalance = senderAccountBalance; }

    public Long getSenderAccountId() { return senderAccountId; }
    public void setSenderAccountId(Long senderAccountId) { this.senderAccountId = senderAccountId; }

    public Long getReceiverAccountNumber() { return receiverAccountNumber; }
    public void setReceiverAccountNumber(Long receiverAccountNumber) { this.receiverAccountNumber = receiverAccountNumber; }

    public BigDecimal getReceiverAccountBalance() { return receiverAccountBalance; }
    public void setReceiverAccountBalance(BigDecimal receiverAccountBalance) { this.receiverAccountBalance = receiverAccountBalance; }

    public Long getReceiverAccountId() { return receiverAccountId; }
    public void setReceiverAccountId(Long receiverAccountId) { this.receiverAccountId = receiverAccountId; }
}
