package com.bank.notification.service;

import com.bank.notification.model.NotificationPreference;
import com.bank.notification.repository.NotificationPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository repository;

    public NotificationPreference getOrCreatePreference(String userId, String email) {
        Optional<NotificationPreference> existing = repository.findByUserId(userId);
        
        if (existing.isPresent()) {
            return existing.get();
        }

        NotificationPreference preference = new NotificationPreference();
        preference.setUserId(userId);
        preference.setEmail(email);
        preference.setCreatedAt(LocalDateTime.now());
        preference.setUpdatedAt(LocalDateTime.now());
        
        return repository.save(preference);
    }

    public NotificationPreference updatePreference(String userId, NotificationPreference updatedPreference) {
        Optional<NotificationPreference> existing = repository.findByUserId(userId);
        
        if (existing.isPresent()) {
            NotificationPreference preference = existing.get();
            
            // Update email preferences
            preference.setEmailEnabled(updatedPreference.getEmailEnabled());
            preference.setEmailTransactions(updatedPreference.getEmailTransactions());
            preference.setEmailSecurity(updatedPreference.getEmailSecurity());
            preference.setEmailMarketing(updatedPreference.getEmailMarketing());
            preference.setEmailAccountUpdates(updatedPreference.getEmailAccountUpdates());
            
            // Update SMS preferences
            preference.setSmsEnabled(updatedPreference.getSmsEnabled());
            preference.setSmsTransactions(updatedPreference.getSmsTransactions());
            preference.setSmsSecurity(updatedPreference.getSmsSecurity());
            preference.setSmsMarketing(updatedPreference.getSmsMarketing());
            
            // Update push preferences
            preference.setPushEnabled(updatedPreference.getPushEnabled());
            preference.setPushTransactions(updatedPreference.getPushTransactions());
            preference.setPushSecurity(updatedPreference.getPushSecurity());
            preference.setPushMarketing(updatedPreference.getPushMarketing());
            preference.setPushAccountUpdates(updatedPreference.getPushAccountUpdates());
            
            // Update frequency settings
            preference.setDailyDigest(updatedPreference.getDailyDigest());
            preference.setWeeklyDigest(updatedPreference.getWeeklyDigest());
            
            preference.setUpdatedAt(LocalDateTime.now());
            
            return repository.save(preference);
        }
        
        throw new RuntimeException("Preference not found for user: " + userId);
    }

    public boolean shouldSendNotification(String userId, String channel, String category) {
        Optional<NotificationPreference> preferenceOpt = repository.findByUserId(userId);
        
        if (preferenceOpt.isEmpty()) {
            // Default preferences - allow security notifications
            return "SECURITY".equals(category);
        }

        NotificationPreference preference = preferenceOpt.get();

        return switch (channel.toUpperCase()) {
            case "EMAIL" -> switch (category.toUpperCase()) {
                case "TRANSACTION" -> preference.getEmailTransactions();
                case "SECURITY" -> preference.getEmailSecurity();
                case "MARKETING" -> preference.getEmailMarketing();
                case "ACCOUNT" -> preference.getEmailAccountUpdates();
                default -> preference.getEmailEnabled();
            };
            case "SMS" -> switch (category.toUpperCase()) {
                case "TRANSACTION" -> preference.getSmsTransactions();
                case "SECURITY" -> preference.getSmsSecurity();
                case "MARKETING" -> preference.getSmsMarketing();
                default -> preference.getSmsEnabled();
            };
            case "PUSH" -> switch (category.toUpperCase()) {
                case "TRANSACTION" -> preference.getPushTransactions();
                case "SECURITY" -> preference.getPushSecurity();
                case "MARKETING" -> preference.getPushMarketing();
                case "ACCOUNT" -> preference.getPushAccountUpdates();
                default -> preference.getPushEnabled();
            };
            default -> true; // IN_APP notifications are always allowed
        };
    }

    public void deletePreference(String userId) {
        repository.deleteByUserId(userId);
        log.info("Deleted notification preferences for user: {}", userId);
    }
}
