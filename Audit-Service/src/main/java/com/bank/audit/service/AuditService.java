package com.bank.audit.service;

import com.bank.audit.model.AuditEvent;
import com.bank.audit.repository.AuditRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AuditService {

    @Autowired
    private AuditRepository auditRepository;

    public List<AuditEvent> getAllLogs() {
        return auditRepository.findAll();
    }

    public Map<String, Object> getSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        List<AuditEvent> allLogs = auditRepository.findAll();
        
        long totalLogs = allLogs.size();

        // Calculate metrics based on actual data
        metrics.put("totalTransactions", 
                allLogs.stream().filter(l -> "TRANSFER".equals(l.getAction()) || "TRANSACTION".equals(l.getAction())).count());
        metrics.put("totalUsers", allLogs.stream().map(AuditEvent::getUserId).distinct().count());
        metrics.put("totalCustomers", allLogs.stream().map(AuditEvent::getCustomerId).distinct().count());
        metrics.put("totalAccounts", 1500); // Placeholder - would come from account service
        metrics.put("activeSessions", 50); // Placeholder - would come from session management
        metrics.put("failedLogins", 
                allLogs.stream().filter(l -> "FAILED".equals(l.getStatus()) && "USER_LOGIN".equals(l.getAction())).count());
        metrics.put("totalLogs", totalLogs);
        metrics.put("systemUptime", "5 days, 12:30:45"); // Placeholder - would come from system metrics
        metrics.put("lastBackup", LocalDateTime.now().minusDays(1).withHour(2).withMinute(0).withSecond(0).toString()); // Placeholder

        return metrics;
    }
}
