-- liquibase formatted sql
-- changeset nirmit.sawlekar:create-accounts-table

CREATE TABLE IF NOT EXISTS `account`(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    account_number BIGINT NOT NULL UNIQUE,
    account_type ENUM('SAVING', 'CURRENT') NOT NULL,
    balance DECIMAL(15,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NULL,
    status VARCHAR(20) NULL,
    created_by VARCHAR(255) NULL,
    updated_by VARCHAR(255) NULL,
    version BIGINT DEFAULT 0 NOT NULL

);