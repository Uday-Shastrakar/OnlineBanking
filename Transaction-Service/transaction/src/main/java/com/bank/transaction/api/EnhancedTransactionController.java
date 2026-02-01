package com.bank.transaction.api;

import com.bank.transaction.exception.TransactionFailedException;
import com.bank.transaction.model.Transaction;
import com.bank.transaction.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/transaction")
public class EnhancedTransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping("/{transactionId}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long transactionId) {
        try {
            Transaction transaction = transactionService.getTransactionById(transactionId);
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            throw new TransactionFailedException("Transaction not found: " + e.getMessage());
        }
    }

    @GetMapping("/by-status")
    public ResponseEntity<List<Transaction>> getTransactionsByStatus(@RequestParam String status) {
        try {
            List<Transaction> transactions = transactionService.getTransactionsByStatus(status);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            throw new TransactionFailedException("Failed to get transactions by status: " + e.getMessage());
        }
    }

    @GetMapping("/by-date")
    public ResponseEntity<List<Transaction>> getTransactionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate) {
        try {
            List<Transaction> transactions = transactionService.getTransactionsByDateRange(startDate, endDate);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            throw new TransactionFailedException("Failed to get transactions by date range: " + e.getMessage());
        }
    }

    @GetMapping("/by-amount")
    public ResponseEntity<List<Transaction>> getTransactionsByAmountRange(
            @RequestParam BigDecimal minAmount,
            @RequestParam BigDecimal maxAmount) {
        try {
            List<Transaction> transactions = transactionService.getTransactionsByAmountRange(minAmount, maxAmount);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            throw new TransactionFailedException("Failed to get transactions by amount range: " + e.getMessage());
        }
    }

    @GetMapping("/recent/{accountNumber}")
    public ResponseEntity<List<Transaction>> getRecentTransactions(@PathVariable Long accountNumber) {
        try {
            List<Transaction> transactions = transactionService.getAllTransactions(accountNumber);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            throw new TransactionFailedException("Failed to get recent transactions: " + e.getMessage());
        }
    }
}
