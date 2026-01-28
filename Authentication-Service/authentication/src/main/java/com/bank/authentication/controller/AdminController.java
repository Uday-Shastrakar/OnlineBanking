package com.bank.authentication.controller;

import com.bank.authentication.audit.AuditLogger;
import com.bank.authentication.dto.ApiResponse;
import com.bank.authentication.kafka.AdminAuditProducer;
import com.bank.authentication.model.User;
import com.bank.authentication.service.UserService;
import com.bank.authentication.util.JwtUtils;
import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AdminAuditProducer adminAuditProducer;

    @Autowired
    private AuditLogger auditLogger;

    /**
     * STEP 2: ADMIN SESSION INITIALIZATION
     * Expose /admin/me endpoint with RBAC enforcement
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminSession(
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId,
            Authentication authentication) {
        
        try {
            String username = authentication.getName();
            User user = userService.findByUsername(username);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, null, "Admin user not found"));
            }

            // Extract JWT claims for additional session info
            String token = getTokenFromRequest();
            Claims claims = jwtUtils.extractAllClaims(token);
            
            Map<String, Object> sessionData = new HashMap<>();
            sessionData.put("user_id", user.getUserId());
            sessionData.put("username", user.getUsername());
            sessionData.put("email", user.getEmail());
            sessionData.put("roles", claims.get("roles", List.class));
            sessionData.put("permissions", claims.get("permissions", List.class));
            sessionData.put("token_type", claims.get("token_type", String.class));
            sessionData.put("session_id", claims.get("session_id", String.class));
            sessionData.put("expiration", claims.getExpiration());
            sessionData.put("last_login", user.getLastLogin());
            sessionData.put("failed_attempts", user.getFailedLoginAttempts());
            sessionData.put("locked_until", user.getLockedUntil());

            // Emit dashboard access event
            String sessionId = (String) claims.get("session_id");
            adminAuditProducer.emitDashboardAccess(user.getUserId(), user.getUsername(), "ADMIN_SESSION");
            
            auditLogger.logAction("ADMIN_SESSION_ACCESS", username);

            return ResponseEntity.ok(new ApiResponse<>(true, sessionData, "Admin session retrieved successfully"));

        } catch (Exception e) {
            logger.error("Error retrieving admin session", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, null, "Failed to retrieve admin session"));
        }
    }

    /**
     * STEP 4: USER MANAGEMENT - View system users
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllUsers(
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId,
            Authentication authentication) {
        
        try {
            String adminUsername = authentication.getName();
            List<User> users = userService.findAllUsers();
            
            // Convert to safe response format (exclude sensitive data)
            List<Map<String, Object>> userSummaries = users.stream()
                    .map(this::createUserSummary)
                    .toList();

            // Emit dashboard access event
            User adminUser = userService.findByUsername(adminUsername);
            adminAuditProducer.emitDashboardAccess(adminUser.getUserId(), adminUsername, "USER_MANAGEMENT");
            
            auditLogger.logAction("ADMIN_USERS_VIEW", adminUsername);

            return ResponseEntity.ok(new ApiResponse<>(true, userSummaries, "Users retrieved successfully"));

        } catch (Exception e) {
            logger.error("Error retrieving users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, null, "Failed to retrieve users"));
        }
    }

    /**
     * STEP 4: USER MANAGEMENT - Lock user account
     */
    @PostMapping("/users/{userId}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> lockUser(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId,
            Authentication authentication) {
        
        try {
            String adminUsername = authentication.getName();
            String reason = request.getOrDefault("reason", "Administrative lock");
            
            User user = userService.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, null, "User not found"));
            }

            // Prevent admin from locking themselves
            if (user.getUsername().equals(adminUsername)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(false, null, "Cannot lock your own account"));
            }

            user.setLockedUntil(java.time.LocalDateTime.now().plusYears(100)); // Essentially permanent
            userService.save(user);

            // Emit user management action event
            User adminUser = userService.findByUsername(adminUsername);
            adminAuditProducer.emitUserManagementAction(
                adminUser.getUserId(), adminUsername, userId, "LOCK_USER", reason);
            
            auditLogger.logAction("ADMIN_USER_LOCKED", adminUsername + " locked user " + user.getUsername());

            return ResponseEntity.ok(new ApiResponse<>(true, "User locked successfully", "User locked successfully"));

        } catch (Exception e) {
            logger.error("Error locking user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, null, "Failed to lock user"));
        }
    }

    /**
     * STEP 4: USER MANAGEMENT - Unlock user account
     */
    @PostMapping("/users/{userId}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> unlockUser(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId,
            Authentication authentication) {
        
        try {
            String adminUsername = authentication.getName();
            String reason = request.getOrDefault("reason", "Administrative unlock");
            
            User user = userService.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, null, "User not found"));
            }

            user.setLockedUntil(null);
            user.setFailedLoginAttempts(0);
            userService.save(user);

            // Emit user management action event
            User adminUser = userService.findByUsername(adminUsername);
            adminAuditProducer.emitUserManagementAction(
                adminUser.getUserId(), adminUsername, userId, "UNLOCK_USER", reason);
            
            auditLogger.logAction("ADMIN_USER_UNLOCKED", adminUsername + " unlocked user " + user.getUsername());

            return ResponseEntity.ok(new ApiResponse<>(true, "User unlocked successfully", "User unlocked successfully"));

        } catch (Exception e) {
            logger.error("Error unlocking user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, null, "Failed to unlock user"));
        }
    }

    /**
     * STEP 4: USER MANAGEMENT - Force password reset
     */
    @PostMapping("/users/{userId}/force-password-reset")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> forcePasswordReset(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId,
            Authentication authentication) {
        
        try {
            String adminUsername = authentication.getName();
            String reason = request.getOrDefault("reason", "Security requirement");
            
            User user = userService.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, null, "User not found"));
            }

            // Force password reset by setting a temporary password that must be changed
            String tempPassword = java.util.UUID.randomUUID().toString();
            user.setPassword(passwordEncoder.encode(tempPassword));
            user.setPasswordChangedAt(null); // Force password change on next login
            userService.save(user);

            // Emit user management action event
            User adminUser = userService.findByUsername(adminUsername);
            adminAuditProducer.emitUserManagementAction(
                adminUser.getUserId(), adminUsername, userId, "FORCE_PASSWORD_RESET", reason);
            
            auditLogger.logAction("ADMIN_FORCE_PASSWORD_RESET", adminUsername + " forced password reset for " + user.getUsername());

            return ResponseEntity.ok(new ApiResponse<>(true, "Password reset forced successfully", "Password reset forced successfully"));

        } catch (Exception e) {
            logger.error("Error forcing password reset", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, null, "Failed to force password reset"));
        }
    }

    /**
     * STEP 8: ADMIN LOGOUT
     */
    @PostMapping("/logout")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> adminLogout(
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId,
            Authentication authentication) {
        
        try {
            String username = authentication.getName();
            User user = userService.findByUsername(username);
            
            if (user != null) {
                // Extract session info from current token
                String token = getTokenFromRequest();
                Claims claims = jwtUtils.extractAllClaims(token);
                String sessionId = (String) claims.get("session_id");
                
                // Emit admin logout event
                adminAuditProducer.emitAdminLogout(user.getUserId(), user.getUsername(), sessionId);
                
                auditLogger.logAction("ADMIN_LOGOUT", username);
            }

            // Clear security context
            SecurityContextHolder.clearContext();

            return ResponseEntity.ok(new ApiResponse<>(true, "Admin logged out successfully", "Admin logged out successfully"));

        } catch (Exception e) {
            logger.error("Error during admin logout", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, null, "Failed to logout"));
        }
    }

    // Helper methods
    private Map<String, Object> createUserSummary(User user) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("user_id", user.getUserId());
        summary.put("username", user.getUsername());
        summary.put("email", user.getEmail());
        summary.put("first_name", user.getFirstName());
        summary.put("last_name", user.getLastName());
        summary.put("phone_number", user.getPhoneNumber());
        summary.put("roles", user.getRoles());
        summary.put("permissions", user.getPermissions());
        summary.put("status", user.getLockedUntil() != null && user.getLockedUntil().isAfter(java.time.LocalDateTime.now()) ? "LOCKED" : "ACTIVE");
        summary.put("failed_attempts", user.getFailedLoginAttempts());
        summary.put("locked_until", user.getLockedUntil());
        summary.put("created_at", user.getCreatedAt());
        summary.put("last_login", user.getLastLogin());
        // Note: Excluding password and other sensitive data
        return summary;
    }

    private String getTokenFromRequest() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getCredentials() instanceof String) {
            return (String) auth.getCredentials();
        }
        return null;
    }

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
}
