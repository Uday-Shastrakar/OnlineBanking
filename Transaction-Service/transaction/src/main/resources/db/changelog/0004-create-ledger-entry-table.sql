-- Create ledger_entry table for banking-grade transaction history
-- Each row represents one ledger entry with Credit/Debit columns and running balance

CREATE TABLE ledger_entry (
    entry_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    account_number BIGINT NOT NULL,
    entry_type ENUM('CREDIT', 'DEBIT') NOT NULL,
    amount DECIMAL(19,2) NOT NULL,
    balance_after DECIMAL(19,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    
    INDEX idx_account_number (account_number),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_account_timestamp (account_number, timestamp),
    INDEX idx_status (status)
);

-- Add foreign key constraints if needed
-- ALTER TABLE ledger_entry ADD CONSTRAINT fk_ledger_transaction 
-- FOREIGN KEY (transaction_id) REFERENCES transaction(id);
