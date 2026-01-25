package com.bank.transaction.repository;

import com.bank.transaction.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    java.util.List<Transaction> findBySenderAccountNumberOrReceiverAccountNumber(Long sender, Long receiver);
}
