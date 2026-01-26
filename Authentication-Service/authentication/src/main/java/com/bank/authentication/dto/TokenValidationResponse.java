package com.bank.authentication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.time.Instant;
import java.util.Map;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Accessors(fluent = true)
public class TokenValidationResponse {
    
    private boolean active;
    private String username;
    private String userId;
    private Set<String> roles;
    private Set<String> permissions;
    private Instant expiresAt;
    private Instant issuedAt;
    private String tokenType;
    private Map<String, Object> additionalClaims;
    
    public static TokenValidationResponse active(String username, String userId, Set<String> roles, Set<String> permissions) {
        return TokenValidationResponse.builder()
                .active(true)
                .username(username)
                .userId(userId)
                .roles(roles)
                .permissions(permissions)
                .expiresAt(Instant.now().plusSeconds(3600)) // Default 1 hour
                .issuedAt(Instant.now())
                .tokenType("Bearer")
                .build();
    }
    
    public static TokenValidationResponse inactive(String reason) {
        return TokenValidationResponse.builder()
                .active(false)
                .build();
    }
    
    public static TokenValidationResponse invalid(String reason) {
        return TokenValidationResponse.builder()
                .active(false)
                .build();
    }
}
