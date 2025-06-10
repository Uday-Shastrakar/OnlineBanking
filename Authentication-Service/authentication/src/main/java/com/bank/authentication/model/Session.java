package com.bank.authentication.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sessions")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sessionId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String token;

    private LocalDateTime expiration;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime lastAccessed;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        lastAccessed = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        lastAccessed = LocalDateTime.now();
    }
}
