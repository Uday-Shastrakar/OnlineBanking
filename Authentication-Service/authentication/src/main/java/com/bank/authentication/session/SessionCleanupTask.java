package com.bank.authentication.session;

import com.bank.authentication.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class SessionCleanupTask {

    private final SessionService sessionService;

    @Autowired
    public SessionCleanupTask(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @Scheduled(cron = "0 0 * * * ?") // Runs every hour, adjust as needed
    public void cleanupExpiredSessions() {
        LocalDateTime now = LocalDateTime.now();
        sessionService.deleteExpiredSessions(now);
    }
}
