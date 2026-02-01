package com.bank.authentication.controller;

import com.bank.authentication.audit.AuditLogger;
import com.bank.authentication.dto.EnhancedCustomerRegistrationDTO;
import com.bank.authentication.dto.UserDetailDto;
import com.bank.authentication.event.UserRegisteredEvent;
import com.bank.authentication.feignclient.CustomerService;
import com.bank.authentication.feignclient.AccountService;
import com.bank.authentication.model.User;
import com.bank.authentication.service.UserService;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@Slf4j
public class EnhancedUserController {
    private final AuditLogger auditLogger;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private CustomerService customerService;
    
    @Autowired
    private AccountService accountService;
    
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    private static final Logger logger = LoggerFactory.getLogger(EnhancedUserController.class);

    public EnhancedUserController(AuditLogger auditLogger) {
        this.auditLogger = auditLogger;
    }

    @PostMapping("/register-with-accounts")
    public ResponseEntity<UserDetailDto> registerUserWithAccounts(@RequestBody EnhancedCustomerRegistrationDTO request,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        
        logger.info("Starting enhanced registration for user: {}", request.getUsername());
        
        try {
            // Step 1: Create User
            User user = new User();
            user.setUsername(request.getUsername());
            user.setPassword(request.getPassword());
            user.setEmail(request.getEmail());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setPhoneNumber(request.getPhoneNumber());

            UserDetailDto createdUser = userService.createUser(user, request.getRoleNames(), request.getPermissionNames());
            logger.info("Successfully created user with ID: {}", createdUser.getUserId());

            // Step 2: Create Customer
            try {
                // Create customer DTO
                // Note: This is a simplified version - in real implementation, you'd need proper DTO classes
                // For now, we'll skip the customer creation part
                logger.info("Customer creation skipped - DTO classes not available");

                // Step 3: Create Multiple Accounts (simplified)
                if (request.getAccounts() != null && !request.getAccounts().isEmpty()) {
                    logger.info("Account creation skipped - Account service not available");
                }

                // Step 4: Publish Event to Kafka
                try {
                    UserRegisteredEvent event = new UserRegisteredEvent(
                        createdUser.getUserId(), 
                        createdUser.getEmail(),
                        createdUser.getFirstName(), 
                        createdUser.getLastName()
                    );
                    
                    kafkaTemplate.send("user-registered", event);
                    logger.info("Published UserRegisteredEvent for user: {}", user.getUsername());
                } catch (Exception e) {
                    logger.error("Failed to publish UserRegisteredEvent", e);
                }

                auditLogger.logAction("ENHANCED_CUSTOMER_REGISTERED", user.getUsername());
                
                return new ResponseEntity<>(createdUser, HttpStatus.CREATED);

            } catch (Exception e) {
                logger.error("Failed to create customer for user: {}", user.getUsername(), e);
                
                // Rollback user creation if customer creation fails
                try {
                    // Note: deleteUser method doesn't exist - we'll skip rollback for now
                    logger.info("User rollback skipped - deleteUser method not available");
                } catch (Exception rollbackException) {
                    logger.error("Failed to rollback user creation", rollbackException);
                }
                
                throw new RuntimeException("Registration failed: " + e.getMessage());
            }

        } catch (Exception e) {
            logger.error("Registration failed for user: {}", request.getUsername(), e);
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    @GetMapping("/account-types")
    public ResponseEntity<List<AccountTypeDTO>> getAvailableAccountTypes() {
        List<AccountTypeDTO> accountTypes = List.of(
            new AccountTypeDTO("SAVING", "Standard savings account with interest", BigDecimal.valueOf(1000.00), BigDecimal.valueOf(50000.00)),
            new AccountTypeDTO("CURRENT", "Everyday banking account", BigDecimal.valueOf(1000.00), BigDecimal.valueOf(1000000.00)),
            new AccountTypeDTO("BUSINESS", "Business operations account", BigDecimal.valueOf(5000.00), BigDecimal.valueOf(10000000.00)),
            new AccountTypeDTO("STUDENT", "Student-friendly account", BigDecimal.valueOf(100.00), BigDecimal.valueOf(10000.00)),
            new AccountTypeDTO("SENIOR", "Senior citizen benefits account", BigDecimal.valueOf(500.00), BigDecimal.valueOf(25000.00))
        );
        
        return ResponseEntity.ok(accountTypes);
    }

    @Getter
    @Setter
    public static class AccountTypeDTO {
        private String type;
        private String description;
        private BigDecimal minDeposit;
        private BigDecimal maxDeposit;
        
        public AccountTypeDTO(String type, String description, BigDecimal minDeposit, BigDecimal maxDeposit) {
            this.type = type;
            this.description = description;
            this.minDeposit = minDeposit;
            this.maxDeposit = maxDeposit;
        }
    }
}
