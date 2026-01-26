package com.banking.gateway.security;

import com.banking.gateway.dto.TokenValidationResponse;
import com.banking.gateway.service.AuthClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

/**
 * STRICT Authentication Filter - NEVER trusts JWT locally
 * ALWAYS calls Authentication Service for token validation
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class StrictAuthenticationFilter implements GlobalFilter, Ordered {

    private final AuthClient authClient;
    private final RedisService redisService;

    private static final List<String> PUBLIC_ENDPOINTS = Arrays.asList(
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/forgot-password",
        "/api/auth/verify-otp",
        "/api/auth/reset-password",
        "/actuator/health",
        "/actuator/info"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        
        log.debug("Processing request: {} {}", exchange.getRequest().getMethod(), path);
        
        // 1. Public endpoints bypass authentication
        if (isPublicEndpoint(path)) {
            log.debug("Public endpoint accessed: {}", path);
            return chain.filter(exchange);
        }
        
        // 2. Extract JWT from Authorization header
        String authHeader = exchange.getRequest().getHeaders()
            .getFirst(HttpHeaders.AUTHORIZATION);
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header for path: {}", path);
            return handleUnauthorized(exchange, "Missing or invalid Authorization header");
        }
        
        String token = authHeader.substring(7);
        
        // 3. NEVER validate JWT locally - ALWAYS call Auth Service
        log.debug("Performing token introspection for path: {}", path);
        return introspectToken(token)
            .timeout(Duration.ofSeconds(5))
            .flatMap(tokenValidation -> {
                if (!tokenValidation.isValid()) {
                    log.warn("Token validation failed for path: {} - {}", path, tokenValidation.getErrorMessage());
                    return handleUnauthorized(exchange, tokenValidation.getErrorMessage());
                }
                
                // 4. Check token revocation status
                return checkTokenRevocation(tokenValidation.getTokenId())
                    .flatMap(isRevoked -> {
                        if (isRevoked) {
                            log.warn("Token has been revoked: {} for path: {}", tokenValidation.getTokenId(), path);
                            return handleUnauthorized(exchange, "Token has been revoked");
                        }
                        
                        // 5. Perform authorization
                        return performAuthorization(exchange, tokenValidation)
                            .flatMap(authorized -> {
                                if (authorized) {
                                    // 6. Inject user context headers
                                    ServerHttpRequest modifiedRequest = injectUserContext(
                                        exchange.getRequest(), 
                                        tokenValidation
                                    );
                                    
                                    log.debug("Request authorized for user: {} to path: {}", 
                                        tokenValidation.getUsername(), path);
                                    
                                    return chain.filter(exchange.mutate().request(modifiedRequest));
                                } else {
                                    log.warn("Access denied for user: {} to path: {} - Insufficient permissions", 
                                        tokenValidation.getUsername(), path);
                                    return handleForbidden(exchange, "Insufficient permissions");
                                }
                            });
                    });
            })
            .onErrorResume(e -> {
                log.error("Authentication error for path: {}", path, e);
                return handleInternalServerError(exchange, e);
            });
    }

    private boolean isPublicEndpoint(String path) {
        return PUBLIC_ENDPOINTS.stream().anyMatch(path::startsWith);
    }

    private Mono<TokenValidationResponse> introspectToken(String token) {
        log.debug("Calling Authentication Service for token introspection");
        
        return authClient.introspectToken(token)
            .doOnSuccess(response -> {
                log.debug("Token introspection successful for user: {}", response.getUsername());
            })
            .doOnError(e -> {
                log.error("Token introspection failed", e);
            })
            .onErrorReturn(Mono.just(TokenValidationResponse.invalid("Authentication service unavailable")));
    }

    private Mono<Boolean> checkTokenRevocation(String tokenId) {
        // First check Redis for performance
        return redisService.isTokenRevoked(tokenId)
            .flatMap(isRevoked -> {
                if (isRevoked) {
                    return Mono.just(true);
                }
                // Fallback to database check
                return authClient.isTokenRevoked(tokenId)
                    .doOnSuccess(revoked -> {
                        if (revoked) {
                            redisService.markTokenRevoked(tokenId);
                        }
                    });
            });
    }

    private Mono<Boolean> performAuthorization(ServerWebExchange exchange, TokenValidationResponse tokenValidation) {
        String path = exchange.getRequest().getPath().value();
        String method = exchange.getRequest().getMethod().name();
        
        // Get required permissions for this endpoint
        Set<String> requiredPermissions = getRequiredPermissions(path, method);
        
        if (requiredPermissions.isEmpty()) {
            return Mono.just(true); // No permissions required
        }
        
        // Check user permissions
        Set<String> userPermissions = new HashSet<>(tokenValidation.getPermissions());
        
        // Admin override - has all permissions
        if (userPermissions.contains("ADMIN_ALL")) {
            return Mono.just(true);
        }
        
        // Check specific permissions
        boolean hasPermission = requiredPermissions.stream()
            .anyMatch(userPermissions::contains);
        
        log.debug("Authorization check for user: {} - Required: {}, User: {}, Result: {}", 
            tokenValidation.getUsername(), requiredPermissions, userPermissions, hasPermission);
        
        return Mono.just(hasPermission);
    }

    private Set<String> getRequiredPermissions(String path, String method) {
        // Map HTTP methods to permission types
        String permissionType = switch (method.toUpperCase()) {
            case "GET" -> "READ";
            case "POST" -> "WRITE";
            case "PUT" -> "WRITE";
            case "DELETE" -> "DELETE";
            case "PATCH" -> "WRITE";
            default -> "WRITE";
        };
        
        // Define endpoint permissions
        if (path.startsWith("/api/customer/")) {
            return Set.of("CUSTOMER_" + permissionType, "ADMIN_ALL");
        } else if (path.startsWith("/api/account/")) {
            return Set.of("ACCOUNT_" + permissionType, "ADMIN_ALL");
        } else if (path.startsWith("/api/transaction/")) {
            return Set.of("TRANSACTION_" + permissionType, "ADMIN_ALL");
        } else if (path.startsWith("/api/audit/")) {
            return Set.of("AUDIT_" + permissionType, "ADMIN_ALL");
        } else if (path.startsWith("/api/users/")) {
            return Set.of("USER_MANAGE", "ADMIN_ALL");
        } else if (path.startsWith("/api/user-customer-mapping/")) {
            return Set.of("CUSTOMER_" + permissionType, "ADMIN_ALL");
        }
        
        return Set.of();
    }

    private ServerHttpRequest injectUserContext(ServerHttpRequest request, TokenValidationResponse tokenValidation) {
        return request.mutate()
            .header("X-User-Id", tokenValidation.getUserId().toString())
            .header("X-Username", tokenValidation.getUsername())
            .header("X-Roles", String.join(",", tokenValidation.getRoles()))
            .header("X-Permissions", String.join(",", tokenValidation.getPermissions()))
            .header("X-Token-Id", tokenValidation.getTokenId())
            .header("X-Request-Id", java.util.UUID.randomUUID().toString())
            .header("X-Timestamp", java.time.Instant.now().toString())
            .header("X-User-Status", tokenValidation.getUserStatus())
            .build();
    }

    private Mono<Void> handleUnauthorized(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().set("Content-Type", "application/json");
        
        String body = String.format("""
            {
                "error": "UNAUTHORIZED",
                "message": "%s",
                "timestamp": "%s",
                "path": "%s"
            }
            """, message, java.time.Instant.now(), exchange.getRequest().getPath().value());
        
        return exchange.getResponse().writeWith(Mono.just(body.getBytes()))
                .then(Mono.empty());
    }

    private Mono<Void> handleForbidden(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
        exchange.getResponse().getHeaders().set("Content-Type", "application/json");
        
        String body = String.format("""
            {
                "error": "FORBIDDEN",
                "message": "%s",
                "timestamp": "%s",
                "path": "%s"
            }
            """, message, java.time.Instant.now(), exchange.getRequest().getPath().value());
        
        return exchange.getResponse().writeWith(Mono.just(body.getBytes()))
                .then(Mono.empty());
    }

    private Mono<Void> handleInternalServerError(ServerWebExchange exchange, Exception e) {
        exchange.getResponse().setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
        exchange.getResponse().getHeaders().set("Content-Type", "application/json");
        
        String body = String.format("""
            {
                "error": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred",
                "timestamp": "%s",
                "path": "%s"
            }
            """, java.time.Instant.now(), exchange.getRequest().getPath().value());
        
        return exchange.getResponse().writeWith(Mono.just(body.getBytes()))
                .then(Mono.empty());
    }

    @Override
    public int getOrder() {
        return -100; // Highest priority
    }
}
