package com.bank.transaction.service.serviceImpl;

import com.bank.transaction.dto.CombineAccountDetailsDTO;
import com.bank.transaction.exception.InsufficientBalanceException;
import com.bank.transaction.feignclient.AccountService;
import com.bank.transaction.model.Transaction;
import com.bank.transaction.repository.TransactionRepository;
import com.bank.transaction.service.TransactionService;
import com.bank.transaction.session.UserSession;
import com.bank.transaction.session.UserThreadLocalContext;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class TransactionServiceImpl implements TransactionService {

    @Autowired
    private AccountService accountService;

    @Autowired
    private com.bank.transaction.repository.IdempotencyKeyRepository idempotencyKeyRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public com.bank.transaction.dto.TransactionResponseDTO initiateTransfer(
            com.bank.transaction.dto.TransactionRequest request,
            String idempotencyKey) {
        UserSession userSession = UserThreadLocalContext.getUserSession();
        if (userSession == null) {
            throw new com.bank.transaction.exception.TransactionFailedException(
                    "Authentication required: Session not found. Please log in again.");
        }
        Long userId = userSession.userId();

        // 1. Idempotency Check
        if (idempotencyKey != null) {
            java.util.Optional<com.bank.transaction.model.IdempotencyKey> existingKey = idempotencyKeyRepository
                    .findByUserIdAndIdempotencyKey(userId, idempotencyKey);
            if (existingKey.isPresent()) {
                if ("PROCESSING".equals(existingKey.get().getStatus())) {
                    throw new RuntimeException("Transaction is already being processed.");
                }
                // In a real app, we might want to return the actual transaction record
                throw new com.bank.transaction.exception.TransactionFailedException(
                        "Duplicate request with idempotency key: " + idempotencyKey);
            }

            // Create Idempotency Record
            com.bank.transaction.model.IdempotencyKey newKey = new com.bank.transaction.model.IdempotencyKey();
            newKey.setUserId(userId);
            newKey.setIdempotencyKey(idempotencyKey);
            newKey.setStatus("PROCESSING");
            newKey.setCreatedAt(Instant.now());
            idempotencyKeyRepository.save(newKey);
        }

        try {
            // 2. Resolve Accounts
            com.bank.transaction.dto.AccountDTO senderAccount = accountService
                    .getAccountById(request.getSourceAccountId());

            // If the destinationAccountId is actually an account number (common in these
            // bank apps)
            com.bank.transaction.dto.AccountDTO receiverAccount;
            try {
                receiverAccount = accountService.getAccountByNumber(request.getDestinationAccountId());
            } catch (Exception e) {
                // If not found by number, try by ID as fallback
                receiverAccount = accountService.getAccountById(request.getDestinationAccountId());
            }

            // 3. Validate Balance
            if (senderAccount.getBalance().compareTo(request.getAmount()) < 0) {
                throw new InsufficientBalanceException(
                        "Insufficient balance in account " + senderAccount.getAccountNumber());
            }

            // 4. Create Transaction Record
            Transaction transaction = new Transaction();
            transaction.setDebitAmount(request.getAmount());
            transaction.setCreditAmount(request.getAmount());
            transaction.setSenderAccountNumber(senderAccount.getAccountNumber());
            transaction.setReceiverAccountNumber(receiverAccount.getAccountNumber());
            transaction.setTransactionDateTime(Instant.now());
            transaction.setDescription(request.getDescription());
            transaction.setStatus("PENDING");
            transaction.setCreatedAt(Instant.now());
            transaction.setUpdatedAt(Instant.now());
            transaction.setCreatedBy(userSession.email());
            transaction = transactionRepository.save(transaction);

            // 5. Execute Money Movement
            try {
                accountService.debitAccount(senderAccount.getId(), request.getAmount());
                accountService.creditAccount(receiverAccount.getId(), request.getAmount());

                transaction.setStatus("COMPLETED");
                transaction.setUpdatedAt(Instant.now());
                transactionRepository.save(transaction);

                // Publish Event
                try {
                    kafkaTemplate.send("transaction-completed", transaction);
                } catch (Exception ignore) {
                }

                // Update Idempotency
                if (idempotencyKey != null) {
                    com.bank.transaction.model.IdempotencyKey key = idempotencyKeyRepository
                            .findByUserIdAndIdempotencyKey(userId, idempotencyKey).get();
                    key.setStatus("COMPLETED");
                    key.setResponsePayload("COMPLETED:" + transaction.getId());
                    idempotencyKeyRepository.save(key);
                }

                return com.bank.transaction.dto.TransactionResponseDTO.builder()
                        .transactionId(transaction.getId().toString())
                        .sourceAccountId(request.getSourceAccountId())
                        .destinationAccountId(request.getDestinationAccountId())
                        .amount(request.getAmount())
                        .currency(request.getCurrency())
                        .status(transaction.getStatus())
                        .description(transaction.getDescription())
                        .createdAt(transaction.getCreatedAt())
                        .build();

            } catch (Exception e) {
                transaction.setStatus("FAILED");
                transaction.setDescription("Failed: " + e.getMessage());
                transaction.setUpdatedAt(Instant.now());
                transactionRepository.save(transaction);
                throw e;
            }

        } catch (Exception e) {
            // Update Idempotency on Failure
            if (idempotencyKey != null) {
                idempotencyKeyRepository.findByUserIdAndIdempotencyKey(userId, idempotencyKey).ifPresent(key -> {
                    key.setStatus("FAILED");
                    key.setResponsePayload("Error: " + e.getMessage());
                    idempotencyKeyRepository.save(key);
                });
            }
            throw e;
        }
    }

    @Override
    @Transactional
    public String fundTransfer(BigDecimal receiverAmount, Long receiverAccountNumber, String idempotencyKey) {
        UserSession userSession = UserThreadLocalContext.getUserSession();
        if (userSession == null) {
            throw new com.bank.transaction.exception.TransactionFailedException(
                    "Authentication required: Session not found. Please log in again.");
        }
        Long userId = userSession.userId();

        // Idempotency Check
        if (idempotencyKey != null) {
            java.util.Optional<com.bank.transaction.model.IdempotencyKey> existingKey = idempotencyKeyRepository
                    .findByUserIdAndIdempotencyKey(userId, idempotencyKey);
            if (existingKey.isPresent()) {
                if ("PROCESSING".equals(existingKey.get().getStatus())) {
                    throw new RuntimeException("Transaction is already being processed.");
                }
                return existingKey.get().getResponsePayload() != null ? existingKey.get().getResponsePayload()
                        : "Transaction already processed.";
            }

            // Create Idempotency Record
            com.bank.transaction.model.IdempotencyKey newKey = new com.bank.transaction.model.IdempotencyKey();
            newKey.setUserId(userId);
            newKey.setIdempotencyKey(idempotencyKey);
            newKey.setStatus("PROCESSING");
            newKey.setCreatedAt(Instant.now());
            idempotencyKeyRepository.save(newKey);
        }

        String result;
        try {
            result = executeTransfer(receiverAmount, receiverAccountNumber, userSession, userId);

            // Update Idempotency on Success
            if (idempotencyKey != null) {
                com.bank.transaction.model.IdempotencyKey key = idempotencyKeyRepository
                        .findByUserIdAndIdempotencyKey(userId, idempotencyKey).get();
                key.setStatus("COMPLETED");
                key.setResponsePayload(result);
                idempotencyKeyRepository.save(key);
            }
        } catch (Exception e) {
            // Update Idempotency on Failure
            if (idempotencyKey != null) {
                com.bank.transaction.model.IdempotencyKey key = idempotencyKeyRepository
                        .findByUserIdAndIdempotencyKey(userId, idempotencyKey).get();
                key.setStatus("FAILED");
                key.setResponsePayload("Error: " + e.getMessage());
                idempotencyKeyRepository.save(key);
            }
            throw e;
        }

        return result;
    }

    private String executeTransfer(BigDecimal receiverAmount, Long receiverAccountNumber, UserSession userSession,
            Long userId) {
        // 1. Get Account Details (Validation phase)
        CombineAccountDetailsDTO accountDetails = accountService.getSenderAccountDetails(userId, receiverAccountNumber);

        if (accountDetails.getSenderAccountBalance().compareTo(receiverAmount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance. Available: "
                    + accountDetails.getSenderAccountBalance() + ", Required: " + receiverAmount);
        }

        // 2. Create Transaction in PENDING state
        Transaction transaction = new Transaction();
        transaction.setCreditAmount(receiverAmount);
        transaction.setDebitAmount(receiverAmount);
        transaction.setSenderAccountNumber(accountDetails.getSenderAccountNumber());
        transaction.setReceiverAccountNumber(accountDetails.getReceiverAccountNumber());
        transaction.setTransactionDateTime(Instant.now());
        transaction.setDescription("Transfer Initiated");
        transaction.setStatus("PENDING");
        transaction.setCreatedAt(Instant.now());
        transaction.setUpdatedAt(Instant.now());
        transaction.setCreatedBy(userSession.email());

        transaction = transactionRepository.save(transaction);

        try {
            // 3. Debit Sender
            accountService.debitAccount(accountDetails.getSenderAccountId(), receiverAmount);

            try {
                // 4. Credit Receiver
                accountService.creditAccount(accountDetails.getReceiverAccountId(), receiverAmount);

                // 5. Complete Transaction
                transaction.setStatus("Done");
                transaction.setDescription("Transfer Successful");
                transaction.setUpdatedAt(Instant.now());
                transactionRepository.save(transaction);

                // Publish Event to Kafka
                try {
                    kafkaTemplate.send("transaction-completed", transaction);
                } catch (Exception e) {
                    System.err.println("Failed to publish transaction-completed event: " + e.getMessage());
                }

                return "Transaction Completed";

            } catch (Exception e) {
                // COMPENSATION: Refund Sender
                accountService.creditAccount(accountDetails.getSenderAccountId(), receiverAmount);

                transaction.setStatus("FAILED");
                transaction.setDescription("Credit Failed - Refunded");
                transaction.setUpdatedAt(Instant.now());
                transactionRepository.save(transaction);
                throw new RuntimeException("Transfer Failed during Credit: " + e.getMessage());
            }

        } catch (Exception e) {
            transaction.setStatus("FAILED");
            transaction.setDescription("Debit Failed");
            transaction.setUpdatedAt(Instant.now());
            transactionRepository.save(transaction);
            throw new RuntimeException("Transfer Failed during Debit: " + e.getMessage());
        }
    }

    @Override
    public UserSession getSession() {
        UserSession userSession = UserThreadLocalContext.getUserSession();
        System.out.println(userSession + " getiing session from getSession()");
        return userSession;
    }

    @Override
    public List<Transaction> getAllTransactions(Long accountNumber) {
        return transactionRepository.findBySenderAccountNumberOrReceiverAccountNumber(accountNumber, accountNumber);
    }

    @Override
    public Transaction getTransactionById(Long transactionId) {
        return transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found with ID: " + transactionId));
    }

    @Override
    public List<Transaction> getTransactionsByStatus(String status) {
        return transactionRepository.findByStatus(status);
    }

    @Override
    public List<Transaction> getTransactionsByDateRange(Instant startDate, Instant endDate) {
        return transactionRepository.findByTransactionDateTimeBetween(startDate, endDate);
    }

    @Override
    public List<Transaction> getTransactionsByAmountRange(BigDecimal minAmount, BigDecimal maxAmount) {
        return transactionRepository.findByCreditAmountBetween(minAmount, maxAmount);
    }

    @Override
    public java.util.Map<String, Object> getTransactionMetrics() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        List<Transaction> allTransactions = transactionRepository.findAll();

        long total = allTransactions.size();
        long successful = allTransactions.stream()
                .filter(t -> "Done".equalsIgnoreCase(t.getStatus()) || "COMPLETED".equalsIgnoreCase(t.getStatus()))
                .count();
        long failed = allTransactions.stream().filter(t -> "FAILED".equalsIgnoreCase(t.getStatus())).count();
        long pending = allTransactions.stream().filter(t -> "PENDING".equalsIgnoreCase(t.getStatus())).count();

        BigDecimal totalVolume = allTransactions.stream()
                .filter(t -> "Done".equalsIgnoreCase(t.getStatus()) || "COMPLETED".equalsIgnoreCase(t.getStatus()))
                .map(t -> t.getCreditAmount() != null ? t.getCreditAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double avgAmount = total > 0 && successful > 0
                ? totalVolume
                        .divide(BigDecimal.valueOf(successful), java.math.RoundingMode.HALF_UP)
                        .doubleValue()
                : 0.0;

        stats.put("total_transactions", total);
        stats.put("successful_transactions", successful);
        stats.put("failed_transactions", failed);
        stats.put("pending_transactions", pending);
        stats.put("total_volume", totalVolume);
        stats.put("average_transaction_amount", avgAmount);
        stats.put("peak_hour", "14:00"); // Mock for now, would need complex aggregation
        stats.put("last_updated", java.time.LocalDateTime.now());

        return stats;
    }

    @Override
    public java.util.Map<String, Object> getFailedTransactionMetrics() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        Instant twentyFourHoursAgo = Instant.now().minus(24, java.time.temporal.ChronoUnit.HOURS);

        List<Transaction> allTransactions = transactionRepository.findAll(); // Optimization: Should use findByDate in
                                                                             // real app
        List<Transaction> failedLast24h = allTransactions.stream()
                .filter(t -> t.getTransactionDateTime() != null
                        && t.getTransactionDateTime().isAfter(twentyFourHoursAgo))
                .filter(t -> "FAILED".equalsIgnoreCase(t.getStatus()))
                .collect(java.util.stream.Collectors.toList());

        long failedCount = failedLast24h.size();
        long totalLast24h = allTransactions.stream()
                .filter(t -> t.getTransactionDateTime() != null
                        && t.getTransactionDateTime().isAfter(twentyFourHoursAgo))
                .count();

        double failureRate = totalLast24h > 0 ? (double) failedCount / totalLast24h * 100 : 0.0;

        stats.put("failed_last_24h", failedCount);
        stats.put("failure_rate", failureRate);
        stats.put("common_failure_reasons", java.util.List.of("Insufficient Funds", "System Error")); // Mock
                                                                                                      // explanation
        stats.put("affected_users", failedLast24h.stream().map(Transaction::getSenderAccountNumber).distinct().count());
        stats.put("period_start", twentyFourHoursAgo);
        stats.put("period_end", Instant.now());

        return stats;
    }

    @Override
    public List<Transaction> getTransactionHistoryByUserId(Long userId) {
        // 1. Get all accounts for this user from account service
        List<com.bank.transaction.dto.AccountDTO> userAccounts = accountService.getAccountsByUserId(userId);

        if (userAccounts == null || userAccounts.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        // 2. Extract account numbers
        List<Long> accountNumbers = userAccounts.stream()
                .map(com.bank.transaction.dto.AccountDTO::getAccountNumber)
                .collect(java.util.stream.Collectors.toList());

        // 3. Find all transactions where any of these account numbers appear as sender
        // or receiver
        java.util.Set<Transaction> transactions = new java.util.HashSet<>();
        for (Long accNum : accountNumbers) {
            transactions.addAll(transactionRepository.findBySenderAccountNumberOrReceiverAccountNumber(accNum, accNum));
        }

        // 4. Convert back to list and sort by date descending
        return transactions.stream()
                .sorted((t1, t2) -> t2.getTransactionDateTime().compareTo(t1.getTransactionDateTime()))
                .collect(java.util.stream.Collectors.toList());
    }
}
