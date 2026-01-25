package com.bank.audit.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "audit_events")
public class AuditEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String eventType;
    private String serviceName;

    @Column(columnDefinition = "TEXT")
    private String payload;

    private Instant timestamp;
    private String userId;
    private String action;
    private String status;
    private String correlationId;
}
