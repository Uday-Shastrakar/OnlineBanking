package com.bank.transaction.service;

import com.bank.transaction.model.Transaction;
import com.bank.transaction.session.UserSession;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface TransactionService {

    String fundTransfer(BigDecimal receiverAmount, Long receiverAccountNumber, String idempotencyKey);

    com.bank.transaction.dto.TransactionResponseDTO initiateTransfer(
            com.bank.transaction.dto.TransactionRequest request,
            String idempotencyKey);

    UserSession getSession();

    List<Transaction> getAllTransactions(Long accountNumber);

    Transaction getTransactionById(Long transactionId);

    List<Transaction> getTransactionsByStatus(String status);

    List<Transaction> getTransactionsByDateRange(Instant startDate, Instant endDate);

    List<Transaction> getTransactionsByAmountRange(BigDecimal minAmount, BigDecimal maxAmount);

    java.util.Map<String, Object> getTransactionMetrics();

    java.util.Map<String, Object> getFailedTransactionMetrics();

    List<Transaction> getTransactionHistoryByUserId(Long userId);

    boolean checkAccountServiceHealth();

    List<Transaction> getSentTransactions(Long userId);

    List<Transaction> getReceivedTransactions(Long userId);

    java.util.Map<String, Object> getBifurcatedTransactionSummary(Long userId);
}
