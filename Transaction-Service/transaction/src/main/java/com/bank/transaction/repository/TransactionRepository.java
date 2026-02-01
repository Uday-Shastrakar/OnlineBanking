package com.bank.transaction.repository;

import com.bank.transaction.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findBySenderAccountNumberOrReceiverAccountNumber(Long sender, Long receiver);
    
    List<Transaction> findByStatus(String status);
    
    List<Transaction> findByTransactionDateTimeBetween(Instant startDate, Instant endDate);
    
    List<Transaction> findByCreditAmountBetween(BigDecimal minAmount, BigDecimal maxAmount);
    
    @Query("SELECT t FROM Transaction t WHERE t.senderAccountNumber = :accountNumber OR t.receiverAccountNumber = :accountNumber ORDER BY t.transactionDateTime DESC")
    List<Transaction> findRecentTransactionsByAccountNumber(@Param("accountNumber") Long accountNumber);
}
