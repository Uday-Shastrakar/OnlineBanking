package com.bank.transaction.service.serviceImpl;

import com.bank.transaction.dto.CombineAccountDetailsDTO;
import com.bank.transaction.dto.TransactionEvent;
import com.bank.transaction.exception.InsufficientBalanceException;
import com.bank.transaction.feignclient.AccountService;
import com.bank.transaction.model.Transaction;
import com.bank.transaction.model.LedgerEntry;
import com.bank.transaction.repository.TransactionRepository;
import com.bank.transaction.repository.LedgerEntryRepository;
import com.bank.transaction.service.TransactionService;
import com.bank.transaction.service.LedgerService;
import com.bank.transaction.session.UserSession;
import com.bank.transaction.session.UserThreadLocalContext;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class TransactionServiceImpl implements TransactionService {

    private static final Logger logger = LoggerFactory.getLogger(TransactionServiceImpl.class);

    @Autowired
    private AccountService accountService;

    @Autowired
    private com.bank.transaction.repository.IdempotencyKeyRepository idempotencyKeyRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private LedgerEntryRepository ledgerEntryRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private LedgerService ledgerService;

    @Override
    @Transactional
    public com.bank.transaction.dto.TransactionResponseDTO initiateTransfer(
            com.bank.transaction.dto.TransactionRequest request,
            String idempotencyKey) {
        UserSession userSession = UserThreadLocalContext.getUserSession();
        if (userSession == null) {
            // For direct API calls, create a mock session
            userSession = new UserSession(1L, "direct-api-user@example.com");
            UserThreadLocalContext.setUserSession(userSession);
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

            // 4. Create Transaction Records (SEPARATE for sender and receiver)
            Transaction senderTransaction = new Transaction();
            senderTransaction.setDebitAmount(request.getAmount());
            senderTransaction.setCreditAmount(BigDecimal.ZERO); // No credit for sender
            senderTransaction.setSenderAccountNumber(senderAccount.getAccountNumber());
            senderTransaction.setReceiverAccountNumber(receiverAccount.getAccountNumber());
            senderTransaction.setTransactionDateTime(Instant.now());
            senderTransaction.setDescription(request.getDescription());
            senderTransaction.setStatus("PENDING");
            senderTransaction.setCreatedAt(Instant.now());
            senderTransaction.setUpdatedAt(Instant.now());
            senderTransaction.setCreatedBy(userSession.email());
            
            Transaction receiverTransaction = new Transaction();
            receiverTransaction.setDebitAmount(BigDecimal.ZERO); // No debit for receiver
            receiverTransaction.setCreditAmount(request.getAmount());
            receiverTransaction.setSenderAccountNumber(senderAccount.getAccountNumber());
            receiverTransaction.setReceiverAccountNumber(receiverAccount.getAccountNumber());
            receiverTransaction.setTransactionDateTime(Instant.now());
            receiverTransaction.setDescription(request.getDescription());
            receiverTransaction.setStatus("PENDING");
            receiverTransaction.setCreatedAt(Instant.now());
            receiverTransaction.setUpdatedAt(Instant.now());
            receiverTransaction.setCreatedBy(userSession.email());
            
            senderTransaction = transactionRepository.save(senderTransaction);
            receiverTransaction = transactionRepository.save(receiverTransaction);

            // 5. Execute Money Movement (Banking-Safe)
            try {
                // DEBIT Sender and get updated balance
                logger.info("Attempting to debit account {} with amount {}", senderAccount.getId(), request.getAmount());
                BigDecimal senderUpdatedBalance = accountService.debitAccountAndReturnBalance(senderAccount.getId(), request.getAmount());
                logger.info("Debit successful. Updated balance: {}", senderUpdatedBalance);
                
                try {
                    // CREDIT Receiver and get updated balance
                    logger.info("Attempting to credit account {} with amount {}", receiverAccount.getId(), request.getAmount());
                    BigDecimal receiverUpdatedBalance = accountService.creditAccountAndReturnBalance(receiverAccount.getId(), request.getAmount());
                    logger.info("Credit successful. Updated balance: {}", receiverUpdatedBalance);

                    // Update both transaction records to COMPLETED
                    senderTransaction.setStatus("COMPLETED");
                    receiverTransaction.setStatus("COMPLETED");
                    
                    // Create role-based descriptions with masked account numbers
                    String maskedSenderAcc = maskAccountNumber(senderAccount.getAccountNumber());
                    String maskedReceiverAcc = maskAccountNumber(receiverAccount.getAccountNumber());
                    
                    String senderDescription = String.format("Transfer to A/C %s", maskedReceiverAcc);
                    String receiverDescription = String.format("Transfer from A/C %s", maskedSenderAcc);
                    
                    // Set appropriate descriptions for each transaction
                    senderTransaction.setDescription(senderDescription);
                    receiverTransaction.setDescription(receiverDescription);
                    
                    senderTransaction.setUpdatedAt(Instant.now());
                    receiverTransaction.setUpdatedAt(Instant.now());
                    
                    transactionRepository.save(senderTransaction);
                    transactionRepository.save(receiverTransaction);

                    // Create ledger entries using ACTUAL updated balances (Banking-Safe)
                    try {
                        // Create DEBIT ledger entry for sender with actual updated balance
                        LedgerEntry senderLedgerEntry = new LedgerEntry(
                            senderTransaction.getId(),
                            senderAccount.getId(),
                            senderAccount.getAccountNumber(),
                            LedgerEntry.EntryType.DEBIT,
                            request.getAmount(),
                            senderUpdatedBalance, // Use actual returned balance
                            "COMPLETED",
                            senderDescription,
                            "system"
                        );
                        ledgerEntryRepository.save(senderLedgerEntry);
                        
                        // Create CREDIT ledger entry for receiver with actual updated balance
                        LedgerEntry receiverLedgerEntry = new LedgerEntry(
                            receiverTransaction.getId(),
                            receiverAccount.getId(),
                            receiverAccount.getAccountNumber(),
                            LedgerEntry.EntryType.CREDIT,
                            request.getAmount(),
                            receiverUpdatedBalance, // Use actual returned balance
                            "COMPLETED",
                            receiverDescription,
                            "system"
                        );
                        ledgerEntryRepository.save(receiverLedgerEntry);
                        
                        logger.info("Created banking-safe ledger entries - Sender balance: {}, Receiver balance: {}", 
                                   senderUpdatedBalance, receiverUpdatedBalance);
                    } catch (Exception e) {
                        logger.error("Error creating ledger entries: {}", e.getMessage(), e);
                    }

                    // Publish Events for both transactions with user information
                    try {
                        TransactionEvent senderEvent = new TransactionEvent(senderTransaction, userId, userSession.email());
                        TransactionEvent receiverEvent = new TransactionEvent(receiverTransaction, userId, userSession.email());
                        
                        kafkaTemplate.send("transaction-completed", senderEvent);
                        kafkaTemplate.send("transaction-completed", receiverEvent);
                        
                        System.out.println("📤 Published transaction events for user: " + userId);
                    } catch (Exception e) {
                        System.err.println("Failed to publish transaction events: " + e.getMessage());
                    }

                    // Update Idempotency
                    if (idempotencyKey != null) {
                        com.bank.transaction.model.IdempotencyKey key = idempotencyKeyRepository
                                .findByUserIdAndIdempotencyKey(userId, idempotencyKey).get();
                        key.setStatus("COMPLETED");
                        key.setResponsePayload("COMPLETED:" + senderTransaction.getId());
                        idempotencyKeyRepository.save(key);
                    }

                    return com.bank.transaction.dto.TransactionResponseDTO.builder()
                            .transactionId(senderTransaction.getId().toString())
                            .sourceAccountId(request.getSourceAccountId())
                            .destinationAccountId(request.getDestinationAccountId())
                            .amount(request.getAmount())
                            .currency(request.getCurrency())
                            .status(senderTransaction.getStatus())
                            .description(senderTransaction.getDescription())
                            .createdAt(senderTransaction.getCreatedAt())
                            .build();

                } catch (Exception creditException) {
                    // COMPENSATION: Refund Sender using banking-safe operation
                    logger.error("Credit operation failed: {}", creditException.getMessage());
                    try {
                        logger.info("Attempting to refund account {} with amount {}", senderAccount.getId(), request.getAmount());
                        BigDecimal refundUpdatedBalance = accountService.creditAccountAndReturnBalance(senderAccount.getId(), request.getAmount());
                        logger.info("Refund successful. Updated balance: {}", refundUpdatedBalance);
                        
                        String maskedReceiverAcc = maskAccountNumber(receiverAccount.getAccountNumber());
                        senderTransaction.setStatus("COMPENSATED");
                        senderTransaction.setDescription(String.format("Transfer to A/C %s - Refunded", maskedReceiverAcc));
                        receiverTransaction.setStatus("FAILED");
                        receiverTransaction.setDescription(String.format("Transfer from A/C %s - Failed", maskAccountNumber(senderAccount.getAccountNumber())));
                        
                        // Create COMPENSATION ledger entry with actual returned balance
                        try {
                            LedgerEntry refundLedgerEntry = new LedgerEntry(
                                senderTransaction.getId(),
                                senderAccount.getId(),
                                senderAccount.getAccountNumber(),
                                LedgerEntry.EntryType.CREDIT,
                                request.getAmount(),
                                refundUpdatedBalance, // Use actual returned balance
                                "COMPENSATED",
                                String.format("Refund for failed transfer to A/C %s", maskedReceiverAcc),
                                "system"
                            );
                            ledgerEntryRepository.save(refundLedgerEntry);
                        } catch (Exception ledgerException) {
                            logger.error("Error creating compensation ledger entry: {}", ledgerException.getMessage());
                        }
                    } catch (Exception refundException) {
                        logger.error("Refund operation failed: {}", refundException.getMessage());
                        String maskedReceiverAccFailed = maskAccountNumber(receiverAccount.getAccountNumber());
                        senderTransaction.setStatus("FAILED_REFUND");
                        senderTransaction.setDescription(String.format("Transfer to A/C %s - Refund Failed", maskedReceiverAccFailed));
                        receiverTransaction.setStatus("FAILED");
                        receiverTransaction.setDescription(String.format("Transfer from A/C %s - Failed", maskAccountNumber(senderAccount.getAccountNumber())));
                    }
                    senderTransaction.setUpdatedAt(Instant.now());
                    receiverTransaction.setUpdatedAt(Instant.now());
                    transactionRepository.save(senderTransaction);
                    transactionRepository.save(receiverTransaction);
                    
                    // Update Idempotency on Failure
                    if (idempotencyKey != null) {
                        idempotencyKeyRepository.findByUserIdAndIdempotencyKey(userId, idempotencyKey).ifPresent(key -> {
                            key.setStatus("FAILED");
                            key.setResponsePayload("Credit Failed: " + creditException.getMessage());
                            idempotencyKeyRepository.save(key);
                        });
                    }
                    
                    throw new com.bank.transaction.exception.TransactionFailedException(
                            "Transfer failed: Receiver account credit failed. Amount refunded to sender account.");
                }

            } catch (Exception debitException) {
                logger.error("Debit operation failed: {}", debitException.getMessage());
                String maskedReceiverAccFailed = maskAccountNumber(receiverAccount.getAccountNumber());
                senderTransaction.setStatus("FAILED");
                senderTransaction.setDescription(String.format("Transfer to A/C %s - Failed", maskedReceiverAccFailed));
                receiverTransaction.setStatus("FAILED");
                receiverTransaction.setDescription(String.format("Transfer from A/C %s - Failed", maskAccountNumber(senderAccount.getAccountNumber())));
                senderTransaction.setUpdatedAt(Instant.now());
                receiverTransaction.setUpdatedAt(Instant.now());
                transactionRepository.save(senderTransaction);
                transactionRepository.save(receiverTransaction);
                
                // Update Idempotency on Failure
                if (idempotencyKey != null) {
                    idempotencyKeyRepository.findByUserIdAndIdempotencyKey(userId, idempotencyKey).ifPresent(key -> {
                        key.setStatus("FAILED");
                        key.setResponsePayload("Debit Failed: " + debitException.getMessage());
                        idempotencyKeyRepository.save(key);
                    });
                }
                
                throw new com.bank.transaction.exception.TransactionFailedException(
                        "Transfer failed: Sender account debit failed. No amount deducted.");
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
            // For direct API calls, create a mock session
            userSession = new UserSession(1L, "direct-api-user@example.com");
            UserThreadLocalContext.setUserSession(userSession);
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

                // Publish Event to Kafka with user information
                try {
                    TransactionEvent transactionEvent = new TransactionEvent(transaction, userId, userSession.email());
                    kafkaTemplate.send("transaction-completed", transactionEvent);
                    System.out.println("📤 Published fund transfer event for user: " + userId);
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

    // Health check method to test Account Service connectivity
    public boolean checkAccountServiceHealth() {
        try {
            logger.info("Testing Account Service connectivity...");
            // Try to get a simple response from Account Service
            accountService.getAccountsByUserId(1L);
            logger.info("Account Service is reachable");
            return true;
        } catch (Exception e) {
            logger.error("Account Service is not reachable: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public List<Transaction> getAllTransactions(Long accountNumber) {
        // This method doesn't have userId, so we can't apply role-specific descriptions
        // Keeping original behavior for this method
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
        List<Transaction> allTransactions = transactions.stream()
                .sorted((t1, t2) -> t2.getTransactionDateTime().compareTo(t1.getTransactionDateTime()))
                .collect(java.util.stream.Collectors.toList());
        
        // Apply user-appropriate descriptions
        return getTransactionsWithUserDescriptions(allTransactions, userId);
    }

    // Get transactions where user is the SENDER (money sent out)
    public List<Transaction> getSentTransactions(Long userId) {
        try {
            // 1. Get all user accounts
            List<com.bank.transaction.dto.AccountDTO> userAccounts = accountService.getAccountsByUserId(userId);

            if (userAccounts == null || userAccounts.isEmpty()) {
                return java.util.Collections.emptyList();
            }

            // 2. Extract account numbers
            List<Long> accountNumbers = userAccounts.stream()
                    .map(com.bank.transaction.dto.AccountDTO::getAccountNumber)
                    .collect(java.util.stream.Collectors.toList());

            // 3. Find transactions where user is the sender
            java.util.Set<Transaction> sentTransactions = new java.util.HashSet<>();
            for (Long accNum : accountNumbers) {
                sentTransactions.addAll(transactionRepository.findBySenderAccountNumber(accNum));
            }

            // 4. Convert to list and sort by date descending
            List<Transaction> sentTransactionsList = sentTransactions.stream()
                    .sorted((t1, t2) -> t2.getTransactionDateTime().compareTo(t1.getTransactionDateTime()))
                    .collect(java.util.stream.Collectors.toList());
            
            // Apply user-appropriate descriptions
            return getTransactionsWithUserDescriptions(sentTransactionsList, userId);

        } catch (Exception e) {
            logger.error("Error fetching sent transactions for user {}: {}", userId, e.getMessage());
            return java.util.Collections.emptyList();
        }
    }

    // Get transactions where user is the RECEIVER (money received)
    public List<Transaction> getReceivedTransactions(Long userId) {
        try {
            // 1. Get all user accounts
            List<com.bank.transaction.dto.AccountDTO> userAccounts = accountService.getAccountsByUserId(userId);

            if (userAccounts == null || userAccounts.isEmpty()) {
                return java.util.Collections.emptyList();
            }

            // 2. Extract account numbers
            List<Long> accountNumbers = userAccounts.stream()
                    .map(com.bank.transaction.dto.AccountDTO::getAccountNumber)
                    .collect(java.util.stream.Collectors.toList());

            // 3. Find transactions where user is the receiver
            java.util.Set<Transaction> receivedTransactions = new java.util.HashSet<>();
            for (Long accNum : accountNumbers) {
                receivedTransactions.addAll(transactionRepository.findByReceiverAccountNumber(accNum));
            }

            // 4. Convert to list and sort by date descending
            List<Transaction> receivedTransactionsList = receivedTransactions.stream()
                    .sorted((t1, t2) -> t2.getTransactionDateTime().compareTo(t1.getTransactionDateTime()))
                    .collect(java.util.stream.Collectors.toList());
            
            // Apply user-appropriate descriptions
            return getTransactionsWithUserDescriptions(receivedTransactionsList, userId);

        } catch (Exception e) {
            logger.error("Error fetching received transactions for user {}: {}", userId, e.getMessage());
            return java.util.Collections.emptyList();
        }
    }

    // Get bifurcated transaction summary
    public java.util.Map<String, Object> getBifurcatedTransactionSummary(Long userId) {
        try {
            List<Transaction> sentTransactions = getSentTransactions(userId);
            List<Transaction> receivedTransactions = getReceivedTransactions(userId);

            // Calculate totals for sent transactions
            BigDecimal totalSent = sentTransactions.stream()
                    .filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()) || "Done".equalsIgnoreCase(t.getStatus()))
                    .map(t -> t.getDebitAmount() != null ? t.getDebitAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Calculate totals for received transactions
            BigDecimal totalReceived = receivedTransactions.stream()
                    .filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus()) || "Done".equalsIgnoreCase(t.getStatus()))
                    .map(t -> t.getCreditAmount() != null ? t.getCreditAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            java.util.Map<String, Object> summary = new java.util.HashMap<>();
            summary.put("sent_transactions", sentTransactions.size());
            summary.put("received_transactions", receivedTransactions.size());
            summary.put("total_sent", totalSent);
            summary.put("total_received", totalReceived);
            summary.put("net_balance", totalReceived.subtract(totalSent));
            summary.put("sent_history", getTransactionsWithUserDescriptions(sentTransactions, userId));
            summary.put("received_history", getTransactionsWithUserDescriptions(receivedTransactions, userId));

            return summary;

        } catch (Exception e) {
            logger.error("Error creating bifurcated transaction summary for user {}: {}", userId, e.getMessage());
            return java.util.Collections.emptyMap();
        }
    }

    // Helper method to get appropriate description based on user's role
    private String getTransactionDescriptionForUser(Transaction transaction, Long userId) {
        try {
            // Get user's account numbers
            List<com.bank.transaction.dto.AccountDTO> userAccounts = accountService.getAccountsByUserId(userId);
            List<Long> userAccountNumbers = userAccounts.stream()
                    .map(com.bank.transaction.dto.AccountDTO::getAccountNumber)
                    .collect(java.util.stream.Collectors.toList());

            // Check if user is sender or receiver
            boolean isSender = userAccountNumbers.contains(transaction.getSenderAccountNumber());
            boolean isReceiver = userAccountNumbers.contains(transaction.getReceiverAccountNumber());

            String description = transaction.getDescription();
            if (description != null && description.contains("SENDER:") && description.contains("RECEIVER:")) {
                if (isSender) {
                    return description.substring(description.indexOf("SENDER:") + 7, description.indexOf("|RECEIVER:"));
                } else if (isReceiver) {
                    return description.substring(description.indexOf("RECEIVER:") + 9);
                }
            }

            // Fallback to original description or default
            return description != null ? description : "Transaction";
        } catch (Exception e) {
            logger.error("Error getting transaction description for user {}: {}", userId, e.getMessage());
            return transaction.getDescription() != null ? transaction.getDescription() : "Transaction";
        }
    }

    // Helper method to mask account number for security
    private String maskAccountNumber(Long accountNumber) {
        if (accountNumber == null) {
            return "****";
        }
        String accountStr = accountNumber.toString();
        if (accountStr.length() <= 4) {
            return "****";
        }
        // Show last 4 digits, mask the rest
        return "****" + accountStr.substring(accountStr.length() - 4);
    }

    // Helper method to get transactions with user-appropriate descriptions
    private List<Transaction> getTransactionsWithUserDescriptions(List<Transaction> transactions, Long userId) {
        return transactions.stream()
                .map(transaction -> {
                    Transaction modifiedTransaction = new Transaction();
                    // Copy all properties
                    modifiedTransaction.setId(transaction.getId());
                    modifiedTransaction.setDebitAmount(transaction.getDebitAmount());
                    modifiedTransaction.setCreditAmount(transaction.getCreditAmount());
                    modifiedTransaction.setSenderAccountNumber(transaction.getSenderAccountNumber());
                    modifiedTransaction.setReceiverAccountNumber(transaction.getReceiverAccountNumber());
                    modifiedTransaction.setTransactionDateTime(transaction.getTransactionDateTime());
                    modifiedTransaction.setStatus(transaction.getStatus());
                    modifiedTransaction.setCreatedAt(transaction.getCreatedAt());
                    modifiedTransaction.setUpdatedAt(transaction.getUpdatedAt());
                    modifiedTransaction.setCreatedBy(transaction.getCreatedBy());
                    
                    // Set user-appropriate description
                    modifiedTransaction.setDescription(getTransactionDescriptionForUser(transaction, userId));
                    
                    return modifiedTransaction;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    // Manual migration method to update existing transaction descriptions
    public String migrateExistingTransactionDescriptions() {
        try {
            logger.info("Starting migration of existing transaction descriptions...");
            
            List<Transaction> allTransactions = transactionRepository.findAll();
            int updatedCount = 0;
            
            for (Transaction transaction : allTransactions) {
                String currentDescription = transaction.getDescription();
                
                // Check if transaction needs updating
                if (currentDescription == null || 
                    currentDescription.trim().isEmpty() ||
                    currentDescription.equals("Transfer Successful") ||
                    currentDescription.startsWith("Money Sent to Account") ||
                    currentDescription.startsWith("Money Received from Account")) {
                    
                    // Create new role-based description
                    String maskedSenderAccount = maskAccountNumber(transaction.getSenderAccountNumber());
                    String maskedReceiverAccount = maskAccountNumber(transaction.getReceiverAccountNumber());
                    
                    String newDescription = String.format("SENDER:Transfer to A/C %s|RECEIVER:Transfer from A/C %s", 
                                                           maskedReceiverAccount, maskedSenderAccount);
                    
                    transaction.setDescription(newDescription);
                    transaction.setUpdatedAt(Instant.now());
                    transactionRepository.save(transaction);
                    updatedCount++;
                }
            }
            
            logger.info("Migration completed. Updated {} transaction descriptions.", updatedCount);
            return String.format("Migration completed successfully. Updated %d transaction descriptions.", updatedCount);
            
        } catch (Exception e) {
            logger.error("Error during transaction description migration: {}", e.getMessage(), e);
            return "Migration failed: " + e.getMessage();
        }
    }
}
