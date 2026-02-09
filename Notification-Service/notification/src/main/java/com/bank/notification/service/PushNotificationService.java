package com.bank.notification.service;

import com.bank.notification.model.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class PushNotificationService {

    // In-memory storage for device tokens (in production, use Redis or database)
    private final Map<String, String> userDeviceTokens = new ConcurrentHashMap<>();

    public void registerDeviceToken(String userId, String deviceToken) {
        userDeviceTokens.put(userId, deviceToken);
        log.info("Registered device token for user: {}", userId);
    }

    public void sendPushNotification(Notification notification) {
        try {
            String deviceToken = userDeviceTokens.get(notification.getRecipient());
            
            if (deviceToken == null) {
                log.warn("No device token found for user: {}", notification.getRecipient());
                return;
            }

            // Mock push notification - replace with FCM/APNs implementation
            log.info("Sending push notification to user {}: {}", notification.getRecipient(), notification.getSubject());

            // Example with Firebase Cloud Messaging
            /*
            Map<String, Object> pushMessage = Map.of(
                "to", deviceToken,
                "notification", Map.of(
                    "title", notification.getSubject(),
                    "body", truncateMessage(notification.getContent()),
                    "icon", "/icons/notification-icon.png",
                    "click_action", "/notifications"
                ),
                "data", Map.of(
                    "notificationId", notification.getId().toString(),
                    "type", notification.getType(),
                    "category", notification.getCategory()
                )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "key=" + fcmServerKey);
            headers.set("Content-Type", "application/json");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(pushMessage, headers);
            restTemplate.postForObject(fcmApiUrl, entity, String.class);
            */

            log.info("Push notification sent successfully to user: {}", notification.getRecipient());
        } catch (Exception e) {
            log.error("Failed to send push notification to user {}: {}", notification.getRecipient(), e.getMessage());
            notification.setStatus("FAILED");
        }
    }

    private String truncateMessage(String message) {
        if (message.length() > 200) {
            return message.substring(0, 197) + "...";
        }
        return message;
    }

    public void unregisterDeviceToken(String userId) {
        userDeviceTokens.remove(userId);
        log.info("Unregistered device token for user: {}", userId);
    }
}
