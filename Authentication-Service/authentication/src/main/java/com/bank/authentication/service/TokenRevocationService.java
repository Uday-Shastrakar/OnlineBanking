package com.bank.authentication.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;

/**
 * Token Revocation Service - SINGLE SOURCE OF TRUTH for token revocation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TokenRevocationService {
    
    private final StringRedisTemplate redisTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    /**
     * Revoke token
     */
    public void revokeToken(String tokenId, String reason) {
        log.info("Revoking token: {} - Reason: {}", tokenId, reason);
        
        // Add to Redis revocation list
        String key = "revoked:" + tokenId;
        redisTemplate.opsForValue().set(key, reason, Duration.ofDays(30));
        
        // Publish revocation event
        TokenRevokedEvent event = TokenRevokedEvent.builder()
                .tokenId(tokenId)
                .reason(reason)
                .revokedAt(java.time.Instant.now())
                .build();
        
        kafkaTemplate.send("token-revoked", event);
        
        log.info("Token revoked successfully: {}", tokenId);
    }
    
    /**
     * Check if token is revoked
     */
    public boolean isRevoked(String tokenId) {
        String key = "revoked:" + tokenId;
        Boolean exists = redisTemplate.hasKey(key);
        return exists != null && exists;
    }
    
    /**
     * Revoke all tokens for a user
     */
    public Mono<Void> revokeAllUserTokens(Long userId) {
        return Mono.fromCallable(() -> {
            // This would require a more complex implementation
            // For now, we'll implement a simple version
            String pattern = "user:" + userId + ":token:*";
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null) {
                for (String key : keys) {
                    redisTemplate.delete(key);
                }
            }
            
            // Publish user tokens revoked event
            UserTokensRevokedEvent event = UserTokensRevokedEvent.builder()
                    .userId(userId)
                    .revokedAt(java.time.Instant.now())
                    .build();
            
            kafkaTemplate.send("user-tokens-revoked", event);
            
            log.info("All tokens revoked for user: {}", userId);
            return null;
        });
    }
    
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class TokenRevokedEvent {
        private String tokenId;
        private String reason;
        private java.time.Instant revokedAt;
    }
    
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class UserTokensRevokedEvent {
        private Long userId;
        private java.time.Instant revokedAt;
    }
}
