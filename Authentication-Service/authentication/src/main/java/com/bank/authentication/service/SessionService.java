package com.bank.authentication.service;

import com.bank.authentication.model.Session;
import com.bank.authentication.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;

    @Autowired
    public SessionService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public Session createSession(Session session) {
        return sessionRepository.save(session);
    }

    public Optional<Session> getSessionByToken(String token) {
        return Optional.ofNullable(sessionRepository.findByToken(token));
    }

    public void deleteSession(Long sessionId) {
        sessionRepository.deleteById(sessionId);
    }

    public void deleteExpiredSessions(LocalDateTime now) {
        sessionRepository.deleteAllByExpirationBefore(now);
    }

    public Optional<String> getUserEmailByToken(String token) {
        return getSessionByToken(token)
                .map(session -> session.getUser().getEmail());
    }

    public Optional<Long> getUserIdByToken(String token) {
        return getSessionByToken(token)
                .map(session -> session.getUser().getUserId());
    }
}
