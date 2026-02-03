-- Add balance_after columns to transaction table
-- This will store the account balance after each transaction for both sender and receiver

ALTER TABLE transaction 
ADD COLUMN sender_balance_after DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN receiver_balance_after DECIMAL(15,2) DEFAULT 0.00;

-- Add comments to explain the purpose
ALTER TABLE transaction 
MODIFY COLUMN sender_balance_after DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Balance after transaction for sender account (Balance_before - debit_amount)',
MODIFY COLUMN receiver_balance_after DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Balance after transaction for receiver account (Balance_before + credit_amount)';
