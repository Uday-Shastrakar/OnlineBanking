-- liquibase formatted sql
-- changeset mohit.kulkarni :create-transaction-table

CREATE TABLE IF NOT EXISTS `transaction` (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    debit_amount DECIMAL(15, 2),
    credit_amount DECIMAL(15, 2),
    sender_account_number BIGINT,
    receiver_account_number BIGINT,
    transaction_date_time TIMESTAMP,
    description VARCHAR(255) NULL,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NULL,
    updated_by VARCHAR(255) NULL,
    version BIGINT DEFAULT 0 NOT NULL
);
