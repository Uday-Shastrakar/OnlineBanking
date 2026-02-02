package com.bank.email.controller;

import com.bank.email.service.EmailService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.mail.MessagingException;

@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
@Slf4j
public class EmailController {
    private final EmailService emailService;

    @PostMapping("/send")
    public String sendEmail(@RequestBody GenericEmailRequest request) {
        try {
            // Use the notification-email template by default for generic requests
            emailService.sendNotificationEmail(
                    request.getToEmail(),
                    request.getSubject(),
                    request.getSubject(), // Use subject as title if not provided
                    request.getContent());
            return "✅ HTML Email sent successfully via template";
        } catch (MessagingException e) {
            log.error("❌ Error via API: {}", e.getMessage());
            return "❌ Failed to send email: " + e.getMessage();
        }
    }

    @Data
    public static class OtpRequest {
        private String toEmail;
        private String otp;
    }

    @Data
    public static class GenericEmailRequest {
        private String toEmail;
        private String subject;
        private String content;
    }
}
