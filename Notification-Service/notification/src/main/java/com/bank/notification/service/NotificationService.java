package com.bank.notification.service;

import com.bank.notification.model.Notification;
import com.bank.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository repository;
    private final EmailNotificationService emailNotificationService;
    private final SmsNotificationService smsNotificationService;
    private final PushNotificationService pushNotificationService;
    private final NotificationPreferenceService preferenceService;

    @Async
    @Transactional
    public CompletableFuture<Void> sendNotification(String recipient, String subject, String content, 
                                                  String type, String priority, String category) {
        try {
            // Check user preferences before sending
            if (!preferenceService.shouldSendNotification(recipient, type, category)) {
                log.info("Notification skipped due to user preferences for user: {}", recipient);
                return CompletableFuture.completedFuture(null);
            }

            Notification notification = new Notification();
            notification.setRecipient(recipient);
            notification.setSubject(subject);
            notification.setContent(content);
            notification.setType(type);
            notification.setPriority(priority);
            notification.setCategory(category);
            notification.setTimestamp(LocalDateTime.now());
            notification.setStatus("PENDING");
            notification.setIsRead(false);
            notification.setChannel(type);

            // Save notification first
            notification = repository.save(notification);

            // Send based on type
            switch (type.toUpperCase()) {
                case "EMAIL":
                case "HTML":
                    emailNotificationService.sendEmailNotification(notification);
                    break;
                case "SMS":
                    smsNotificationService.sendSmsNotification(notification);
                    break;
                case "PUSH":
                    pushNotificationService.sendPushNotification(notification);
                    break;
                case "IN_APP":
                    // In-app notifications are just stored
                    notification.setStatus("DELIVERED");
                    break;
                default:
                    log.warn("Unknown notification type: {}", type);
                    notification.setStatus("FAILED");
            }

            if (!"FAILED".equals(notification.getStatus())) {
                notification.setStatus("SENT");
            }

            repository.save(notification);
            log.info("Notification processed successfully for: {}", recipient);

        } catch (Exception e) {
            log.error("Error sending notification to {}: {}", recipient, e.getMessage(), e);
        }

        return CompletableFuture.completedFuture(null);
    }

    @Async
    @Transactional
    public CompletableFuture<Void> sendBulkNotifications(List<String> recipients, String subject, 
                                                         String content, String type, String priority, String category) {
        List<CompletableFuture<Void>> futures = recipients.stream()
                .map(recipient -> sendNotification(recipient, subject, content, type, priority, category))
                .toList();

        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));
    }

    public List<Notification> getNotificationsForUser(String email) {
        return repository.findByRecipientOrderByTimestampDesc(email);
    }

    public List<Notification> getUnreadNotifications(String email) {
        return repository.findUnreadNotifications(email);
    }

    public Long getUnreadCount(String email) {
        return repository.countUnreadNotifications(email);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = repository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notification.setStatus("READ");
        
        repository.save(notification);
        log.info("Marked notification as read: {}", notificationId);
    }

    @Transactional
    public void markAllAsRead(String email) {
        List<Notification> unreadNotifications = repository.findUnreadNotifications(email);
        
        unreadNotifications.forEach(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification.setStatus("READ");
        });
        
        repository.saveAll(unreadNotifications);
        log.info("Marked {} notifications as read for user: {}", unreadNotifications.size(), email);
    }

    public List<Notification> getNotificationsByType(String email, String type) {
        return repository.findByRecipientAndType(email, type);
    }

    public List<Notification> getNotificationsByPriority(String email, String priority) {
        return repository.findByRecipientAndPriority(email, priority);
    }

    public List<Notification> getNotificationsByCategory(String email, String category) {
        return repository.findByRecipientAndCategory(email, category);
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        repository.deleteById(notificationId);
        log.info("Deleted notification: {}", notificationId);
    }

    @Transactional
    public void deleteAllNotifications(String email) {
        List<Notification> notifications = repository.findByRecipientOrderByTimestampDesc(email);
        repository.deleteAll(notifications);
        log.info("Deleted {} notifications for user: {}", notifications.size(), email);
    }

    // Legacy method for backward compatibility
    public void saveNotification(String recipient, String subject, String content) {
        sendNotification(recipient, subject, content, "EMAIL", "MEDIUM", "SYSTEM");
    }
}
