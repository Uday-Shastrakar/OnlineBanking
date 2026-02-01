package com.bank.transaction.session;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class UserSessionFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String userId = request.getHeader("userId");
        if (userId == null)
            userId = request.getHeader("X-User-Id");

        String email = request.getHeader("email");
        if (email == null)
            email = request.getHeader("X-User-Email");

        System.out.println(
                "Incoming headers: userId=" + userId + ", email=" + email + " from " + request.getRequestURI());
        if (userId != null && email != null && !userId.isEmpty() && !email.isEmpty()) {
            try {
                UserThreadLocalContext.setUserSession(new UserSession(Long.parseLong(userId), email));
            } catch (NumberFormatException e) {
                System.err.println("Invalid userId header format: " + userId);
            }
        } else {
            System.err.println("User session headers missing for request: " + request.getRequestURI());
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            UserThreadLocalContext.clear();
        }
    }
}
