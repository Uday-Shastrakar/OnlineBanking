package com.bank.email.controller;

import com.bank.email.service.EmailService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.mail.MessagingException;

@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
public class EmailController {
    private final EmailService emailService;

    @PostMapping("/send-otp")
    public String sendOtpEmail(@RequestBody OtpRequest otpRequest) {
        try {
            emailService.sendOtpEmail(otpRequest.getToEmail(), otpRequest.getOtp());
            return "✅ Email sent successfully";
        } catch (MessagingException e) {
            e.printStackTrace();
            return "❌ Failed to send email: " + e.getMessage();
        }
    }
    @Data
    public static class OtpRequest {
        private String toEmail;
        private String otp;
        // Getters and Setters
    }

}
