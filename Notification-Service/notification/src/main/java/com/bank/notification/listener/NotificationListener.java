package com.bank.notification.listener;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationListener {

    @Autowired
    private RestTemplate restTemplate;

    private final String EMAIL_SERVICE_URL = "http://email/email/send";

    @Autowired
    private com.bank.notification.service.NotificationService notificationService;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(topics = "user-registered", groupId = "notification-group")
    public void handleUserRegisteredEvent(String payload) {
        System.out.println("Received UserRegisteredEvent: " + payload);
        try {
            JsonNode node = objectMapper.readTree(payload);
            String email = node.path("email").asText();
            String firstName = node.path("firstName").asText("User");
            sendWelcomeEmail(email, firstName);
        } catch (Exception e) {
            System.err.println("❌ Failed to parse user registration event: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "transaction-completed", groupId = "notification-group")
    public void handleTransactionCompletedEvent(String payload) {
        System.out.println("Received TransactionCompletedEvent: " + payload);
        try {
            JsonNode node = objectMapper.readTree(payload);
            String recipient = node.path("createdBy").asText("customer@bank.com");
            BigDecimal amount = node.path("debitAmount").decimalValue();

            // Send Transaction Email
            sendTransactionEmail(recipient, amount);

            notificationService.saveNotification(
                    recipient,
                    "Transaction Alert: Success",
                    "Your transfer of funds has been completed successfully. Amount: ₹" + amount);
            System.out.println("✅ Transaction Notification Processed for: " + recipient);
        } catch (Exception e) {
            System.err.println("❌ Failed to process transaction notification: " + e.getMessage());
        }
    }

    private void sendWelcomeEmail(String email, String firstName) {
        try {
            String subject = "Welcome to Online Banking!";
            String content = "Dear " + firstName
                    + ",\n\nWelcome to our Online Banking platform. We are verified and happy to have you!\n\nBest Regards,\nBank Team";

            callEmailService(email, subject, content);
            System.out.println("✅ Welcome Email Request Sent for: " + email);

            notificationService.saveNotification(email, subject, content);
        } catch (Exception e) {
            System.err.println("❌ Failed to delegate welcome email: " + e.getMessage());
        }
    }

    private void sendTransactionEmail(String email, BigDecimal amount) {
        try {
            String subject = "Transaction Success Alert";
            String content = "Dear Customer,\n\nYour transaction of ₹" + amount
                    + " has been processed successfully.\n\nThank you for banking with us!\n\nBest Regards,\nBank Team";

            callEmailService(email, subject, content);
            System.out.println("✅ Transaction Email Request Sent for: " + email);
        } catch (Exception e) {
            System.err.println("❌ Failed to delegate transaction email: " + e.getMessage());
        }
    }

    private void callEmailService(String toEmail, String subject, String content) {
        try {
            Map<String, String> request = new HashMap<>();
            request.put("toEmail", toEmail);
            request.put("subject", subject);
            request.put("content", content);

            restTemplate.postForObject(EMAIL_SERVICE_URL, request, String.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Email-Service: " + e.getMessage());
        }
    }
}
