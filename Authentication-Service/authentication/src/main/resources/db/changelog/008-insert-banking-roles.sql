-- liquibase formatted sql
-- changeset banking-system:insert-banking-roles

INSERT INTO roles (role_name, display_name, description) VALUES
('CUSTOMER_USER', 'Customer Internet Banking User', 'Access to personal banking operations'),
('BANK_STAFF', 'Bank Staff/Teller', 'Access to customer service operations'),
('ADMIN', 'System Administrator', 'Full system access and configuration'),
('AUDITOR', 'Read-only Audit Access', 'Access to audit logs and reports');
