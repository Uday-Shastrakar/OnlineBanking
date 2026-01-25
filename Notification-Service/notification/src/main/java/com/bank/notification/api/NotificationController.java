package com.bank.notification.api;

import com.bank.notification.model.Notification;
import com.bank.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService service;

    @GetMapping
    public List<Notification> getNotifications(@RequestParam String email) {
        return service.getNotificationsForUser(email);
    }
}
