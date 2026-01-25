package com.bank.audit.api;

import com.bank.audit.model.AuditEvent;
import com.bank.audit.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    @Autowired
    private AuditService auditService;

    @GetMapping("/all")
    public List<AuditEvent> getAllLogs() {
        return auditService.getAllLogs();
    }

    @GetMapping("/metrics")
    public Map<String, Object> getMetrics() {
        return auditService.getSystemMetrics();
    }
}
