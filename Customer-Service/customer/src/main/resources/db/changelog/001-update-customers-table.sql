-- liquibase formatted sql
-- changeset banking-system:update-customers-table

-- First, create a backup of existing data
CREATE TABLE IF NOT EXISTS `customers_backup` AS SELECT * FROM `customers`;

-- Drop the old table and recreate with new structure
DROP TABLE IF EXISTS `customers`;

CREATE TABLE IF NOT EXISTS `customers` (
    `customer_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(255) NOT NULL,
    `date_of_birth` DATE NOT NULL,
    `address` TEXT NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone_number` VARCHAR(20) NULL,
    `gender` VARCHAR(10) NULL,
    `kyc_status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `proof_of_address` VARCHAR(500) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NULL,
    `created_by` VARCHAR(255) NULL,
    `updated_by` VARCHAR(255) NULL,
    `version` BIGINT DEFAULT 0 NOT NULL,
    INDEX `idx_customers_email` (`email`),
    INDEX `idx_customers_phone` (`phone_number`),
    INDEX `idx_customers_kyc_status` (`kyc_status`),
    INDEX `idx_customers_status` (`status`)
);

-- Restore data from backup if exists
INSERT INTO `customers` (
    `customer_id`, `full_name`, `date_of_birth`, `address`, `email`, `phone_number`, 
    `gender`, `kyc_status`, `status`, `proof_of_address`, `created_at`, `updated_at`
)
SELECT 
    `id`, 
    CONCAT(COALESCE(`first_name`, ''), ' ', COALESCE(`last_name`, '')) as `full_name`,
    `date_of_birth`,
    `address`,
    `email`,
    `phone_number`,
    `gender`,
    'PENDING' as `kyc_status`,  -- Default to PENDING for existing records
    `status`,
    `proof_of_address`,
    `created_at`,
    `updated_at`
FROM `customers_backup` 
WHERE `id` IS NOT NULL;
