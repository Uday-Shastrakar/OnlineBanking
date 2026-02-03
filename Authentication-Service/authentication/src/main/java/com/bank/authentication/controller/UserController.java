package com.bank.authentication.controller;

import com.bank.authentication.audit.AuditLogger;
import com.bank.authentication.dto.AccountManagerRequestDTO;
import com.bank.authentication.dto.CustomerCredentialRequestDTO;
import com.bank.authentication.dto.UserCreationRequestDto;
import com.bank.authentication.dto.UserDetailDto;
import com.bank.authentication.event.UserRegisteredEvent;
import com.bank.authentication.model.User;
import com.bank.authentication.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Slf4j
public class UserController {
    private final AuditLogger auditLogger;
    @Autowired
    private UserService userService;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    public UserController(AuditLogger auditLogger) {
        this.auditLogger = auditLogger;
    }

    @PostMapping("/create")
    public ResponseEntity<UserDetailDto> createUser(@RequestBody UserCreationRequestDto request,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        UserDetailDto createdUser = userService.createUser(user, request.getRoleNames(), request.getPermissionNames());
        auditLogger.logAction("USER_REGISTERED", request.getUsername());
        logger.debug("bank-correlation-id found: {} ", correlationId);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PostMapping("/customer")
    public ResponseEntity<UserDetailDto> createCustomerUser(@RequestBody CustomerCredentialRequestDTO request,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        
        logger.debug("bank-correlation-id found: {} ", correlationId);
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());

        UserDetailDto createdUser = null;
        
        try {
            // Step 1: Create user in Authentication Service
            createdUser = userService.createUser(user, request.getRoleNames(), request.getPermissionNames());
            logger.info("Successfully created user with ID: {} for username: {}", createdUser.getUserId(), user.getUsername());

            // Step 2: Prepare customer DTO with only customer-specific data and the user ID
            request.getCreateCustomerDto().setUserId(createdUser.getUserId());
            // Note: firstName, lastName, email, phoneNumber are already in createCustomerDto from frontend
            // No need to duplicate them here

            // Step 3: Create customer via Feign client
            try {
                userService.createCustomerUser(request.getCreateCustomerDto(), correlationId);
                logger.info("Successfully created customer for user ID: {}", createdUser.getUserId());
                
                auditLogger.logAction("CUSTOMER_REGISTERED", user.getUsername());

                // Step 4: Publish Event to Kafka only after successful customer creation
                try {
                    UserRegisteredEvent event = new UserRegisteredEvent(createdUser.getUserId(), createdUser.getEmail(),
                            createdUser.getFirstName(), createdUser.getLastName());
                    
                    // Add type information to Kafka headers for proper deserialization
                    kafkaTemplate.send("user-registered", event);
                    logger.info("Published UserRegisteredEvent for user: {}", user.getUsername());
                } catch (Exception e) {
                    logger.error("Failed to publish UserRegisteredEvent", e);
                    // Don't fail the request, just log the error
                }

                return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
                
            } catch (Exception customerCreationException) {
                logger.error("Failed to create customer for user ID: {}. Rolling back user creation.", createdUser.getUserId(), customerCreationException);
                
                // Step 5: Rollback - Delete the user if customer creation fails
                try {
                    userService.deleteUserById(createdUser.getUserId());
                    logger.info("Successfully rolled back user creation for username: {}", user.getUsername());
                } catch (Exception userDeletionException) {
                    logger.error("Failed to rollback user creation for username: {}. Manual cleanup required.", user.getUsername(), userDeletionException);
                }
                
                auditLogger.logAction("CUSTOMER_REGISTRATION_FAILED", user.getUsername());
                throw new RuntimeException("Customer creation failed. User registration has been rolled back: " + customerCreationException.getMessage(), customerCreationException);
            }
            
        } catch (Exception e) {
            logger.error("Failed to create customer user: {}", user.getUsername(), e);
            auditLogger.logAction("CUSTOMER_REGISTRATION_FAILED", user.getUsername());
            
            // Check if it's a username already exists error
            if (e.getMessage() != null && e.getMessage().contains("already exists")) {
                return new ResponseEntity<>(HttpStatus.CONFLICT); // 409 Conflict
            }
            
            throw new RuntimeException("Customer registration failed: " + e.getMessage(), e);
        }
    }

    @PostMapping("/account-manager")
    public ResponseEntity<UserDetailDto> createCustomerUser(@RequestBody AccountManagerRequestDTO request,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());

        UserDetailDto createdUserOfAccount = userService.createUser(user, request.getRoleNames(),
                request.getPermissionNames());

        request.setUserId(createdUserOfAccount.getUserId());

        userService.createAccountManagerUser(request);
        logger.debug("bank-correlation-id found: {} ", correlationId);
        auditLogger.logAction("ACCOUNT_MANAGER_REGISTERED", user.getUsername());
        return new ResponseEntity<>(createdUserOfAccount, HttpStatus.CREATED);
    }

    @GetMapping("/get")
    public ResponseEntity<List<UserDetailDto>> getAllUsers(
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        List<UserDetailDto> userDetails = userService.getAllUsers();
        logger.debug("bank-correlation-id found: {} ", correlationId);
        return new ResponseEntity<>(userDetails, HttpStatus.OK);
    }

    @GetMapping("/get-summary")
    public ResponseEntity<List<java.util.Map<String, Object>>> getAllUsersSummary(
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        try {
            List<User> users = userService.findAllUsers();
            List<java.util.Map<String, Object>> summaryList = new java.util.ArrayList<>();
            
            for (User user : users) {
                java.util.Map<String, Object> summary = new java.util.HashMap<>();
                summary.put("userId", user.getUserId());
                summary.put("userName", user.getUsername());
                summary.put("email", user.getEmail());
                
                // Extract primary role (first role or default to USER)
                String primaryRole = "USER";
                if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                    primaryRole = user.getRoles().iterator().next().getRoleName();
                }
                summary.put("role", primaryRole);
                
                // Determine status based on lockedUntil
                String status = "ACTIVE";
                if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(java.time.LocalDateTime.now())) {
                    status = "LOCKED";
                }
                summary.put("status", status);
                
                summaryList.add(summary);
            }
            
            logger.debug("bank-correlation-id found: {} ", correlationId);
            return new ResponseEntity<>(summaryList, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error fetching user summary", e);
            return new ResponseEntity<>(java.util.Collections.emptyList(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{userId}/exists")
    public ResponseEntity<java.util.Map<String, Object>> checkUserExists(@PathVariable Long userId,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        logger.debug("bank-correlation-id found: {} ", correlationId);
        
        boolean exists = userService.findById(userId).isPresent();
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("exists", exists);
        response.put("userId", userId);
        
        if (exists) {
            response.put("message", "User exists");
            logger.debug("User {} exists", userId);
        } else {
            response.put("message", "User does not exist");
            logger.debug("User {} does not exist", userId);
        }
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<java.util.Map<String, Object>> getUserById(@PathVariable Long userId,
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        logger.debug("bank-correlation-id found: {} ", correlationId);
        
        java.util.Optional<User> userOpt = userService.findById(userId);
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            response.put("userId", user.getUserId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("phoneNumber", user.getPhoneNumber());
            response.put("exists", true);
            logger.debug("Retrieved user details for userId: {}", userId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            response.put("exists", false);
            response.put("message", "User not found");
            logger.debug("User not found for userId: {}", userId);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

}
