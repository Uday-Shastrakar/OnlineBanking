-- liquibase formatted sql
-- changeset mohit.kulkarni :create-idempotency-keys-table

CREATE TABLE IF NOT EXISTS `idempotency_keys` (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    response_payload TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    UNIQUE KEY `idx_user_idempotency` (`user_id`, `idempotency_key`)
);
