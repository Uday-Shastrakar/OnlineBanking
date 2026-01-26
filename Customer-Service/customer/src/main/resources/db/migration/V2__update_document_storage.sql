-- Database Migration: Change proof_of_address from BLOB to VARCHAR
-- This migration updates the customers table to store file paths instead of binary data

-- Step 1: Add new column for file path
ALTER TABLE customers 
ADD COLUMN document_path VARCHAR(500);

-- Step 2: Update existing records (if any) to use the new column
-- Note: Existing BLOB data will be lost - this is expected since we're moving to file system storage
UPDATE customers 
SET document_path = CONCAT('/documents/proof-of-address/', user_id, '_migrated_document')
WHERE proof_of_address IS NOT NULL;

-- Step 3: Drop the old BLOB column (after confirming migration is successful)
-- Uncomment this line only after you've verified the new system works
-- ALTER TABLE customers DROP COLUMN proof_of_address;

-- Step 4: Rename the new column to the original name (optional)
-- Uncomment this line if you want to keep the original column name
-- ALTER TABLE customers CHANGE COLUMN document_path proof_of_address VARCHAR(500);

-- For now, we'll keep both columns during transition period
-- Final state will have:
-- - proof_of_address (old BLOB column, will be dropped later)
-- - document_path (new VARCHAR column with file paths)
