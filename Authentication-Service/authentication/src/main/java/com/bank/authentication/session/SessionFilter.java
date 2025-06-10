package com.bank.authentication.session;

import com.bank.authentication.service.SessionService;
import com.bank.authentication.util.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class SessionFilter extends OncePerRequestFilter {
    @Autowired
    private SessionService sessionService;

    @Autowired
    private JwtUtils jwtUtils;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = jwtUtils.getJwtFromHeader(request); // Extract token from request header

        if (token != null && jwtUtils.validateJwtToken(token)) {
            sessionService.getUserIdByToken(token).ifPresent(userId -> {
                sessionService.getUserEmailByToken(token).ifPresent(email -> {
                    // Add userId and email to response headers with custom names
                    response.addHeader("userId", userId.toString());
                    response.addHeader("email", email);

                    // Set UserSession in ThreadLocal for Feign client to pick up
                    UserThreadLocalContext.setUserSession(new UserSession(userId, email));
                    System.out.println("SessionFilter: Set UserSession in ThreadLocal - userId=" + userId + ", email=" + email);
                });
            });
        }

        // Continue with the filter chain
        filterChain.doFilter(request, response);

        // Clear the ThreadLocal context after request processing
        UserThreadLocalContext.clear();
    }

}
