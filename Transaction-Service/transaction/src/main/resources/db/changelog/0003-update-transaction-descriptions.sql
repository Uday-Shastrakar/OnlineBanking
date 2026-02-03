-- Update existing transaction descriptions to role-based format
-- This migration converts old "Transfer Successful" descriptions to new role-based format

UPDATE transaction 
SET description = CONCAT(
    'SENDER:Transfer to A/C ****', 
    RIGHT(receiver_account_number, 4),
    '|RECEIVER:Transfer from A/C ****',
    RIGHT(sender_account_number, 4)
)
WHERE description = 'Transfer Successful' 
   OR description LIKE 'Money Sent to Account %'
   OR description LIKE 'Money Received from Account %'
   OR description IS NULL
   OR description = '';

-- Add a log entry for the migration
INSERT INTO transaction (id, debit_amount, credit_amount, sender_account_number, receiver_account_number, 
                        transaction_date_time, description, status, created_at, updated_at, created_by)
VALUES (
    999999,
    0.00,
    0.00,
    0,
    0,
    NOW(),
    'SYSTEM: Migration completed - Updated transaction descriptions to role-based format',
    'COMPLETED',
    NOW(),
    NOW(),
    'migration-script'
);
