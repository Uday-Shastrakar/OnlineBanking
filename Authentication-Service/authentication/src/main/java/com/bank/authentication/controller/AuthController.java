package com.bank.authentication.controller;

import com.bank.authentication.audit.AuditLogger;
import com.bank.authentication.dto.ApiResponse;
import com.bank.authentication.dto.LoginRequestDto;
import com.bank.authentication.dto.LoginResponseDto;
import com.bank.authentication.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuditLogger auditLogger;
    private final AuthService authService;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    public AuthController(AuditLogger auditLogger, AuthService authService) {
        this.auditLogger = auditLogger;
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> authenticateUser(
            @RequestHeader(value = "bank-correlation-id", required = false) String correlationId,
            @RequestBody LoginRequestDto loginRequest) {
        try {
            LoginResponseDto response = authService.authenticateUser(loginRequest);
            auditLogger.logAction("USER_LOGIN_ATTEMPT",loginRequest.getUsername());
            logger.debug("bank-correlation-id found: {} ", correlationId);
            return ResponseEntity.ok(new ApiResponse<>(true, response, "Login Successfully"));
        } catch (AuthenticationException | javax.naming.AuthenticationException e) {
            logger.debug("bank-correlation-id found: {} ", correlationId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse<>(false, null, "Bad Credentials"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> requestPasswordReset(@RequestParam String email, @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        ApiResponse<String> response = authService.requestPasswordReset(email);
        logger.debug("bank-correlation-id found: {} ", correlationId);
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "If the email is registered, an OTP has been sent", null));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<String>> verifyOtp(@RequestParam String otp, @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        ApiResponse<String> response = authService.verifyOtp(otp);
        logger.debug("bank-correlation-id found: {} ", correlationId);
        return ResponseEntity.status(response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST).body(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestParam String otp, @RequestParam String newPassword, @RequestHeader(value = "bank-correlation-id", required = false) String correlationId) {
        ApiResponse<String> response = authService.resetPassword(otp, newPassword);
        logger.debug("bank-correlation-id found: {} ", correlationId);
        return ResponseEntity.status(response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST).body(response);
    }
}
