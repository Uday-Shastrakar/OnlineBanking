package com.banking.gateway.service;

import com.banking.gateway.dto.TokenValidationResponse;
import com.banking.gateway.dto.TokenIntrospectionRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthClient {
    
    private final WebClient webClient;
    
    @Value("${authentication.service.url:http://localhost:9093}")
    private String authServiceUrl;
    
    /**
     * Introspect token with Authentication Service
     * NEVER validates JWT locally - ALWAYS calls Auth Service
     */
    public Mono<TokenValidationResponse> introspectToken(String token) {
        log.debug("Calling Authentication Service for token introspection");
        
        TokenIntrospectionRequest request = TokenIntrospectionRequest.builder()
                .token(token)
                .build();
        
        return webClient.post()
                .uri(authServiceUrl + "/api/auth/introspect")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(TokenValidationResponse.class)
                .doOnSuccess(response -> {
                    log.debug("Token introspection successful for user: {}", response.getUsername());
                })
                .doOnError(e -> {
                    log.error("Token introspection failed", e);
                });
    }
    
    /**
     * Check if token is revoked
     */
    public Mono<Boolean> isTokenRevoked(String tokenId) {
        log.debug("Checking token revocation status for tokenId: {}", tokenId);
        
        return webClient.get()
                .uri(authServiceUrl + "/api/auth/revoked/" + tokenId)
                .retrieve()
                .bodyToMono(Boolean.class)
                .doOnSuccess(revoked -> {
                    log.debug("Token revocation status for {}: {}", tokenId, revoked);
                })
                .doOnError(e -> {
                    log.error("Error checking token revocation for tokenId: {}", tokenId, e);
                });
    }
}
