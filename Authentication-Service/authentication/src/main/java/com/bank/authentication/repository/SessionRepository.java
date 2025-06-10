package com.bank.authentication.repository;

import com.bank.authentication.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface SessionRepository extends JpaRepository<Session, Long> {
    Session findByToken(String token);

    void deleteAllByExpirationBefore(LocalDateTime now);
}
