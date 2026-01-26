-- liquibase formatted sql
-- changeset banking-system:update-account-table

-- First, create a backup of existing data
CREATE TABLE IF NOT EXISTS `account_backup` AS SELECT * FROM `account`;

-- Drop the old table and recreate with new structure
DROP TABLE IF EXISTS `account`;

CREATE TABLE IF NOT EXISTS `account` (
    `account_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `customer_id` BIGINT NOT NULL,
    `account_number` BIGINT NOT NULL UNIQUE,
    `account_type` ENUM('SAVINGS', 'CURRENT', 'BUSINESS', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT') NOT NULL,
    `balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NULL,
    `created_by` VARCHAR(255) NULL,
    `updated_by` VARCHAR(255) NULL,
    `version` BIGINT DEFAULT 0 NOT NULL,
    INDEX `idx_account_customer_id` (`customer_id`),
    INDEX `idx_account_number` (`account_number`),
    INDEX `idx_account_type` (`account_type`),
    INDEX `idx_account_status` (`status`),
    CONSTRAINT `fk_account_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE
);

-- Restore data from backup if exists
INSERT INTO `account` (
    `account_id`, `customer_id`, `account_number`, `account_type`, `balance`, `status`, 
    `created_at`, `updated_at`
)
SELECT 
    `id`, 
    `customer_id`, 
    `account_number`,
    `account_type`,
    `balance`,
    `status`,
    `created_at`,
    `updated_at`
FROM `account_backup` 
WHERE `id` IS NOT NULL;
