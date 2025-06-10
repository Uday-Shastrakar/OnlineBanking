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
        String email = request.getHeader("email");

        System.out.println("Incoming headers: userId=" + userId + ", email=" + email);
        if (userId != null && email != null) {
            UserThreadLocalContext.setUserSession(new UserSession(Long.parseLong(userId), email));
        } else {
            System.err.println("Headers are null");
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            UserThreadLocalContext.clear();
        }
    }
}

