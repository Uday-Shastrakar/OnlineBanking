package com.bank.notification.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String recipient;
    private String subject;
    private String type; // EMAIL, SMS, PUSH, IN_APP
    private String priority; // LOW, MEDIUM, HIGH, URGENT
    private String category; // TRANSACTION, SECURITY, MARKETING, SYSTEM, ACCOUNT

    @Column(length = 1000)
    private String content;

    private LocalDateTime timestamp;
    private LocalDateTime readAt;
    private String status; // SENT, DELIVERED, READ, FAILED
    private Boolean isRead;
    private String channel; // EMAIL, SMS, PUSH, IN_APP
    private String metadata; // JSON metadata for additional info
}
