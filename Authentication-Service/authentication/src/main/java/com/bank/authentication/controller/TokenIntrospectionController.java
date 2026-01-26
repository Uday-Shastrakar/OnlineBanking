package com.bank.authentication.controller;

import com.bank.authentication.dto.TokenIntrospectionRequest;
import com.bank.authentication.dto.TokenValidationResponse;
import com.bank.authentication.dto.TokenRevocationRequest;
import com.bank.authentication.model.User;
import com.bank.authentication.service.JwtTokenService;
import com.bank.authentication.service.TokenRevocationService;
import com.bank.authentication.service.UserService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.server.reactive.ServerHttpRequest;
import reactor.core.publisher.Mono;

import jakarta.validation.Valid;
import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Token Introspection Controller - SINGLE SOURCE OF TRUTH
 * Validates JWT tokens and returns user context
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class TokenIntrospectionController {
    
    private final JwtTokenService jwtTokenService;
    private final UserService userService;
    private final TokenRevocationService tokenRevocationService;
    
    /**
     * Introspect token - ALWAYS called by API Gateway
     * NEVER trust JWT locally - always validate here
     */
    @PostMapping("/introspect")
    public Mono<ResponseEntity<TokenValidationResponse>> introspectToken(
            @Valid @RequestBody TokenIntrospectionRequest request,
            ServerHttpRequest httpRequest) {
        
        log.debug("Token introspection request received from: {}", httpRequest.getRemoteAddress());
        
        return Mono.fromCallable(() -> {
            try {
                String token = request.getToken();
                // 1. Parse JWT without trusting signature first
                var claims = jwtTokenService.extractClaims(token);
                
                // 2. Validate signature
                if (!jwtTokenService.validateToken(token)) {
                    log.warn("Invalid token signature");
                    return ResponseEntity.ok(TokenValidationResponse.invalid("Invalid token signature"));
                }
                
                // 3. Check expiry
                if (isTokenExpired(claims)) {
                    log.warn("Token expired");
                    return ResponseEntity.ok(TokenValidationResponse.invalid("Token expired"));
                }
                
                // 4. Get user and validate status
                String userId = claims.getId();
                Optional<User> userOpt = userService.findById(Long.parseLong(userId));
                
                if (userOpt.isEmpty() || !userOpt.get().isEnabled() || !userOpt.get().isAccountNonLocked()) {
                    log.warn("User not found or inactive: {}", userId);
                    return ResponseEntity.ok(TokenValidationResponse.invalid("User not found or inactive"));
                }
                
                User user = userOpt.get();
                
                // 5. Check token revocation
                if (tokenRevocationService.isRevoked(claims.getId())) {
                    log.warn("Token has been revoked: {}", claims.getId());
                    return ResponseEntity.ok(TokenValidationResponse.invalid("Token has been revoked"));
                }
                
                // 6. Build validation response
                TokenValidationResponse response = TokenValidationResponse.builder()
                        .active(true)
                        .username(user.getUsername())
                        .userId(user.getUserId().toString())
                        .roles(user.getRoles().stream().map(role -> role.getRoleName()).collect(Collectors.toSet()))
                        .permissions(user.getPermissions().stream().map(perm -> perm.getPermissionName()).collect(Collectors.toSet()))
                        .expiresAt(jwtTokenService.extractExpiration(token))
                        .issuedAt(jwtTokenService.extractIssuedAt(token))
                        .tokenType("Bearer")
                        .build();
                
                log.debug("Token introspection successful for user: {}", user.getUsername());
                return ResponseEntity.ok(response);
                
            } catch (Exception e) {
                log.error("Token introspection failed", e);
                return ResponseEntity.ok(TokenValidationResponse.invalid("Invalid token"));
            }
        });
    }
    
    /**
     * Revoke token
     */
    @PostMapping("/revoke")
    public Mono<ResponseEntity<Void>> revokeToken(@Valid @RequestBody TokenRevocationRequest request) {
        return Mono.fromCallable(() -> {
            try {
                // Parse token to get tokenId
                var claims = jwtTokenService.extractClaims(request.getToken());
                String tokenId = claims.getId();
                
                // Add to revocation list
                tokenRevocationService.revokeToken(tokenId, request.getReason());
                
                log.info("Token revoked: {} - Reason: {}", tokenId, request.getReason());
                
                return ResponseEntity.ok().build();
                
            } catch (Exception e) {
                log.error("Token revocation failed", e);
                return ResponseEntity.badRequest().build();
            }
        });
    }
    
    /**
     * Check if token is revoked
     */
    @GetMapping("/revoked/{tokenId}")
    public Mono<ResponseEntity<Boolean>> isTokenRevoked(@PathVariable String tokenId) {
        return Mono.fromCallable(() -> {
            boolean isRevoked = tokenRevocationService.isRevoked(tokenId);
            log.debug("Token revocation check for {}: {}", tokenId, isRevoked);
            return ResponseEntity.ok(isRevoked);
        });
    }
    
    private boolean isTokenExpired(Claims claims) {
        return claims.getExpiration().toInstant().isBefore(Instant.now());
    }
}
