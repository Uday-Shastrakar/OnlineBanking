package com.bank.authentication.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class JwtTokenService {

    @Value("${jwt.secret:mySecretKey}")
    private String jwtSecret;

    @Value("${jwt.expiration:3600}")
    private long jwtExpiration;

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String username, String userId, Set<String> roles, Set<String> permissions) {
        Instant now = Instant.now();
        Instant expiryDate = now.plus(jwtExpiration, ChronoUnit.SECONDS);

        return Jwts.builder()
                .subject(username)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiryDate))
                .id(userId)
                .claim("roles", roles)
                .claim("permissions", permissions)
                .signWith(getSigningKey())
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractUserId(String token) {
        return extractClaims(token).getId();
    }

    @SuppressWarnings("unchecked")
    public Set<String> extractRoles(String token) {
        Claims claims = extractClaims(token);
        Object rolesObj = claims.get("roles");
        if (rolesObj instanceof List) {
            return ((List<String>) rolesObj).stream()
                    .collect(Collectors.toSet());
        }
        return Set.of();
    }

    @SuppressWarnings("unchecked")
    public Set<String> extractPermissions(String token) {
        Claims claims = extractClaims(token);
        Object permissionsObj = claims.get("permissions");
        if (permissionsObj instanceof List) {
            return ((List<String>) permissionsObj).stream()
                    .collect(Collectors.toSet());
        }
        return Set.of();
    }

    public Instant extractExpiration(String token) {
        return extractClaims(token).getExpiration().toInstant();
    }

    public Instant extractIssuedAt(String token) {
        return extractClaims(token).getIssuedAt().toInstant();
    }

    public boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).isBefore(Instant.now());
        } catch (Exception e) {
            log.error("Error checking token expiration", e);
            return true;
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public boolean isTokenValid(String token) {
        return validateToken(token) && !isTokenExpired(token);
    }

    public String refreshToken(String token) {
        Claims claims = extractClaims(token);
        String username = claims.getSubject();
        String userId = claims.getId();
        Set<String> roles = extractRoles(token);
        Set<String> permissions = extractPermissions(token);
        
        return generateToken(username, userId, roles, permissions);
    }
}
