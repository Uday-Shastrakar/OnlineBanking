-- liquibase formatted sql
-- changeset banking-system:create-users-table

CREATE TABLE IF NOT EXISTS `users` (
    `user_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `failed_login_attempts` INT NOT NULL DEFAULT 0,
    `last_login_at` TIMESTAMP NULL,
    `locked_until` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NULL,
    `created_by` VARCHAR(255) NULL,
    `updated_by` VARCHAR(255) NULL,
    `version` BIGINT DEFAULT 0 NOT NULL,
    INDEX `idx_users_username` (`username`),
    INDEX `idx_users_status` (`status`)
);
