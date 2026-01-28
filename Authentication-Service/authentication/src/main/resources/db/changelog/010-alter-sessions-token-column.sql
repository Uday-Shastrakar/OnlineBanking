-- Alter sessions table to increase token column length if table exists
ALTER TABLE sessions MODIFY COLUMN token VARCHAR(2048) NOT NULL;
