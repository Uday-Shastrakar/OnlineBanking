package com.bank.authentication.controller;

import com.bank.authentication.audit.AuditLogger;
import com.bank.authentication.dto.AccountManagerRequestDTO;
import com.bank.authentication.dto.CustomerCredentialRequestDTO;
import com.bank.authentication.dto.UserCreationRequestDto;
import com.bank.authentication.dto.UserDetailDto;
import com.bank.authentication.model.User;
import com.bank.authentication.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final AuditLogger auditLogger;
    @Autowired
    private UserService userService;

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    public UserController(AuditLogger auditLogger) {
        this.auditLogger = auditLogger;
    }

    @PostMapping("/create")
    public ResponseEntity<UserDetailDto> createUser(@RequestBody UserCreationRequestDto request, @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
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
    public ResponseEntity<UserDetailDto> createCustomerUser(@RequestBody CustomerCredentialRequestDTO request, @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());

        UserDetailDto createdUser = userService.createUser(user, request.getRoleNames(), request.getPermissionNames());

        request.getCreateCustomerDto().setUserId(createdUser.getUserId());
        request.getCreateCustomerDto().setEmail(createdUser.getEmail());
        request.getCreateCustomerDto().setFirstName(createdUser.getFirstName());
        request.getCreateCustomerDto().setLastName(createdUser.getLastName());
        request.getCreateCustomerDto().setPhoneNumber(createdUser.getPhoneNumber());

        userService.createCustomerUser(request.getCreateCustomerDto(),correlationId);
        logger.debug("bank-correlation-id found: {} ", correlationId);
        auditLogger.logAction("CUSTOMER_REGISTERED", user.getUsername());
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PostMapping("/account-manager")
    public ResponseEntity<UserDetailDto> createCustomerUser(@RequestBody AccountManagerRequestDTO request, @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());

        UserDetailDto createdUserOfAccount = userService.createUser(user, request.getRoleNames(), request.getPermissionNames());

        request.setUserId(createdUserOfAccount.getUserId());

        userService.createAccountManagerUser(request);
        logger.debug("bank-correlation-id found: {} ", correlationId);
        auditLogger.logAction("ACCOUNT_MANAGER_REGISTERED", user.getUsername());
        return new ResponseEntity<>(createdUserOfAccount, HttpStatus.CREATED);
    }


    @GetMapping("/get")
    public ResponseEntity<List<UserDetailDto>> getAllUsers(@RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        List<UserDetailDto> userDetails = userService.getAllUsers();
        logger.debug("bank-correlation-id found: {} ", correlationId);
        return new ResponseEntity<>(userDetails, HttpStatus.OK);
    }


}
