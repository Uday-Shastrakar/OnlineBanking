package com.bank.transaction.service.serviceImpl;

import com.bank.transaction.dto.CombineAccountDetailsDTO;
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
    public String fundTransfer(BigDecimal receiverAmount, Long receiverAccountNumber, String idempotencyKey) {
        UserSession userSession = UserThreadLocalContext.getUserSession();
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
            throw new RuntimeException("Sender does not have enough balance for the transfer.");
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
}
