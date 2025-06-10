package com.bank.authentication.service;

import com.bank.authentication.model.AuditLog;
import com.bank.authentication.repository.AuditLogRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Transactional
    public void logAction(String action, String username, String ipAddress, String userAgent, String acceptLanguage, String referer, String xRequestId) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setUsername(username);
        auditLog.setIpAddress(ipAddress);
        auditLog.setUserAgent(userAgent);
        auditLog.setAcceptLanguage(acceptLanguage);
        auditLog.setReferer(referer);
        auditLog.setCorrelationId(xRequestId);
        auditLog.setTimestamp(LocalDateTime.now());

        auditLogRepository.save(auditLog);
    }
    //How to use this ?
    //  autowire this service where you want to use this ex private final AuditLogService auditLogService;
    //                auditLogService.logAction("USER_CREATED_SUCCESSFULLY", username, ipAddress, userAgent);
}
