package com.bank.audit.listener;

import com.bank.audit.model.AuditEvent;
import com.bank.audit.repository.AuditRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.kafka.support.KafkaHeaders;

import java.time.LocalDateTime;

@Service
public class AuditListener {

    @Autowired
    private AuditRepository auditRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(topics = { "user-registered", "customer-created", "transaction-completed" }, groupId = "audit-group")
    public void handleAuditEvents(String payload, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        System.out.println("🔍 Auditing Event from Topic: " + topic);
        System.out.println("📦 Payload: " + payload);
        
        try {
            JsonNode node = objectMapper.readTree(payload);
            AuditEvent event = new AuditEvent();
            event.setEventType(topic);
            event.setPayload(payload);
            event.setTimestamp(LocalDateTime.now());
            event.setServiceName("Multiple");

            if (topic.contains("transaction")) {
                // Handle transaction events
                String status = node.path("status").asText("UNKNOWN");
                String action = "TRANSFER";
                
                // Determine action based on status
                if ("COMPLETED".equals(status) || "SUCCESS".equals(status)) {
                    action = "TRANSACTION_SUCCESS";
                    event.setStatus("SUCCESS");
                } else if ("FAILED".equals(status) || "REJECTED".equals(status)) {
                    action = "TRANSACTION_FAILED";
                    event.setStatus("FAILED");
                } else if ("PENDING".equals(status)) {
                    action = "TRANSACTION_PENDING";
                    event.setStatus("PENDING");
                } else {
                    event.setStatus(status);
                }
                
                event.setAction(action);
                
                // Try to extract user ID from various possible fields
                String userIdStr = null;
                if (node.has("createdBy")) {
                    userIdStr = node.path("createdBy").asText();
                } else if (node.has("userId")) {
                    userIdStr = node.path("userId").asText();
                } else if (node.has("senderUserId")) {
                    userIdStr = node.path("senderUserId").asText();
                } else if (node.has("initiatedBy")) {
                    userIdStr = node.path("initiatedBy").asText();
                }
                
                if (userIdStr != null && !userIdStr.isEmpty() && !userIdStr.equals("null")) {
                    try {
                        event.setUserId(Long.parseLong(userIdStr));
                    } catch (NumberFormatException e) {
                        event.setUserId(null);
                    }
                }
                
                // Extract correlation ID
                event.setCorrelationId(node.path("correlationId").asText(null));
                
                // Set additional transaction-specific fields
                if (node.has("senderAccountNumber")) {
                    // Could use this for additional tracking
                }
                
                System.out.println("✅ Created audit event: " + action + " with status: " + event.getStatus());
                
            } else if (topic.contains("user") || topic.contains("customer")) {
                // Handle user/customer events
                event.setAction("ONBOARDING");
                event.setStatus("SUCCESS");
                
                String userIdStr = node.path("email").asText("anonymous");
                try {
                    event.setUserId(Long.parseLong(userIdStr));
                } catch (NumberFormatException e) {
                    event.setUserId(null);
                }
            }

            auditRepository.save(event);
            System.out.println("💾 Saved audit event with ID: " + event.getId());
            
        } catch (Exception e) {
            System.err.println("❌ Failed to parse audit event: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
