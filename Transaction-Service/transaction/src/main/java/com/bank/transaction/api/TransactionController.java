package com.bank.transaction.api;

import com.bank.transaction.service.TransactionService;
import com.bank.transaction.session.UserSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/health-check")
    public java.util.Map<String, Object> healthCheck() {
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        boolean accountServiceHealthy = transactionService.checkAccountServiceHealth();
        
        response.put("transaction_service", "healthy");
        response.put("account_service", accountServiceHealthy ? "healthy" : "unhealthy");
        response.put("overall", accountServiceHealthy ? "healthy" : "degraded");
        
        return response;
    }

    // Get transactions where user is the SENDER (money sent out)
    @GetMapping("/sent")
    public java.util.List<com.bank.transaction.model.Transaction> getSentTransactions(
            @RequestParam Long userId) {
        return transactionService.getSentTransactions(userId);
    }

    // Get transactions where user is the RECEIVER (money received)
    @GetMapping("/received")
    public java.util.List<com.bank.transaction.model.Transaction> getReceivedTransactions(
            @RequestParam Long userId) {
        return transactionService.getReceivedTransactions(userId);
    }

    // Get bifurcated transaction summary with both sent and received
    @GetMapping("/bifurcated-summary")
    public java.util.Map<String, Object> getBifurcatedTransactionSummary(
            @RequestParam Long userId) {
        return transactionService.getBifurcatedTransactionSummary(userId);
    }

    // Migrate existing transaction descriptions to new role-based format
    @PostMapping("/migrate-descriptions")
    public ResponseEntity<String> migrateTransactionDescriptions() {
        try {
            String result = ((com.bank.transaction.service.serviceImpl.TransactionServiceImpl) transactionService)
                    .migrateExistingTransactionDescriptions();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Migration failed: " + e.getMessage());
        }
    }
}
