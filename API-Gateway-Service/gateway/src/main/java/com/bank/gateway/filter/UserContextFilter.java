package com.bank.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.function.Consumer;

@Component
public class UserContextFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // Only apply to transaction service requests
        if (request.getPath().value().startsWith("/api/transaction/")) {
            // Extract user info from JWT token or session
            String authorization = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            
            if (authorization != null && authorization.startsWith("Bearer ")) {
                String token = authorization.substring(7);
                
                // For now, we'll extract user info from the token in a simple way
                // In production, you should properly decode the JWT token
                try {
                    // This is a simplified approach - you should decode JWT properly
                    String userId = extractUserIdFromToken(token);
                    String email = extractEmailFromToken(token);
                    
                    if (userId != null && email != null) {
                        // Add user context headers
                        ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                            .header("userId", userId)
                            .header("email", email)
                            .header("X-User-Id", userId)
                            .header("X-User-Email", email)
                            .build();
                        
                        return chain.filter(exchange.mutate().request(modifiedRequest).build());
                    }
                } catch (Exception e) {
                    System.err.println("Failed to extract user context from token: " + e.getMessage());
                }
            }
        }
        
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        // Set order to run before authentication
        return -10;
    }
    
    private String extractUserIdFromToken(String token) {
        // This is a simplified implementation
        // In production, you should properly decode JWT token
        try {
            // For demo purposes, we'll use a mock implementation
            // You should replace this with proper JWT decoding
            return "1"; // Mock user ID - replace with actual JWT parsing
        } catch (Exception e) {
            return null;
        }
    }
    
    private String extractEmailFromToken(String token) {
        // This is a simplified implementation
        // In production, you should properly decode JWT token
        try {
            // For demo purposes, we'll use a mock implementation
            // You should replace this with proper JWT parsing
            return "user@example.com"; // Mock email - replace with actual JWT parsing
        } catch (Exception e) {
            return null;
        }
    }
}
