package com.bank.notification.repository;

import com.bank.notification.model.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    Optional<NotificationPreference> findByUserId(String userId);
    Optional<NotificationPreference> findByEmail(String email);
    void deleteByUserId(String userId);
}
