package com.bank.authentication.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);


    @Value("${spring.app.jwtSecret}")
    private String jwtSecret;

    @Value("${spring.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    public String getJwtFromHeader(HttpServletRequest request) {
        System.out.println(request + "request gettig");
        String bearerToken = request.getHeader("Authorization");
        System.out.println(bearerToken);
        logger.debug("Authorization Header: {}", bearerToken);
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    public String generateToken(UserDetails userDetails){
        String username = userDetails.getUsername();
        Map<String, Object> claims = new HashMap<>();
        return generateTokenFromUsername(claims, username);
    }

    public String generateTokenFromUsername(Map<String, Object> claims, String username) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setHeaderParam("typ", "jwt")
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key())
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return extractAllClaims(token).getSubject();
//        return Jwts.parser().verifyWith((SecretKey) key()).build().parseSignedClaims(token).getPayload().getSubject();
//        return Jwts.
//                parser().verifyWith((SecretKey) key())
//                .build().parseEncryptedClaims(token)
//                .getPayload().getSubject();

    }

    public Claims extractAllClaims(String token){
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
//        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }


    public boolean validateJwtToken(String authToken) {
        try {
            System.out.println("Validate");
            Jwts.parser()
                    .verifyWith(key())
                    .build()
                    .parseSignedClaims(authToken)
                    .getPayload();
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error(" JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error(" JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error(" JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    //otp related stuff code do not touch
    public String generateTokenWithOtp(String email, String otp) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("otp", otp);
        return Jwts.builder().claims(claims).subject(email).issuedAt(new Date()).expiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key())
                .compact();
    }


    public String extractOtp(String token) {
        return (String) extractAllClaims(token).get("otp");
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject(); // Email is stored as the subject
    }


}
