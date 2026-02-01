package com.bank.audit.api;

import com.bank.audit.model.AuditEvent;
import com.bank.audit.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private AuditService auditService;

    @Autowired
    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    public void setAuditService(AuditService auditService) {
        this.auditService = auditService;
    }

    private static final List<String> ADMIN_PERMISSIONS = Arrays.asList("ADMIN_ALL", "ADMIN", "ROLE_ADMIN");
    private static final List<String> AUDITOR_PERMISSIONS = Arrays.asList("AUDIT_READ", "ADMIN_ALL", "ADMIN",
            "ROLE_ADMIN");

    @GetMapping("/all")
    public ResponseEntity<?> getAllLogs(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Permissions", required = false) String permissions,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String userIdFilter) {

        // Validate required headers
        if (userId == null || requestId == null) {
            return ResponseEntity.badRequest().body("Missing required headers: X-User-Id, X-Request-Id");
        }
        if (permissions == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Missing permissions");
        }

        // Check permissions
        if (!hasRequiredPermission(permissions, ADMIN_PERMISSIONS)
                && !hasRequiredPermission(permissions, AUDITOR_PERMISSIONS)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Insufficient permissions");
        }

        try {
            List<AuditEvent> logs = auditService.getAllLogs();
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
        }
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Permissions", required = false) String permissions,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId) {

        // Validate required headers
        if (userId == null || requestId == null) {
            return ResponseEntity.badRequest().body("Missing required headers: X-User-Id, X-Request-Id");
        }
        if (permissions == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Missing permissions");
        }

        // Check permissions
        if (!hasRequiredPermission(permissions, ADMIN_PERMISSIONS)
                && !hasRequiredPermission(permissions, AUDITOR_PERMISSIONS)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Insufficient permissions");
        }

        try {
            Map<String, Object> metrics = auditService.getSystemMetrics();
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
        }
    }

    private boolean hasRequiredPermission(String userPermissions, List<String> requiredPermissions) {
        return requiredPermissions.stream().anyMatch(userPermissions::contains);
    }
}
