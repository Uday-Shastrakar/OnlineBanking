package com.bank.authentication.audit;

import com.bank.authentication.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AuditLogger {
    @Autowired
    private AuditLogService auditLogService;

    public void logAction(String action, String username) {
        String ipAddress = AuditContext.getIpAddress();
        String userAgent = AuditContext.getUserAgent();
        String acceptLanguage = AuditContext.getAcceptLanguage();
        String referer = AuditContext.getReferer();
        String correlationId = AuditContext.getCorrelationId();

        auditLogService.logAction(action, username, ipAddress, userAgent, acceptLanguage, referer, correlationId);
    }
}
