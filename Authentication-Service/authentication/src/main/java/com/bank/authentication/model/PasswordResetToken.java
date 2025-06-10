package com.bank.authentication.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tokenId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false) // Ensure user_id is not null
    private User user;

    @Column(nullable = false, unique = true) // Ensure the token is unique
    private String token;

    @Column(nullable = false) // Ensure expiration is not null
    private LocalDateTime expiration;

    @Column(nullable = false) // Ensure createdAt is not null
    private LocalDateTime createdAt;
}
