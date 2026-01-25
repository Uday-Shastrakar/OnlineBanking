package com.bank.audit.service;

import com.bank.audit.model.AuditEvent;
import com.bank.audit.repository.AuditRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        long totalLogs = auditRepository.count();

        // Simple heuristic metrics for demonstration
        metrics.put("totalTransactions",
                auditRepository.findAll().stream().filter(l -> "TRANSFER".equals(l.getAction())).count());
        metrics.put("totalUsers", auditRepository.findAll().stream().map(AuditEvent::getUserId).distinct().count());
        metrics.put("failedTransactions",
                auditRepository.findAll().stream().filter(l -> "FAILED".equals(l.getStatus())).count());
        metrics.put("totalLogs", totalLogs);

        return metrics;
    }
}
