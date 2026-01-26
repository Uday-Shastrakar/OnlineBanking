-- liquibase formatted sql
-- changeset banking-system:create-roles-table

CREATE TABLE IF NOT EXISTS `roles` (
    `role_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `role_name` VARCHAR(100) NOT NULL UNIQUE,
    `display_name` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NULL,
    `created_by` VARCHAR(255) NULL,
    `updated_by` VARCHAR(255) NULL,
    `version` BIGINT DEFAULT 0 NOT NULL,
    INDEX `idx_roles_name` (`role_name`)
);
