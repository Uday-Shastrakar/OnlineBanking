package com.bank.notification.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class NotificationPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;
    private String email;
    
    // Email preferences
    private Boolean emailEnabled = true;
    private Boolean emailTransactions = true;
    private Boolean emailSecurity = true;
    private Boolean emailMarketing = false;
    private Boolean emailAccountUpdates = true;
    
    // SMS preferences
    private Boolean smsEnabled = false;
    private Boolean smsTransactions = false;
    private Boolean smsSecurity = true;
    private Boolean smsMarketing = false;
    
    // Push notification preferences
    private Boolean pushEnabled = true;
    private Boolean pushTransactions = true;
    private Boolean pushSecurity = true;
    private Boolean pushMarketing = false;
    private Boolean pushAccountUpdates = true;
    
    // Frequency settings
    private String dailyDigest = "NONE"; // NONE, SUMMARY, DETAILED
    private String weeklyDigest = "NONE"; // NONE, SUMMARY, DETAILED
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
