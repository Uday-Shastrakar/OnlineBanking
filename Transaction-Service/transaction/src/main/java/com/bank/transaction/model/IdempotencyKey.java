package com.bank.transaction.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "idempotency_keys", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "userId", "idempotencyKey" })
})
public class IdempotencyKey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String idempotencyKey;

    @Column(nullable = false)
    private String status; // e.g., PROCESSING, COMPLETED, FAILED

    @Column(columnDefinition = "TEXT")
    private String responsePayload;

    private Instant createdAt;
    private Instant expiresAt;
}
