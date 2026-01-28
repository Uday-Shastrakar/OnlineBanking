package com.bank.customer.controller;

import com.bank.customer.dto.ApiResponse;
import com.bank.customer.service.CustomerCleanupService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers/cleanup")
@CrossOrigin(origins = "*")
public class CustomerCleanupController {

    private static final Logger logger = LoggerFactory.getLogger(CustomerCleanupController.class);

    @Autowired
    private CustomerCleanupService customerCleanupService;

    /**
     * Get statistics about orphaned customers
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<CustomerCleanupService.CleanupStatistics>> getCleanupStatistics(
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        
        try {
            logger.info("Admin requested cleanup statistics");
            CustomerCleanupService.CleanupStatistics stats = customerCleanupService.getCleanupStatistics();
            
            logger.info("Cleanup statistics: Total={}, Orphaned={}, Valid={}", 
                stats.getTotalCustomers(), stats.getOrphanedCustomersCount(), stats.getValidCustomersCount());
            
            return ResponseEntity.ok(new ApiResponse<>(true, stats, "Cleanup statistics retrieved successfully"));
            
        } catch (Exception e) {
            logger.error("Error retrieving cleanup statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, null, "Failed to retrieve cleanup statistics"));
        }
    }

    /**
     * Find all orphaned customers
     */
    @GetMapping("/orphaned")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> findOrphanedCustomers(
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        
        try {
            logger.info("Admin requested list of orphaned customers");
            var orphanedCustomers = customerCleanupService.findOrphanedCustomers();
            
            // Convert to safe response format
            List<Map<String, Object>> customerSummaries = orphanedCustomers.stream()
                    .map(customer -> {
                        Map<String, Object> summary = Map.of(
                            "id", customer.getId(),
                            "firstName", customer.getFirstName(),
                            "lastName", customer.getLastName(),
                            "email", customer.getEmail(),
                            "phoneNumber", customer.getPhoneNumber(),
                            "userId", customer.getUserId(),
                            "status", customer.getStatus()
                        );
                        return summary;
                    })
                    .toList();
            
            logger.info("Found {} orphaned customers", orphanedCustomers.size());
            return ResponseEntity.ok(new ApiResponse<>(true, customerSummaries, 
                String.format("Found %d orphaned customers", orphanedCustomers.size())));
            
        } catch (Exception e) {
            logger.error("Error finding orphaned customers", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, null, "Failed to find orphaned customers"));
        }
    }

    /**
     * Remove all orphaned customers
     */
    @DeleteMapping("/orphaned")
    public ResponseEntity<ApiResponse<String>> removeOrphanedCustomers(
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        
        try {
            logger.info("Admin requested removal of orphaned customers");
            int removedCount = customerCleanupService.removeOrphanedCustomers();
            
            String message = String.format("Successfully removed %d orphaned customers", removedCount);
            logger.info(message);
            
            return ResponseEntity.ok(new ApiResponse<>(true, message, message));
            
        } catch (Exception e) {
            logger.error("Error removing orphaned customers", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, null, "Failed to remove orphaned customers"));
        }
    }

    /**
     * Check if a specific customer is orphaned
     */
    @GetMapping("/{customerId}/orphaned")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkCustomerOrphaned(
            @PathVariable Long customerId,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        
        try {
            logger.info("Admin checking if customer {} is orphaned", customerId);
            boolean isOrphaned = customerCleanupService.isCustomerOrphaned(customerId);
            
            Map<String, Object> result = Map.of(
                "customerId", customerId,
                "isOrphaned", isOrphaned,
                "message", isOrphaned ? "Customer is orphaned (user does not exist)" : "Customer is valid (user exists)"
            );
            
            logger.info("Customer {} orphaned status: {}", customerId, isOrphaned);
            return ResponseEntity.ok(new ApiResponse<>(true, result, "Orphaned status checked successfully"));
            
        } catch (Exception e) {
            logger.error("Error checking if customer {} is orphaned", customerId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, null, "Failed to check orphaned status"));
        }
    }

    /**
     * Remove a specific customer if they are orphaned
     */
    @DeleteMapping("/{customerId}/orphaned")
    public ResponseEntity<ApiResponse<String>> removeOrphanedCustomer(
            @PathVariable Long customerId,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        
        try {
            logger.info("Admin requested removal of potentially orphaned customer {}", customerId);
            
            boolean isOrphaned = customerCleanupService.isCustomerOrphaned(customerId);
            if (!isOrphaned) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(false, null, "Customer is not orphaned - user exists"));
            }
            
            // Remove the orphaned customer
            customerCleanupService.removeOrphanedCustomers();
            
            String message = String.format("Successfully removed orphaned customer %d", customerId);
            logger.info(message);
            
            return ResponseEntity.ok(new ApiResponse<>(true, message, message));
            
        } catch (Exception e) {
            logger.error("Error removing orphaned customer {}", customerId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, null, "Failed to remove orphaned customer"));
        }
    }
}
