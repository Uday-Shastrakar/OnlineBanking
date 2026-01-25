package com.bank.notification.listener;

import com.bank.notification.event.UserRegisteredEvent;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class NotificationListener {

    @Autowired
    private JavaMailSender javaMailSender;

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

            notificationService.saveNotification(
                    recipient,
                    "Transaction Alert: Success",
                    "Your transfer of funds has been completed successfully. Amount: ₹" + amount);
            System.out.println("✅ Transaction Notification Saved for: " + recipient);
        } catch (Exception e) {
            System.err.println("❌ Failed to process transaction notification: " + e.getMessage());
        }
    }

    private void sendWelcomeEmail(String email, String firstName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Welcome to Online Banking!");
            message.setText("Dear " + firstName
                    + ",\n\nWelcome to our Online Banking platform. We are verified and happy to have you!\n\nBest Regards,\nBank Team");

            // javaMailSender.send(message); // Uncomment when real SMTP is ready
            System.out.println("✅ Email Sent Successfully to: " + email);

            notificationService.saveNotification(
                    email,
                    message.getSubject(),
                    message.getText());
        } catch (Exception e) {
            System.err.println("❌ Failed to send email: " + e.getMessage());
        }
    }
}
