package com.bank.transaction.service;

import com.bank.transaction.dto.LedgerEntryDTO;
import com.bank.transaction.feignclient.AccountService;
import com.bank.transaction.model.LedgerEntry;
import com.bank.transaction.repository.LedgerEntryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class LedgerService {
    
    private static final Logger logger = LoggerFactory.getLogger(LedgerService.class);
    
    @Autowired
    private LedgerEntryRepository ledgerEntryRepository;
    
    @Autowired
    private AccountService accountService;
    
    /**
     * Create ledger entries for a transaction
     * One DEBIT entry for sender, one CREDIT entry for receiver
     */
    public void createLedgerEntries(Long transactionId, Long senderAccountId, Long senderAccountNumber,
                                   Long receiverAccountId, Long receiverAccountNumber, BigDecimal amount,
                                   String senderDescription, String receiverDescription, String status) {
        try {
            // Get current balances
            BigDecimal senderCurrentBalance = getCurrentBalance(senderAccountNumber);
            BigDecimal receiverCurrentBalance = getCurrentBalance(receiverAccountNumber);
            
            // Calculate new balances
            BigDecimal senderNewBalance = senderCurrentBalance.subtract(amount);
            BigDecimal receiverNewBalance = receiverCurrentBalance.add(amount);
            
            // Create DEBIT entry for sender
            LedgerEntry senderEntry = new LedgerEntry(
                transactionId, senderAccountId, senderAccountNumber,
                LedgerEntry.EntryType.DEBIT, amount, senderNewBalance,
                status, senderDescription, "system"
            );
            ledgerEntryRepository.save(senderEntry);
            
            // Create CREDIT entry for receiver
            LedgerEntry receiverEntry = new LedgerEntry(
                transactionId, receiverAccountId, receiverAccountNumber,
                LedgerEntry.EntryType.CREDIT, amount, receiverNewBalance,
                status, receiverDescription, "system"
            );
            ledgerEntryRepository.save(receiverEntry);
            
            logger.info("Created ledger entries for transaction {}: DEBIT {} for account {}, CREDIT {} for account {}", 
                       transactionId, amount, senderAccountNumber, amount, receiverAccountNumber);
            
        } catch (Exception e) {
            logger.error("Error creating ledger entries for transaction {}: {}", transactionId, e.getMessage(), e);
            throw new RuntimeException("Failed to create ledger entries", e);
        }
    }
    
    /**
     * Get ledger entries for a user (all their accounts)
     */
    public Page<LedgerEntryDTO> getLedgerEntriesForUser(Long userId, Pageable pageable) {
        try {
            // Get user's account numbers
            List<com.bank.transaction.dto.AccountDTO> userAccounts = accountService.getAccountsByUserId(userId);
            List<Long> accountNumbers = userAccounts.stream()
                    .map(com.bank.transaction.dto.AccountDTO::getAccountNumber)
                    .collect(Collectors.toList());
            
            if (accountNumbers.isEmpty()) {
                return Page.empty(pageable);
            }
            
            // Get ledger entries
            Page<LedgerEntry> ledgerEntries = ledgerEntryRepository
                    .findByAccountNumbersOrderByTimestampDesc(accountNumbers, pageable);
            
            // Convert to DTOs
            return ledgerEntries.map(this::convertToDTO);
            
        } catch (Exception e) {
            logger.error("Error fetching ledger entries for user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch ledger entries", e);
        }
    }
    
    /**
     * Get all ledger entries for a user (no pagination)
     */
    public List<LedgerEntryDTO> getAllLedgerEntriesForUser(Long userId) {
        try {
            // Get user's account numbers
            List<com.bank.transaction.dto.AccountDTO> userAccounts = accountService.getAccountsByUserId(userId);
            List<Long> accountNumbers = userAccounts.stream()
                    .map(com.bank.transaction.dto.AccountDTO::getAccountNumber)
                    .collect(Collectors.toList());
            
            if (accountNumbers.isEmpty()) {
                return List.of();
            }
            
            // Get ledger entries
            List<LedgerEntry> ledgerEntries = ledgerEntryRepository
                    .findByAccountNumbersOrderByTimestampDesc(accountNumbers);
            
            // Convert to DTOs
            return ledgerEntries.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
        } catch (Exception e) {
            logger.error("Error fetching all ledger entries for user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch ledger entries", e);
        }
    }
    
    /**
     * Get current balance for an account from Account Service
     */
    public BigDecimal getCurrentBalance(Long accountNumber) {
        try {
            // Get balance from Account Service instead of ledger repository
            com.bank.transaction.dto.AccountDTO account = accountService.getAccountByNumber(accountNumber);
            return account.getBalance() != null ? account.getBalance() : BigDecimal.ZERO;
        } catch (Exception e) {
            logger.error("Error getting current balance for account {}: {}", accountNumber, e.getMessage());
            return BigDecimal.ZERO;
        }
    }
    
    /**
     * Convert LedgerEntry to LedgerEntryDTO
     */
    private LedgerEntryDTO convertToDTO(LedgerEntry ledgerEntry) {
        return new LedgerEntryDTO(
            ledgerEntry.getEntryId(),
            ledgerEntry.getTransactionId(),
            ledgerEntry.getAccountId(),
            ledgerEntry.getAccountNumber(),
            ledgerEntry.getEntryType().name(),
            ledgerEntry.getAmount(),
            ledgerEntry.getBalanceAfter(),
            ledgerEntry.getStatus(),
            ledgerEntry.getTimestamp(),
            ledgerEntry.getDescription()
        );
    }
    
    /**
     * Create compensation entries for failed transactions
     */
    public void createCompensationEntries(Long transactionId, Long senderAccountId, Long senderAccountNumber,
                                        BigDecimal amount, String description) {
        try {
            // Get current balance
            BigDecimal senderCurrentBalance = getCurrentBalance(senderAccountNumber);
            
            // Calculate new balance (refund)
            BigDecimal senderNewBalance = senderCurrentBalance.add(amount);
            
            // Create CREDIT entry for refund
            LedgerEntry refundEntry = new LedgerEntry(
                transactionId, senderAccountId, senderAccountNumber,
                LedgerEntry.EntryType.CREDIT, amount, senderNewBalance,
                "COMPENSATED", description, "system"
            );
            ledgerEntryRepository.save(refundEntry);
            
            logger.info("Created compensation ledger entry for transaction {}: CREDIT {} for account {}", 
                       transactionId, amount, senderAccountNumber);
            
        } catch (Exception e) {
            logger.error("Error creating compensation entries for transaction {}: {}", transactionId, e.getMessage(), e);
            throw new RuntimeException("Failed to create compensation entries", e);
        }
    }
}
