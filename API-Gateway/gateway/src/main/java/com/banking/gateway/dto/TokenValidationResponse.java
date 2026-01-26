package com.banking.gateway.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenValidationResponse {
    private boolean valid;
    private String errorMessage;
    private String tokenId;
    private Long userId;
    private String username;
    private Set<String> roles;
    private Set<String> permissions;
    private Instant expiresAt;
    private Instant issuedAt;
    private String userStatus;
    
    public static TokenValidationResponse invalid(String errorMessage) {
        return TokenValidationResponse.builder()
                .valid(false)
                .errorMessage(errorMessage)
                .build();
    }
    
    public static TokenValidationResponse valid() {
        return TokenValidationResponse.builder()
                .valid(true)
                .build();
    }
}
