package com.bank.transaction.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditEvent {
    
    private String eventId;
    
    private String domain;
    
    private String action;
    
    private String entityId;
    
    private String userId;
    
    private Instant timestamp;
    
    private Map<String, Object> details;
}
