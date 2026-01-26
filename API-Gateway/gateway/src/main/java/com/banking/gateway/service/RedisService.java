package com.banking.gateway.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisService {
    
    private final RedisTemplate<String, Object> redisTemplate;
    
    /**
     * Check if token is revoked in Redis cache
     */
    public Mono<Boolean> isTokenRevoked(String tokenId) {
        return Mono.fromCallable(() -> {
            String key = "revoked:" + tokenId;
            return redisTemplate.hasKey(key);
        });
    }
    
    /**
     * Mark token as revoked in Redis cache
     */
    public void markTokenRevoked(String tokenId) {
        String key = "revoked:" + tokenId;
        redisTemplate.opsForValue().set(key, "true", Duration.ofDays(7));
        log.info("Token marked as revoked in Redis: {}", tokenId);
    }
    
    /**
     * Cache user session
     */
    public void cacheUserSession(String userId, Object sessionData) {
        String key = "session:" + userId;
        redisTemplate.opsForValue().set(key, sessionData, Duration.ofMinutes(30));
    }
    
    /**
     * Get cached user session
     */
    public Mono<Object> getCachedUserSession(String userId) {
        return Mono.fromCallable(() -> {
            String key = "session:" + userId;
            return redisTemplate.opsForValue().get(key);
        });
    }
    
    /**
     * Invalidate user session
     */
    public void invalidateUserSession(String userId) {
        String key = "session:" + userId;
        redisTemplate.delete(key);
        log.info("User session invalidated: {}", userId);
    }
}
