package com.bank.notification.service;

import com.bank.notification.model.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class SmsNotificationService {

    @Value("${sms.api.key:dummy-key}")
    private String smsApiKey;

    @Value("${sms.api.url:https://api.sms-provider.com/send}")
    private String smsApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendSmsNotification(Notification notification) {
        try {
            // Mock SMS implementation - replace with actual SMS provider
            log.info("Sending SMS to {}: {}", notification.getRecipient(), notification.getSubject());
            
            // Example with Twilio-like API
            /*
            Map<String, String> smsRequest = Map.of(
                "to", notification.getRecipient(),
                "message", formatSmsMessage(notification),
                "from", "NUMSBank"
            );
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + smsApiKey);
            headers.set("Content-Type", "application/json");
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(smsRequest, headers);
            restTemplate.postForObject(smsApiUrl, entity, String.class);
            */
            
            log.info("SMS notification sent successfully to: {}", notification.getRecipient());
        } catch (Exception e) {
            log.error("Failed to send SMS notification to {}: {}", notification.getRecipient(), e.getMessage());
            notification.setStatus("FAILED");
        }
    }

    private String formatSmsMessage(Notification notification) {
        // Format message for SMS (character limit considerations)
        String message = notification.getSubject() + "\n";
        if (notification.getContent().length() > 140) {
            message += notification.getContent().substring(0, 137) + "...";
        } else {
            message += notification.getContent();
        }
        message += "\n\n-NUMS Bank";
        return message;
    }
}
