package com.banking.gateway.security;

import com.banking.gateway.dto.TokenValidationResponse;
import com.banking.gateway.service.AuthClient;
import com.banking.gateway.service.RedisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.http.server.reactive.MockServerHttpResponse;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Instant;
import java.util.Arrays;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * STRICT Authentication Filter Test Cases
 * Tests the enterprise banking security implementation
 */
@ExtendWith(MockitoExtension.class)
class StrictAuthenticationFilterTest {

    @Mock
    private AuthClient authClient;

    @Mock
    private RedisService redisService;

    @Mock
    private GatewayFilterChain filterChain;

    @InjectMocks
    private StrictAuthenticationFilter authenticationFilter;

    private ServerWebExchange exchange;
    private ServerHttpRequest request;
    private ServerHttpResponse response;

    @BeforeEach
    void setUp() {
        request = MockServerHttpRequest.get("/api/customer/123")
                .header(HttpHeaders.HOST, "localhost")
                .build();
        response = new MockServerHttpResponse();
        exchange = MockServerWebExchange.from(request, response);
    }

    @Test
    void testPublicEndpoint_ShouldPassThrough() {
        // Given
        ServerHttpRequest publicRequest = MockServerHttpRequest.get("/api/auth/login")
                .header(HttpHeaders.HOST, "localhost")
                .build();
        ServerWebExchange publicExchange = MockServerWebExchange.from(publicRequest, response);

        // When
        Mono<Void> result = authenticationFilter.filter(publicExchange, filterChain);

        // Then
        StepVerifier.create(result)
                .verifyComplete();
        verify(filterChain).filter(publicExchange);
        verifyNoInteractions(authClient);
        verifyNoInteractions(redisService);
    }

    @Test
    void testMissingAuthorizationHeader_ShouldReturnUnauthorized() {
        // When
        Mono<Void> result = authenticationFilter.filter(exchange, filterChain);

        // Then
        StepVerifier.create(result)
                .verifyComplete();
        
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verifyNoInteractions(authClient);
        verifyNoInteractions(redisService);
    }

    @Test
    void testInvalidAuthorizationHeader_ShouldReturnUnauthorized() {
        // Given
        ServerHttpRequest invalidRequest = MockServerHttpRequest.get("/api/customer/123")
                .header(HttpHeaders.HOST, "localhost")
                .header(HttpHeaders.AUTHORIZATION, "Invalid token")
                .build();
        ServerWebExchange invalidExchange = MockServerWebExchange.from(invalidRequest, response);

        // When
        Mono<Void> result = authenticationFilter.filter(invalidExchange, filterChain);

        // Then
        StepVerifier.create(result)
                .verifyComplete();
        
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verifyNoInteractions(authClient);
        verifyNoInteractions(redisService);
    }

    @Test
    void testValidToken_ShouldPassThrough() {
        // Given
        String validToken = "valid.jwt.token";
        ServerHttpRequest validRequest = MockServerHttpRequest.get("/api/customer/123")
                .header(HttpHeaders.HOST, "localhost")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
                .build();
        ServerWebExchange validExchange = MockServerWebExchange.from(validRequest, response);

        TokenValidationResponse tokenValidation = TokenValidationResponse.builder()
                .valid(true)
                .tokenId("token-123")
                .userId(123L)
                .username("testuser")
                .roles(Set.of("CUSTOMER_USER"))
                .permissions(Set.of("CUSTOMER_READ", "CUSTOMER_WRITE"))
                .expiresAt(Instant.now().plusSeconds(3600))
                .issuedAt(Instant.now())
                .userStatus("ACTIVE")
                .build();

        when(authClient.introspectToken(validToken))
                .thenReturn(Mono.just(tokenValidation));
        when(redisService.isTokenRevoked("token-123"))
                .thenReturn(Mono.just(false));

        // When
        Mono<Void> result = authenticationFilter.filter(validExchange, filterChain);

        // Then
        StepVerifier.create(result)
                .verifyComplete();
        
        verify(authClient).introspectToken(validToken);
        verify(redisService).isTokenRevoked("token-123");
        verify(filterChain).filter(argThat(exchange -> {
            ServerHttpRequest modifiedRequest = exchange.getRequest();
            return "123".equals(modifiedRequest.getHeaders().getFirst("X-User-Id")) &&
                   "testuser".equals(modifiedRequest.getHeaders().getFirst("X-Username")) &&
                   modifiedRequest.getHeaders().getFirst("X-Permissions").contains("CUSTOMER_READ");
        }));
    }

