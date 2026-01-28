package com.bank.authentication.service;

import com.bank.authentication.audit.AuditLogger;
import com.bank.authentication.dto.ApiResponse;
import com.bank.authentication.dto.LoginRequestDto;
import com.bank.authentication.dto.LoginResponseDto;
import com.bank.authentication.extenalservice.EmailService;
import com.bank.authentication.kafka.AdminAuditProducer;
import com.bank.authentication.model.PasswordResetToken;
import com.bank.authentication.model.Session;
import com.bank.authentication.model.User;
import com.bank.authentication.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.naming.AuthenticationException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserService userService;
    private final PasswordResetTokenService passwordResetTokenService;
    private final SessionService sessionService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsServiceImpl userDetailsService;
    private final AdminAuditProducer adminAuditProducer;
    private final AuditLogger auditLogger;

    @Autowired
    public AuthService(AuthenticationManager authenticationManager, JwtUtils jwtUtils, UserService userService,
            PasswordResetTokenService passwordResetTokenService, SessionService sessionService,
            EmailService emailService, PasswordEncoder passwordEncoder, UserDetailsServiceImpl userDetailsService,
            AdminAuditProducer adminAuditProducer, AuditLogger auditLogger) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userService = userService;
        this.passwordResetTokenService = passwordResetTokenService;
        this.sessionService = sessionService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.userDetailsService = userDetailsService;
        this.adminAuditProducer = adminAuditProducer;
        this.auditLogger = auditLogger;
    }

    public LoginResponseDto authenticateUser(LoginRequestDto loginRequest) throws AuthenticationException {
        User user = (User) userDetailsService.loadUserByUsername(loginRequest.getUsername());

        // Validate user status
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(java.time.LocalDateTime.now())) {
            throw new org.springframework.security.authentication.LockedException("Account is locked. Please try again later.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            
            // Check if user has ADMIN role for admin-specific token
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ADMIN"));
            
            String jwtToken;
            String sessionId;
            
            if (isAdmin) {
                // Generate short-lived admin token (15 minutes)
                jwtToken = jwtUtils.generateAdminToken(userDetails);
                sessionId = extractSessionIdFromToken(jwtToken);
                
                // Emit admin login success event to Kafka
                adminAuditProducer.emitAdminLoginSuccess(user.getUserId(), user.getUsername(), sessionId);
                
                auditLogger.logAction("ADMIN_LOGIN_SUCCESS", user.getUsername());
            } else {
                // Generate regular user token
                jwtToken = jwtUtils.generateToken(userDetails);
                sessionId = null;
                
                auditLogger.logAction("USER_LOGIN_SUCCESS", user.getUsername());
            }

            // Authentication Succeeded: Reset attempts
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            userService.save(user);

            createSession(user, jwtToken);

            List<String> authorities = userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            return new LoginResponseDto(userDetails.getUsername(), authorities, jwtToken, user.getUserId(),
                    user.getEmail(), user.getPhoneNumber(), user.getFirstName(), user.getLastName());
                    
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            // Authentication Failed: Increment attempts
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            if (user.getFailedLoginAttempts() >= 5) {
                user.setLockedUntil(java.time.LocalDateTime.now().plusMinutes(15));
                
                // Log account lockout event
                auditLogger.logAction("ACCOUNT_LOCKED", user.getUsername());
            }
            userService.save(user);
            
            auditLogger.logAction("LOGIN_FAILED", user.getUsername());
            throw e;
        } catch (org.springframework.security.authentication.LockedException e) {
            auditLogger.logAction("LOGIN_ATTEMPT_LOCKED_ACCOUNT", user.getUsername());
            throw e;
        }
    }
    
    private String extractSessionIdFromToken(String token) {
        try {
            return jwtUtils.extractAllClaims(token).get("session_id", String.class);
        } catch (Exception e) {
            return java.util.UUID.randomUUID().toString();
        }
    }

    public ApiResponse<String> requestPasswordReset(String email) {
        User user = userDetailsService.loadUserByEmail(email);
        if (user != null) {
            PasswordResetToken passwordResetToken = createPasswordResetToken(user);
            emailService.sendOtpEmail(email, passwordResetToken.getToken());
            return new ApiResponse<>(true, "OTP sent to email", null);
        }
        return new ApiResponse<>(false, null, "User not found");
    }

    public ApiResponse<String> verifyOtp(String otp) {
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenService.getToken(otp);
        if (tokenOpt.isPresent() && tokenOpt.get().getExpiration().isAfter(LocalDateTime.now())) {
            return new ApiResponse<>(true, "OTP verified successfully", null);
        }
        return new ApiResponse<>(false, null, "Invalid or expired OTP");
    }

    public ApiResponse<String> resetPassword(String otp, String newPassword) {
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenService.getToken(otp);
        if (tokenOpt.isPresent() && tokenOpt.get().getExpiration().isAfter(LocalDateTime.now())) {
            User user = tokenOpt.get().getUser();
            if (user != null) {
                user.setPassword(passwordEncoder.encode(newPassword));
                userService.save(user);
                passwordResetTokenService.deleteToken(tokenOpt.get().getTokenId());
                return new ApiResponse<>(true, "Password reset successfully", null);
            }
        }
        return new ApiResponse<>(false, null, "Invalid or expired OTP");
    }

    private void createSession(User user, String jwtToken) {
        Session session = new Session();
        session.setUser(user);
        session.setToken(jwtToken);
        session.setCreatedAt(LocalDateTime.now());
        session.setLastAccessed(LocalDateTime.now());
        session.setExpiration(LocalDateTime.now().plusHours(1));
        sessionService.createSession(session);
    }

    private PasswordResetToken createPasswordResetToken(User user) {
        String otp = generateOtp();
        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setUser(user);
        passwordResetToken.setToken(otp);
        passwordResetToken.setCreatedAt(LocalDateTime.now());
        passwordResetToken.setExpiration(LocalDateTime.now().plusMinutes(15));
        return passwordResetTokenService.save(passwordResetToken);
    }

    private String generateOtp() {
        Random random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000); // Generates a 6-digit OTP
        return String.valueOf(otp);
        // return "123456";
    }
}
