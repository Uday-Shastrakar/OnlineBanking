package com.bank.authentication.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@EntityListeners(AuditingEntityListener.class)
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String username;

    @Column
    private String ipAddress;

    @Column
    private String userAgent;

    @Column
    private String acceptLanguage; // New header field

    @Column
    private String referer; // New header field

    @Column
    private String correlationId; // New header field

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime timestamp;

}