    @Test
    void testInvalidToken_ShouldReturnUnauthorized() {
        // Given
        String invalidToken = "invalid.jwt.token";
        ServerHttpRequest invalidRequest = MockServerHttpRequest.get("/api/customer/123")
                .header(HttpHeaders.HOST, "localhost")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + invalidToken)
                .build();
        ServerWebExchange invalidExchange = MockServerWebExchange.from(invalidRequest, response);

        TokenValidationResponse tokenValidation = TokenValidationResponse.invalid("Invalid token signature");

        when(authClient.introspectToken(invalidToken))
                .thenReturn(Mono.just(tokenValidation));

        // When
        Mono<Void> result = authenticationFilter.filter(invalidExchange, filterChain);

        // Then
        StepVerifier.create(result)
                .verifyComplete();
        
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(authClient).introspectToken(invalidToken);
        verifyNoInteractions(redisService);
        verifyNoInteractions(filterChain);
    }

    @Test
    void testRevokedToken_ShouldReturnUnauthorized() {
        // Given
        String revokedToken = "revoked.jwt.token";
        ServerHttpRequest revokedRequest = MockServerHttpRequest.get("/api/customer/123")
                .header(HttpHeaders.HOST, "localhost")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + revokedToken)
                .build();
        ServerWebExchange revokedExchange = MockServerWebExchange.from(revokedRequest, response);

        TokenValidationResponse tokenValidation = TokenValidationResponse.builder()
                .valid(true)
                .tokenId("revoked-token-123")
                .userId(123L)
                .username("testuser")
                .roles(Set.of("CUSTOMER_USER"))
                .permissions(Set.of("CUSTOMER_READ"))
                .expiresAt(Instant.now().plusSeconds(3600))
                .issuedAt(Instant.now())
                .userStatus("ACTIVE")
                .build();

        when(authClient.introspectToken(revokedToken))
                .thenReturn(Mono.just(tokenValidation));
        when(redisService.isTokenRevoked("revoked-token-123"))
                .thenReturn(Mono.just(true));

        // When
        Mono<Void> result = authenticationFilter.filter(revokedExchange, filterChain);

        // Then
        StepVerifier.create(result)
                .verifyComplete();
        
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(authClient).introspectToken(revokedToken);
        verify(redisService).isTokenRevoked("revoked-token-123");
        verifyNoInteractions(filterChain);
    }

    @Test
    void testInsufficientPermissions_ShouldReturnForbidden() {
        // Given
        String validToken = "valid.jwt.token";
        ServerHttpRequest validRequest = MockServerHttpRequest.get("/api/customer/123")
                .header(HttpHeaders.HOST, "localhost")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
                .build();
        ServerWebExchange validExchange = MockServerWebExchange.from(validRequest, response);

        TokenValidationResponse tokenValidation = TokenValidationResponse.builder()
                .valid(true)
                .tokenId("token-123")
                .userId(123L)
                .username("testuser")
                .roles(Set.of("CUSTOMER_USER"))
                .permissions(Set.of("TRANSACTION_EXECUTE")) // Wrong permission for customer endpoint
                .expiresAt(Instant.now().plusSeconds(3600))
                .issuedAt(Instant.now())
                .userStatus("ACTIVE")
                .build();

        when(authClient.introspectToken(validToken))
                .thenReturn(Mono.just(tokenValidation));
        when(redisService.isTokenRevoked("token-123"))
                .thenReturn(Mono.just(false));

        // When
        Mono<Void> result = authenticationFilter.filter(validExchange, filterChain);

        // Then
        StepVerifier.create(result)
                .verifyComplete();
        
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verify(authClient).introspectToken(validToken);
        verify(redisService).isTokenRevoked("token-123");
        verifyNoInteractions(filterChain);
    }

    @Test
    void testAdminUser_ShouldAccessAllEndpoints() {
        // Given
        String validToken = "admin.jwt.token";
        ServerHttpRequest adminRequest = MockServerHttpRequest.get("/api/audit/all")
                .header(HttpHeaders.HOST, "localhost")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
                .build();
        ServerWebExchange adminExchange = MockServerWebExchange.from(adminRequest, response);

        TokenValidationResponse tokenValidation = TokenValidationResponse.builder()
                .valid(true)
                .tokenId("admin-token-123")
                .userId(1L)
                .username("admin")
                .roles(Set.of("ADMIN"))
                .permissions(Set.of("ADMIN_ALL")) // Admin has all permissions
                .expiresAt(Instant.now().plusSeconds(3600))
                .issuedAt(Instant.now())
                .userStatus("ACTIVE")
                .build();

        when(authClient.introspectToken(validToken))
                .thenReturn(Mono.just(tokenValidation));
        when(redisService.isTokenRevoked("admin-token-123"))
                .thenReturn(Mono.just(false));

        // When
        Mono<Void> result = authenticationFilter.filter(adminExchange, filterChain);

        // Then
        StepVerifier.create(result)
                .verifyComplete();
        
        verify(authClient).introspectToken(validToken);
        verify(redisService).isTokenRevoked("admin-token-123");
        verify(filterChain).filter(adminExchange);
    }

    @Test
    void testAuthServiceUnavailable_ShouldReturnInternalServerError() {
        // Given
        String validToken = "valid.jwt.token";
        ServerHttpRequest validRequest = MockServerHttpRequest.get("/api/customer/123")
                .header(HttpHeaders.HOST, "localhost")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
                .build();
        ServerWebExchange validExchange = MockServerWebExchange.from(validRequest, response);

        when(authClient.introspectToken(validToken))
                .thenReturn(Mono.error(new RuntimeException("Auth service unavailable")));

        // When
        Mono<Void> result = authenticationFilter.filter(validExchange, filterChain);

        // Then
        StepVerifier.create(result)
                .verifyComplete();
        
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        verify(authClient).introspectToken(validToken);
        verifyNoInteractions(redisService);
        verifyNoInteractions(filterChain);
    }

    @Test
    void testUserContextHeadersInjection() {
        // Given
        String validToken = "valid.jwt.token";
        ServerHttpRequest validRequest = MockServerHttpRequest.get("/api/customer/123")
                .header(HttpHeaders.HOST, "localhost")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
                .build();
        ServerWebExchange validExchange = MockServerWebExchange.from(validRequest, response);

        TokenValidationResponse tokenValidation = TokenValidationResponse.builder()
                .valid(true)
                .tokenId("token-123")
                .userId(123L)
                .username("testuser")
                .roles(Set.of("CUSTOMER_USER"))
                .permissions(Set.of("CUSTOMER_READ", "CUSTOMER_WRITE"))
                .expiresAt(Instant.now().plusSeconds(3600))
                .issuedAt(Instant.now())
                .userStatus("ACTIVE")
                .build();

        when(authClient.introspectToken(validToken))
                .thenReturn(Mono.just(tokenValidation));
        when(redisService.isTokenRevoked("token-123"))
                .thenReturn(Mono.just(false));

        // When
        authenticationFilter.filter(validExchange, filterChain);

        // Then
        verify(filterChain).filter(argThat(exchange -> {
            ServerHttpRequest modifiedRequest = exchange.getRequest();
            return "123".equals(modifiedRequest.getHeaders().getFirst("X-User-Id")) &&
                   "testuser".equals(modifiedRequest.getHeaders().getFirst("X-Username")) &&
                   "CUSTOMER_USER".equals(modifiedRequest.getHeaders().getFirst("X-Roles")) &&
                   modifiedRequest.getHeaders().getFirst("X-Permissions").contains("CUSTOMER_READ") &&
                   modifiedRequest.getHeaders().getFirst("X-Permissions").contains("CUSTOMER_WRITE") &&
                   "token-123".equals(modifiedRequest.getHeaders().getFirst("X-Token-Id")) &&
                   modifiedRequest.getHeaders().getFirst("X-Request-Id") != null &&
                   modifiedRequest.getHeaders().getFirst("X-Timestamp") != null &&
                   "ACTIVE".equals(modifiedRequest.getHeaders().getFirst("X-User-Status"));
        }));
    }
}
