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
        System.out.println("Auditing Event from Topic: " + topic);
        try {
            JsonNode node = objectMapper.readTree(payload);
            AuditEvent event = new AuditEvent();
            event.setEventType(topic);
            event.setPayload(payload);
            event.setTimestamp(LocalDateTime.now());
            event.setServiceName("Multiple");

            if (topic.contains("transaction")) {
                event.setAction("TRANSFER");
                event.setStatus(node.path("status").asText("UNKNOWN"));
                String userIdStr = node.path("createdBy").asText("anonymous");
                try {
                    event.setUserId(Long.parseLong(userIdStr));
                } catch (NumberFormatException e) {
                    event.setUserId(null);
                }
                event.setCorrelationId(node.path("correlationId").asText(null));
            } else if (topic.contains("user") || topic.contains("customer")) {
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
        } catch (Exception e) {
            System.err.println("❌ Failed to parse audit event: " + e.getMessage());
        }
    }
}
