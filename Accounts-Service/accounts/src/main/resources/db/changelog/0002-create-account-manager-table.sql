-- liquibase formatted sql
-- changeset nirmit.sawlekar:create-account-manager-table
CREATE TABLE IF NOT EXISTS `account_manager`(
     id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        version BIGINT DEFAULT 0 NOT NULL
);