package com.bank.authentication.audit;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuditLogInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        setAuditContextHeaders(request);

        return true;
    }


    private void setAuditContextHeaders(HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        String acceptLanguage = request.getHeader("Accept-Language");
        String referer = request.getHeader("Referer");
        String correlationId = request.getHeader("bank-correlation-id");

        AuditContext.setIpAddress(ipAddress);
        AuditContext.setUserAgent(userAgent);
        AuditContext.setAcceptLanguage(acceptLanguage);
        AuditContext.setReferer(referer);
        AuditContext.setCorrelationId(correlationId);
    }
}
