package com.bank.notification.repository;

import com.bank.notification.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByTimestampDesc(String recipient);
    
    @Query("SELECT n FROM Notification n WHERE n.recipient = :email AND n.isRead = false ORDER BY n.timestamp DESC")
    List<Notification> findUnreadNotifications(@Param("email") String email);
    
    @Query("SELECT n FROM Notification n WHERE n.recipient = :email AND n.type = :type ORDER BY n.timestamp DESC")
    List<Notification> findByRecipientAndType(@Param("email") String email, @Param("type") String type);
    
    @Query("SELECT n FROM Notification n WHERE n.recipient = :email AND n.priority = :priority ORDER BY n.timestamp DESC")
    List<Notification> findByRecipientAndPriority(@Param("email") String email, @Param("priority") String priority);
    
    @Query("SELECT n FROM Notification n WHERE n.recipient = :email AND n.category = :category ORDER BY n.timestamp DESC")
    List<Notification> findByRecipientAndCategory(@Param("email") String email, @Param("category") String category);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient = :email AND n.isRead = false")
    Long countUnreadNotifications(@Param("email") String email);
}
