package com.bank.notification.service;

import com.bank.notification.model.Notification;
import com.bank.notification.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository repository;

    public void saveNotification(String recipient, String subject, String content) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setSubject(subject);
        notification.setContent(content);
        notification.setTimestamp(LocalDateTime.now());
        notification.setStatus("SENT");
        repository.save(notification);
    }

    public List<Notification> getNotificationsForUser(String email) {
        return repository.findByRecipientOrderByTimestampDesc(email);
    }
}
