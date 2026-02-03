package com.bank.transaction.api;

import com.bank.transaction.dto.LedgerEntryDTO;
import com.bank.transaction.service.LedgerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class LedgerController {
    
    private static final Logger logger = LoggerFactory.getLogger(LedgerController.class);
    
    @Autowired
    private LedgerService ledgerService;
    
    /**
     * Get customer transaction history (ledger entries)
     * Banking-grade API with Credit/Debit columns and running balance
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getTransactionHistory(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Long userId) {
        
        try {
            // For now, use userId from parameter (in real app, extract from JWT token)
            if (userId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }
            
            // Default pagination
            int pageNumber = (page != null && page >= 0) ? page : 0;
            int pageSize = (size != null && size > 0) ? size : 20;
            Pageable pageable = PageRequest.of(pageNumber, pageSize);
            
            // Get ledger entries
            Page<LedgerEntryDTO> ledgerEntries = ledgerService.getLedgerEntriesForUser(userId, pageable);
            
            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("content", ledgerEntries.getContent());
            response.put("totalElements", ledgerEntries.getTotalElements());
            response.put("totalPages", ledgerEntries.getTotalPages());
            response.put("currentPage", ledgerEntries.getNumber());
            response.put("pageSize", ledgerEntries.getSize());
            response.put("first", ledgerEntries.isFirst());
            response.put("last", ledgerEntries.isLast());
            
            logger.info("Retrieved {} ledger entries for user {}", ledgerEntries.getTotalElements(), userId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error fetching transaction history for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch transaction history"));
        }
    }
    
    /**
     * Get all transaction history (no pagination)
     */
    @GetMapping("/all")
    public ResponseEntity<List<LedgerEntryDTO>> getAllTransactionHistory(
            @RequestParam(required = false) Long userId) {
        
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }
            
            List<LedgerEntryDTO> ledgerEntries = ledgerService.getAllLedgerEntriesForUser(userId);
            
            logger.info("Retrieved {} total ledger entries for user {}", ledgerEntries.size(), userId);
            
            return ResponseEntity.ok(ledgerEntries);
            
        } catch (Exception e) {
            logger.error("Error fetching all transaction history for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get current balance for all user accounts
     */
    @GetMapping("/balance")
    public ResponseEntity<Map<String, Object>> getCurrentBalance(
            @RequestParam(required = false) Long userId) {
        
        try {
            if (userId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }
            
            // This would need to be implemented to get all user account balances
            // For now, return a placeholder
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("totalBalance", 0.0);
            response.put("accountBalances", new HashMap<>());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error fetching balance for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch balance"));
        }
    }
}
