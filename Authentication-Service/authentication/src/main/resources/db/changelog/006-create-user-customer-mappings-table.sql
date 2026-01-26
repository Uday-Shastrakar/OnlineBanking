-- liquibase formatted sql
-- changeset banking-system:create-user-customer-mappings-table

CREATE TABLE IF NOT EXISTS `user_customer_mappings` (
    `mapping_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `customer_id` BIGINT NOT NULL,
    `relationship_type` ENUM('PRIMARY', 'JOINT', 'VIEW_ONLY', 'AUTHORIZED_SIGNATORY') NOT NULL,
    `effective_from` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `effective_to` TIMESTAMP NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NULL,
    `created_by` VARCHAR(255) NULL,
    `updated_by` VARCHAR(255) NULL,
    `version` BIGINT DEFAULT 0 NOT NULL,
    UNIQUE KEY `unique_active_mapping` (`user_id`, `customer_id`, `is_active`),
    INDEX `idx_mappings_user_id` (`user_id`),
    INDEX `idx_mappings_customer_id` (`customer_id`),
    INDEX `idx_mappings_active` (`is_active`),
    INDEX `idx_mappings_effective` (`effective_from`, `effective_to`),
    CONSTRAINT `fk_mappings_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_mappings_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE
);
