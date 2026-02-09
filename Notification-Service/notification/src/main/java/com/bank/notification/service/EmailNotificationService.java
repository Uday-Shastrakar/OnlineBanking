package com.bank.notification.service;

import com.bank.notification.model.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final RestTemplate restTemplate;

    @Value("${email.service.url:http://localhost:9097}")
    private String emailServiceUrl;

    public void sendEmailNotification(Notification notification) {
        try {
            // Call Email Service API to send email
            EmailRequest emailRequest = new EmailRequest();
            emailRequest.setToEmail(notification.getRecipient());
            emailRequest.setSubject(notification.getSubject());
            emailRequest.setContent(notification.getContent());

            restTemplate.postForObject(
                emailServiceUrl + "/email/send",
                emailRequest,
                String.class
            );

            log.info("Email notification sent successfully to: {}", notification.getRecipient());
        } catch (Exception e) {
            log.error("Failed to send email notification to {}: {}", notification.getRecipient(), e.getMessage());
            notification.setStatus("FAILED");
        }
    }

    // DTO for Email Service request
    public static class EmailRequest {
        private String toEmail;
        private String subject;
        private String content;

        // Getters and Setters
        public String getToEmail() { return toEmail; }
        public void setToEmail(String toEmail) { this.toEmail = toEmail; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
