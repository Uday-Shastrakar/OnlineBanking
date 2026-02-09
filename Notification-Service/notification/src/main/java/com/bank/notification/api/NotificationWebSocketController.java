package com.bank.notification.api;

import com.bank.notification.model.Notification;
import com.bank.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class NotificationWebSocketController {

    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/send-notification")
    public void sendNotification(@Payload Notification notification) {
        try {
            // Save and send notification
            notificationService.sendNotification(
                    notification.getRecipient(),
                    notification.getSubject(),
                    notification.getContent(),
                    notification.getType(),
                    notification.getPriority(),
                    notification.getCategory()
            );

            // Send real-time update to specific user
            messagingTemplate.convertAndSendToUser(
                    notification.getRecipient(),
                    "/queue/notifications",
                    notification
            );

            log.info("Real-time notification sent to user: {}", notification.getRecipient());
        } catch (Exception e) {
            log.error("Error sending real-time notification: {}", e.getMessage(), e);
        }
    }

    public void broadcastNotification(Notification notification) {
        try {
            messagingTemplate.convertAndSend("/topic/notifications", notification);
            log.info("Broadcast notification sent: {}", notification.getSubject());
        } catch (Exception e) {
            log.error("Error broadcasting notification: {}", e.getMessage(), e);
        }
    }

    public void sendUnreadCountUpdate(String email, Long unreadCount) {
        try {
            messagingTemplate.convertAndSendToUser(
                    email,
                    "/queue/unread-count",
                    unreadCount
            );
            log.info("Unread count update sent to user: {}", email);
        } catch (Exception e) {
            log.error("Error sending unread count update: {}", e.getMessage(), e);
        }
    }
}
