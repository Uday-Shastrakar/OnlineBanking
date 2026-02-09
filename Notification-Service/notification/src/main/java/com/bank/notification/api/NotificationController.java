package com.bank.notification.api;

import com.bank.notification.model.Notification;
import com.bank.notification.model.NotificationPreference;
import com.bank.notification.service.NotificationService;
import com.bank.notification.service.NotificationPreferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationPreferenceService preferenceService;

    // Get all notifications for a user
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam String email) {
        try {
            List<Notification> notifications = notificationService.getNotificationsForUser(email);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error fetching notifications for {}: {}", email, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get unread notifications for a user
    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@RequestParam String email) {
        try {
            List<Notification> notifications = notificationService.getUnreadNotifications(email);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error fetching unread notifications for {}: {}", email, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get unread count for a user
    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount(@RequestParam String email) {
        try {
            Long count = notificationService.getUnreadCount(email);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("Error fetching unread count for {}: {}", email, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get notifications by type
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Notification>> getNotificationsByType(
            @RequestParam String email, 
            @PathVariable String type) {
        try {
            List<Notification> notifications = notificationService.getNotificationsByType(email, type);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error fetching {} notifications for {}: {}", type, email, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get notifications by priority
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<Notification>> getNotificationsByPriority(
            @RequestParam String email, 
            @PathVariable String priority) {
        try {
            List<Notification> notifications = notificationService.getNotificationsByPriority(email, priority);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error fetching {} priority notifications for {}: {}", priority, email, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get notifications by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Notification>> getNotificationsByCategory(
            @RequestParam String email, 
            @PathVariable String category) {
        try {
            List<Notification> notifications = notificationService.getNotificationsByCategory(email, category);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error fetching {} category notifications for {}: {}", category, email, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Send a single notification
    @PostMapping("/send")
    public CompletableFuture<ResponseEntity<String>> sendNotification(@RequestBody NotificationRequest request) {
        return notificationService.sendNotification(
                request.getRecipient(),
                request.getSubject(),
                request.getContent(),
                request.getType(),
                request.getPriority(),
                request.getCategory()
        ).thenApply(v -> {
            log.info("Notification sent successfully to: {}", request.getRecipient());
            return ResponseEntity.ok("Notification sent successfully");
        }).exceptionally(e -> {
            log.error("Failed to send notification: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to send notification");
        });
    }

    // Send bulk notifications
    @PostMapping("/send/bulk")
    public CompletableFuture<ResponseEntity<String>> sendBulkNotifications(@RequestBody BulkNotificationRequest request) {
        return notificationService.sendBulkNotifications(
                request.getRecipients(),
                request.getSubject(),
                request.getContent(),
                request.getType(),
                request.getPriority(),
                request.getCategory()
        ).thenApply(v -> {
            log.info("Bulk notifications sent successfully to {} recipients", request.getRecipients().size());
            return ResponseEntity.ok("Bulk notifications sent successfully");
        }).exceptionally(e -> {
            log.error("Failed to send bulk notifications: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to send bulk notifications");
        });
    }

    // Mark notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(@PathVariable Long id) {
        try {
            notificationService.markAsRead(id);
            return ResponseEntity.ok("Notification marked as read");
        } catch (Exception e) {
            log.error("Error marking notification {} as read: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to mark notification as read");
        }
    }

    // Mark all notifications as read for a user
    @PutMapping("/read-all")
    public ResponseEntity<String> markAllAsRead(@RequestParam String email) {
        try {
            notificationService.markAllAsRead(email);
            return ResponseEntity.ok("All notifications marked as read");
        } catch (Exception e) {
            log.error("Error marking all notifications as read for {}: {}", email, e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to mark all notifications as read");
        }
    }

    // Delete a notification
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotification(@PathVariable Long id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok("Notification deleted successfully");
        } catch (Exception e) {
            log.error("Error deleting notification {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to delete notification");
        }
    }

    // Delete all notifications for a user
    @DeleteMapping("/all")
    public ResponseEntity<String> deleteAllNotifications(@RequestParam String email) {
        try {
            notificationService.deleteAllNotifications(email);
            return ResponseEntity.ok("All notifications deleted successfully");
        } catch (Exception e) {
            log.error("Error deleting all notifications for {}: {}", email, e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to delete all notifications");
        }
    }

    // Get notification preferences
    @GetMapping("/preferences")
    public ResponseEntity<NotificationPreference> getPreferences(@RequestParam String userId, @RequestParam String email) {
        try {
            NotificationPreference preferences = preferenceService.getOrCreatePreference(userId, email);
            return ResponseEntity.ok(preferences);
        } catch (Exception e) {
            log.error("Error fetching preferences for user {}: {}", userId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Update notification preferences
    @PutMapping("/preferences")
    public ResponseEntity<NotificationPreference> updatePreferences(
            @RequestParam String userId, 
            @RequestBody NotificationPreference preferences) {
        try {
            NotificationPreference updated = preferenceService.updatePreference(userId, preferences);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Error updating preferences for user {}: {}", userId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Delete notification preferences
    @DeleteMapping("/preferences")
    public ResponseEntity<String> deletePreferences(@RequestParam String userId) {
        try {
            preferenceService.deletePreference(userId);
            return ResponseEntity.ok("Preferences deleted successfully");
        } catch (Exception e) {
            log.error("Error deleting preferences for user {}: {}", userId, e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to delete preferences");
        }
    }

    // Request DTOs
    public static class NotificationRequest {
        private String recipient;
        private String subject;
        private String content;
        private String type = "EMAIL";
        private String priority = "MEDIUM";
        private String category = "SYSTEM";

        // Getters and Setters
        public String getRecipient() { return recipient; }
        public void setRecipient(String recipient) { this.recipient = recipient; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }

    public static class BulkNotificationRequest {
        private List<String> recipients;
        private String subject;
        private String content;
        private String type = "EMAIL";
        private String priority = "MEDIUM";
        private String category = "SYSTEM";

        // Getters and Setters
        public List<String> getRecipients() { return recipients; }
        public void setRecipients(List<String> recipients) { this.recipients = recipients; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }
}
