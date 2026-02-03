package com.bank.authentication.controller;

import com.bank.authentication.audit.AuditLogger;
import com.bank.authentication.dto.ApiResponse;
import com.bank.authentication.kafka.AdminAuditProducer;
import com.bank.authentication.model.User;
import com.bank.authentication.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * STEP 3: ADMIN DASHBOARD (READ-ONLY)
 * Admin dashboard with system aggregates only
 * Never exposes balances inline
 * Audit every dashboard access
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    private static final Logger logger = LoggerFactory.getLogger(AdminDashboardController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private AdminAuditProducer adminAuditProducer;

    @Autowired
    private AuditLogger auditLogger;

    /**
     * Get system aggregates for admin dashboard
     * Read-only view of system metrics
     */
    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemMetrics(
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId,
            Authentication authentication) {

        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(false, null, "Authentication required"));
            }
            
            String adminUsername = authentication.getName();
            User adminUser = userService.findByUsername(adminUsername);

            if (adminUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, null, "Admin user not found: " + adminUsername));
            }

            // Get system aggregates (read-only)
            Map<String, Object> metrics = calculateSystemMetrics();

            // Emit dashboard access event
            adminAuditProducer.emitDashboardAccess(adminUser.getUserId(), adminUsername, "ADMIN_METRICS");

            auditLogger.logAction("ADMIN_DASHBOARD_ACCESS", adminUsername);

            return ResponseEntity.ok(new ApiResponse<>(true, metrics, "System metrics retrieved successfully"));

        } catch (Exception e) {
            logger.error("Error retrieving system metrics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, null, "Failed to retrieve system metrics: " + e.getMessage()));
        }
    }

    /**
     * Get customer statistics (aggregated only)
     */
    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCustomerStatistics(
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId,
            Authentication authentication) {

        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(false, null, "Authentication required"));
            }
            
            String adminUsername = authentication.getName();
            User adminUser = userService.findByUsername(adminUsername);

            if (adminUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, null, "Admin user not found: " + adminUsername));
            }

            Map<String, Object> customerStats = calculateCustomerStatistics();

            // Emit dashboard access event
            adminAuditProducer.emitDashboardAccess(adminUser.getUserId(), adminUsername, "CUSTOMER_STATISTICS");

            auditLogger.logAction("ADMIN_CUSTOMER_STATS_ACCESS", adminUsername);

            return ResponseEntity
                    .ok(new ApiResponse<>(true, customerStats, "Customer statistics retrieved successfully"));

        } catch (Exception e) {
            logger.error("Error retrieving customer statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, null, "Failed to retrieve customer statistics: " + e.getMessage()));
        }
    }

    /**
     * Get transaction statistics (aggregated only)
     */
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTransactionStatistics(
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId,
            Authentication authentication) {

        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(false, null, "Authentication required"));
            }
            
            String adminUsername = authentication.getName();
            User adminUser = userService.findByUsername(adminUsername);

            if (adminUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, null, "Admin user not found: " + adminUsername));
            }

            Map<String, Object> transactionStats = calculateTransactionStatistics();

            // Emit dashboard access event
            adminAuditProducer.emitDashboardAccess(adminUser.getUserId(), adminUsername, "TRANSACTION_STATISTICS");

            auditLogger.logAction("ADMIN_TRANSACTION_STATS_ACCESS", adminUsername);

            return ResponseEntity
                    .ok(new ApiResponse<>(true, transactionStats, "Transaction statistics retrieved successfully"));

        } catch (Exception e) {
            logger.error("Error retrieving transaction statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, null,
                            "Failed to retrieve transaction statistics: " + e.getMessage()));
        }
    }

    /**
     * Get failed transactions (last 24h)
     */
    @GetMapping("/failed-transactions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFailedTransactions(
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId,
            Authentication authentication) {

        try {
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(false, null, "Authentication required"));
            }
            
            String adminUsername = authentication.getName();
            User adminUser = userService.findByUsername(adminUsername);

            if (adminUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, null, "Admin user not found: " + adminUsername));
            }

            Map<String, Object> failedTransactionData = calculateFailedTransactions();

            // Emit dashboard access event
            adminAuditProducer.emitDashboardAccess(adminUser.getUserId(), adminUsername, "FAILED_TRANSACTIONS");

            auditLogger.logAction("ADMIN_FAILED_TRANSACTIONS_ACCESS", adminUsername);

            return ResponseEntity
                    .ok(new ApiResponse<>(true, failedTransactionData, "Failed transactions retrieved successfully"));

        } catch (Exception e) {
            logger.error("Error retrieving failed transactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, null, "Failed to retrieve failed transactions: " + e.getMessage()));
        }
    }

    // Helper methods for calculating metrics

    private Map<String, Object> calculateSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // Total users by role
        List<User> allUsers = userService.findAllUsers();
        long totalUsers = allUsers.size();
        long adminUsers = allUsers.stream().filter(user -> hasRole(user, "ADMIN")).count();
        long customerUsers = allUsers.stream()
                .filter(user -> hasRole(user, "CUSTOMER") || hasRole(user, "CUSTOMER_USER")).count();
        long staffUsers = allUsers.stream().filter(user -> hasRole(user, "BANK_STAFF")).count();
        long auditorUsers = allUsers.stream().filter(user -> hasRole(user, "AUDITOR")).count();

        // User status breakdown
        long activeUsers = allUsers.stream().filter(user -> user.getLockedUntil() == null ||
                user.getLockedUntil().isBefore(LocalDateTime.now())).count();
        long lockedUsers = totalUsers - activeUsers;

        metrics.put("total_users", totalUsers);
        metrics.put("admin_users", adminUsers);
        metrics.put("customer_users", customerUsers);
        metrics.put("staff_users", staffUsers);
        metrics.put("auditor_users", auditorUsers);
        metrics.put("active_users", activeUsers);
        metrics.put("locked_users", lockedUsers);

        // System health indicators
        metrics.put("system_health", calculateSystemHealth());
        metrics.put("last_updated", LocalDateTime.now());

        return metrics;
    }

    private Map<String, Object> calculateCustomerStatistics() {
        Map<String, Object> stats = new HashMap<>();

        List<User> allUsers = userService.findAllUsers();
        List<User> customers = allUsers.stream()
                .filter(user -> hasRole(user, "CUSTOMER") || hasRole(user, "CUSTOMER_USER"))
                .toList();

        // Customer registration trends
        long newCustomersThisMonth = customers.stream()
                .filter(user -> user.getCreatedAt() != null &&
                        user.getCreatedAt().isAfter(LocalDateTime.now().minusMonths(1)))
                .count();

        long newCustomersThisWeek = customers.stream()
                .filter(user -> user.getCreatedAt() != null &&
                        user.getCreatedAt().isAfter(LocalDateTime.now().minusWeeks(1)))
                .count();

        stats.put("total_customers", customers.size());
        stats.put("new_this_month", newCustomersThisMonth);
        stats.put("new_this_week", newCustomersThisWeek);
        stats.put("active_customers", customers.stream()
                .filter(user -> user.getLockedUntil() == null ||
                        user.getLockedUntil().isBefore(LocalDateTime.now()))
                .count());

        return stats;
    }

    @Autowired
    private com.bank.authentication.feignclient.TransactionService transactionService;

    private Map<String, Object> calculateTransactionStatistics() {
        try {
            return transactionService.getTransactionMetrics();
        } catch (Exception e) {
            logger.error("Error fetching transaction metrics", e);
            // Return mock data for now to isolate the issue
            Map<String, Object> mockData = new HashMap<>();
            mockData.put("total_transactions", 1250);
            mockData.put("successful_transactions", 1200);
            mockData.put("failed_transactions", 50);
            mockData.put("total_amount", 2500000.00);
            mockData.put("status", "Service Temporarily Unavailable - Showing Mock Data");
            return mockData;
        }
    }

    private Map<String, Object> calculateFailedTransactions() {
        try {
            return transactionService.getFailedTransactionMetrics();
        } catch (Exception e) {
            logger.error("Error fetching failed transaction metrics", e);
            // Return mock data for now to isolate the issue
            Map<String, Object> mockData = new HashMap<>();
            mockData.put("failed_count_24h", 15);
            mockData.put("failure_rate", 2.5);
            mockData.put("common_failure_reasons", "Insufficient funds, Invalid account");
            mockData.put("status", "Service Temporarily Unavailable - Showing Mock Data");
            return mockData;
        }
    }

    private Map<String, Object> calculateSystemHealth() {
        Map<String, Object> health = new HashMap<>();

        List<User> allUsers = userService.findAllUsers();
        long totalUsers = allUsers.size();
        long lockedUsers = allUsers.stream()
                .filter(user -> user.getLockedUntil() != null &&
                        user.getLockedUntil().isAfter(LocalDateTime.now()))
                .count();

        double lockRate = totalUsers > 0 ? (double) lockedUsers / totalUsers * 100 : 0;

        String status;
        if (lockRate > 10) {
            status = "CRITICAL";
        } else if (lockRate > 5) {
            status = "WARNING";
        } else {
            status = "HEALTHY";
        }

        health.put("status", status);
        health.put("lock_rate", lockRate);
        health.put("total_users", totalUsers);
        health.put("locked_users", lockedUsers);

        return health;
    }

    private boolean hasRole(User user, String roleName) {
        return user.getRoles() != null &&
                user.getRoles().stream().anyMatch(role -> roleName.equals(role.getRoleName()));
    }
}
