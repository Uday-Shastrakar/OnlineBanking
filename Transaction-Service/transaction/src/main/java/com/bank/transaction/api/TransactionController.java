package com.bank.transaction.api;

import com.bank.transaction.service.TransactionService;
import com.bank.transaction.session.UserSession;
import com.bank.transaction.session.UserThreadLocalContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/transaction")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping("/session")
    public UserSession getSession() {
        return transactionService.getSession();

    }

    @PostMapping("/transfer")
    public ResponseEntity<?> fundTransfer(
            @RequestBody(required = false) com.bank.transaction.dto.TransactionRequest request,
            @RequestParam(required = false) BigDecimal receiverAmount,
            @RequestParam(required = false) Long receiverAccountNumber,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {

        if (request != null) {
            return ResponseEntity.ok(transactionService.initiateTransfer(request, idempotencyKey));
        }

        return ResponseEntity
                .ok(transactionService.fundTransfer(receiverAmount, receiverAccountNumber, idempotencyKey));
    }

    @GetMapping("/getall")
    public java.util.List<com.bank.transaction.model.Transaction> getAllTransactions(
            @RequestParam Long accountNumber) {
        return transactionService.getAllTransactions(accountNumber);
    }

    @GetMapping("/admin/metrics")
    public java.util.Map<String, Object> getTransactionMetrics() {
        return transactionService.getTransactionMetrics();
    }

    @GetMapping("/admin/failed-metrics")
    public java.util.Map<String, Object> getFailedTransactionMetrics() {
        return transactionService.getFailedTransactionMetrics();
    }

    @GetMapping("/history")
    public java.util.List<com.bank.transaction.model.Transaction> getTransactionHistory(
            @RequestParam Long userId) {
        return transactionService.getTransactionHistoryByUserId(userId);
    }
}
