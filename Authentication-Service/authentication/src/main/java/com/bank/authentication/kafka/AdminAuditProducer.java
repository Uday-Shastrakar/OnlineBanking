package com.bank.authentication.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class AdminAuditProducer {

    private static final Logger logger = LoggerFactory.getLogger(AdminAuditProducer.class);
    private static final String AUDIT_TOPIC = "audit.events";

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    private final ObjectMapper objectMapper;

    public AdminAuditProducer() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Emit admin login success event
     */
    public void emitAdminLoginSuccess(Long userId, String username, String sessionId) {
        Map<String, Object> event = createBaseEvent("ADMIN_LOGIN_SUCCESS", userId);
        event.put("username", username);
        event.put("session_id", sessionId);
        event.put("login_timestamp", LocalDateTime.now());

        publishEvent(event);
    }

    /**
     * Emit admin logout event
     */
    public void emitAdminLogout(Long userId, String username, String sessionId) {
        Map<String, Object> event = createBaseEvent("ADMIN_LOGOUT", userId);
        event.put("username", username);
        event.put("session_id", sessionId);
        event.put("logout_timestamp", LocalDateTime.now());

        publishEvent(event);
    }

    /**
     * Emit user management action event
     */
    public void emitUserManagementAction(Long adminId, String adminUsername,
            Long targetUserId, String action, String reason) {
        Map<String, Object> event = createBaseEvent("USER_MANAGEMENT_ACTION", adminId);
        event.put("admin_username", adminUsername);
        event.put("target_user_id", targetUserId);
        event.put("action", action); // LOCK_USER, UNLOCK_USER, FORCE_PASSWORD_RESET
        event.put("reason", reason);
        event.put("action_timestamp", LocalDateTime.now());

        publishEvent(event);
    }

    /**
     * Emit account oversight action event
     */
    public void emitAccountOversightAction(Long adminId, String adminUsername,
            Long accountId, String action, String reason) {
        Map<String, Object> event = createBaseEvent("ACCOUNT_OVERSIGHT_ACTION", adminId);
        event.put("admin_username", adminUsername);
        event.put("account_id", accountId);
        event.put("action", action); // BLOCK_ACCOUNT, UNBLOCK_ACCOUNT
        event.put("reason", reason);
        event.put("action_timestamp", LocalDateTime.now());

        publishEvent(event);
    }

    /**
     * Emit dashboard access event
     */
    public void emitDashboardAccess(Long userId, String username, String dashboardType) {
        Map<String, Object> event = createBaseEvent("DASHBOARD_ACCESS", userId);
        event.put("username", username);
        event.put("dashboard_type", dashboardType); // ADMIN, USER_MANAGEMENT, AUDIT
        event.put("access_timestamp", LocalDateTime.now());

        publishEvent(event);
    }

    /**
     * Emit audit log search event
     */
    public void emitAuditLogSearch(Long userId, String username,
            Map<String, Object> searchCriteria) {
        Map<String, Object> event = createBaseEvent("AUDIT_LOG_SEARCH", userId);
        event.put("username", username);
        event.put("search_criteria", searchCriteria);
        event.put("search_timestamp", LocalDateTime.now());

        publishEvent(event);
    }

    /**
     * Create base audit event structure
     */
    private Map<String, Object> createBaseEvent(String eventType, Long userId) {
        Map<String, Object> event = new HashMap<>();
        event.put("event_id", UUID.randomUUID().toString());
        event.put("event_type", eventType);
        event.put("user_id", userId);
        event.put("timestamp", LocalDateTime.now());
        event.put("correlation_id", UUID.randomUUID().toString());
        event.put("service", "authentication-service");
        event.put("environment", getEnvironment());

        return event;
    }

    /**
     * Publish event to Kafka topic
     */
    private void publishEvent(Map<String, Object> event) {
        try {
            String eventJson = objectMapper.writeValueAsString(event);
            String key = String.valueOf(event.get("user_id"));

            kafkaTemplate.send(AUDIT_TOPIC, key, eventJson)
                    .whenComplete((result, failure) -> {
                        if (failure == null) {
                            logger.info("Audit event published successfully: {}", event.get("event_id"));
                        } else {
                            logger.error("Failed to publish audit event: {}", event.get("event_id"), failure);
                            // Kafka failure should NOT block admin action
                            // Eventual consistency is acceptable
                        }
                    });

        } catch (Exception e) {
            logger.error("Failed to publish audit event to Kafka", e);
        }
    }

    /**
     * Get current environment
     */
    private String getEnvironment() {
        return System.getProperty("spring.profiles.active", "development");
    }
}
