-- liquibase formatted sql
-- changeset banking-system:create-audit-logs-table

CREATE TABLE IF NOT EXISTS `audit_logs` (
    `audit_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `customer_id` BIGINT NULL,
    `entity_type` VARCHAR(50) NULL,
    `entity_id` BIGINT NULL,
    `action` VARCHAR(255) NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `accept_language` VARCHAR(255) NULL,
    `referer` VARCHAR(500) NULL,
    `correlation_id` VARCHAR(100) NULL,
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `description` TEXT NULL,
    `old_value` TEXT NULL,
    `new_value` TEXT NULL,
    INDEX `idx_audit_user_id` (`user_id`),
    INDEX `idx_audit_customer_id` (`customer_id`),
    INDEX `idx_audit_entity` (`entity_type`, `entity_id`),
    INDEX `idx_audit_action` (`action`),
    INDEX `idx_audit_timestamp` (`timestamp`),
    INDEX `idx_audit_correlation_id` (`correlation_id`),
    CONSTRAINT `fk_audit_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
);
