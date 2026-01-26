package com.bank.authentication.controller;

import com.bank.authentication.audit.AuditLogger;
import com.bank.authentication.model.UserCustomerMapping;
import com.bank.authentication.service.UserCustomerMappingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user-customer-mappings")
public class UserCustomerMappingController {
    private final AuditLogger auditLogger;
    private static final Logger logger = LoggerFactory.getLogger(UserCustomerMappingController.class);

    @Autowired
    private UserCustomerMappingService mappingService;

    public UserCustomerMappingController(AuditLogger auditLogger) {
        this.auditLogger = auditLogger;
    }

    @PostMapping("/create")
    public ResponseEntity<UserCustomerMapping> createMapping(
            @RequestParam Long userId,
            @RequestParam Long customerId,
            @RequestParam UserCustomerMapping.RelationshipType relationshipType,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        
        try {
            UserCustomerMapping mapping = mappingService.createMapping(userId, customerId, relationshipType);
            auditLogger.logAction("USER_CUSTOMER_MAPPING_CREATED", "userId=" + userId + ",customerId=" + customerId);
            logger.debug("Created user-customer mapping: userId={}, customerId={}, correlationId={}", 
                userId, customerId, correlationId);
            return new ResponseEntity<>(mapping, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to create user-customer mapping: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserCustomerMapping>> getMappingsByUserId(
            @PathVariable Long userId,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        
        List<UserCustomerMapping> mappings = mappingService.getActiveMappingsByUserId(userId);
        auditLogger.logAction("USER_CUSTOMER_MAPPINGS_RETRIEVED", "userId=" + userId);
        logger.debug("Retrieved {} mappings for userId={}, correlationId={}", 
            mappings.size(), userId, correlationId);
        return ResponseEntity.ok(mappings);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<UserCustomerMapping>> getMappingsByCustomerId(
            @PathVariable Long customerId,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        
        List<UserCustomerMapping> mappings = mappingService.getActiveMappingsByCustomerId(customerId);
        auditLogger.logAction("USER_CUSTOMER_MAPPINGS_RETRIEVED", "customerId=" + customerId);
        logger.debug("Retrieved {} mappings for customerId={}, correlationId={}", 
            mappings.size(), customerId, correlationId);
        return ResponseEntity.ok(mappings);
    }

    @GetMapping("/check-access")
    public ResponseEntity<Boolean> checkAccess(
            @RequestParam Long userId,
            @RequestParam Long customerId,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        
        boolean hasAccess = mappingService.hasAccessToCustomer(userId, customerId);
        auditLogger.logAction("USER_CUSTOMER_ACCESS_CHECKED", "userId=" + userId + ",customerId=" + customerId);
        logger.debug("Access check: userId={}, customerId={}, hasAccess={}, correlationId={}", 
            userId, customerId, hasAccess, correlationId);
        return ResponseEntity.ok(hasAccess);
    }

    @PutMapping("/{mappingId}/deactivate")
    public ResponseEntity<UserCustomerMapping> deactivateMapping(
            @PathVariable Long mappingId,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        
        try {
            UserCustomerMapping mapping = mappingService.deactivateMapping(mappingId);
            auditLogger.logAction("USER_CUSTOMER_MAPPING_DEACTIVATED", "mappingId=" + mappingId);
            logger.debug("Deactivated mapping: mappingId={}, correlationId={}", mappingId, correlationId);
            return ResponseEntity.ok(mapping);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to deactivate mapping: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
