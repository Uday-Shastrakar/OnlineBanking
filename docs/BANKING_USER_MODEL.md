# Banking Application User Types - Real Banking Model

## 🎯 OBJECTIVE

Define all types of users used in a banking system, their responsibilities, permissions, and strict boundaries following actual core-banking standards.

## 🧩 CORE BANKING RULE (MANDATORY)

**User ≠ Customer ≠ Account**

- **User** = System login identity
- **Customer** = Legal banking client  
- **Account** = Holds money and belongs to Customer
- **Users NEVER directly own money**

## 👤 TYPES OF USERS (STRICT)

### 1️⃣ CUSTOMER_USER (Internet / Mobile Banking User)

**Responsibilities:**
- Can login to banking application
- Can view own accounts
- Can transfer money
- Can view transaction history
- Can update limited profile data

**❌ Strictly Forbidden:**
- Cannot access admin features
- Cannot view other customers
- Cannot access audit logs

**Permissions:**
- `PERMISSION_CUSTOMER_LOGIN`
- `PERMISSION_CUSTOMER_VIEW_BALANCE`
- `PERMISSION_CUSTOMER_VIEW_TRANSACTIONS`
- `PERMISSION_CUSTOMER_TRANSFER_OWN`
- `PERMISSION_CUSTOMER_TRANSFER_EXTERNAL`
- `PERMISSION_CUSTOMER_UPDATE_PROFILE`

---

### 2️⃣ BANK_STAFF (Internal Bank Employee)

**Responsibilities:**
- Can login to internal portal
- Can view customer profiles (read-only)
- Can assist customers operationally

**❌ Strictly Forbidden:**
- Cannot transfer money
- Cannot edit balances
- Cannot access full audit logs

**Permissions:**
- `PERMISSION_STAFF_LOGIN`
- `PERMISSION_STAFF_VIEW_CUSTOMER_PROFILE`
- `PERMISSION_STAFF_VIEW_ACCOUNT_METADATA`
- `PERMISSION_STAFF_CUSTOMER_ASSISTANCE`
- `PERMISSION_STAFF_VIEW_LIMITED_AUDIT`

---

### 3️⃣ ADMIN (System Administrator)

**Responsibilities:**
- Can manage system users
- Can block / unblock accounts
- Can view system metrics
- Can access audit logs

**❌ Strictly Forbidden:**
- Cannot credit or debit money
- Cannot modify transaction history
- Cannot edit balances manually

**Permissions:**
- `PERMISSION_ADMIN_LOGIN`
- `PERMISSION_ADMIN_MANAGE_USERS`
- `PERMISSION_ADMIN_BLOCK_ACCOUNTS`
- `PERMISSION_ADMIN_VIEW_METRICS`
- `PERMISSION_ADMIN_ACCESS_AUDIT`
- `PERMISSION_ADMIN_MANAGE_CONFIG`
- `PERMISSION_ADMIN_FORCE_PASSWORD_RESET`
- `PERMISSION_ADMIN_VIEW_ALL_CUSTOMERS`

---

### 4️⃣ AUDITOR (Compliance / Regulatory User)

**Responsibilities:**
- Can login to audit portal
- Can view audit logs
- Can trace transactions
- Can export compliance reports

**❌ Strictly Forbidden:**
- Cannot modify any data
- Cannot perform operations
- Cannot access customer UI

**Permissions:**
- `PERMISSION_AUDITOR_LOGIN`
- `PERMISSION_AUDITOR_VIEW_AUDIT_LOGS`
- `PERMISSION_AUDITOR_TRACE_TRANSACTIONS`
- `PERMISSION_AUDITOR_EXPORT_REPORTS`
- `PERMISSION_AUDITOR_INVESTIGATE`

---

### 5️⃣ SYSTEM (Non-Human Internal User)

**Responsibilities:**
- Used by internal services (Kafka consumers, schedulers)
- All actions must be audited

**❌ Strictly Forbidden:**
- No UI login
- Cannot perform user operations
- Cannot access customer data directly

**Permissions:**
- `PERMISSION_SYSTEM_SERVICE_AUTH`
- `PERMISSION_SYSTEM_PUBLISH_EVENTS`
- `PERMISSION_SYSTEM_CONSUME_AUDIT`
- `PERMISSION_SYSTEM_SCHEDULED_TASKS`

## 📊 REQUIRED SUMMARY TABLE

| User Type | Login UI | Can Transact | Can Admin | Can Audit |
|------------|----------|--------------|------------|-----------|
| CUSTOMER_USER | ✅ | ✅ | ❌ | ❌ |
| BANK_STAFF | ✅ | ❌ | ❌ | ❌ |
| ADMIN | ✅ | ❌ | ✅ | ✅ |
| AUDITOR | ✅ | ❌ | ❌ | ✅ |
| SYSTEM | ❌ | ❌ | ❌ | ❌ |

## 🔐 AUTHORIZATION RULES

### Core Principles:
1. **Only CUSTOMER_USER can initiate money movement**
2. **Admins supervise, never operate**
3. **Auditors are read-only**
4. **System users never authenticate via UI**
5. **Every action must be auditable**

### Segregation of Duties:
- **Transaction Operations**: Only CUSTOMER_USER
- **Customer Support**: Only BANK_STAFF (read-only)
- **System Administration**: Only ADMIN
- **Compliance & Audit**: Only AUDITOR
- **Service Operations**: Only SYSTEM

## 🚫 STRICTLY FORBIDDEN

### ❌ Generic USER role
- Must use specific role types
- No generic permissions

### ❌ Merging User and Customer entities
- User = System identity
- Customer = Legal client
- Account = Money container

### ❌ Admin modifying balances
- Admins cannot directly edit account balances
- All balance changes must go through transaction service

### ❌ Staff performing transactions
- Bank staff cannot initiate money transfers
- Only customer users can transact

### ❌ Mutable audit logs
- Audit records must be immutable
- No updates or deletes allowed

## 📦 IMPLEMENTATION FILES

### Backend (Java/Spring Boot):
- `BankUserRole.java` - Role enumeration
- `BankPermission.java` - Permission enumeration
- `BankingRolePermissionMapper.java` - Role-permission mapping

### Frontend (TypeScript/React):
- `bankingRoles.ts` - Role definitions and utilities
- Role-based routing components
- Permission-based UI components

### Database:
- User table with role constraints
- Permission mapping tables
- Audit trail for all role changes

## 🔄 ROLE LIFECYCLE

### User Creation:
1. User created with specific role
2. Default permissions assigned based on role
3. Audit log entry created
4. Role cannot be changed without audit

### Permission Changes:
1. Only ADMIN can modify user roles
2. All role changes audited
3. Immediate permission re-evaluation
4. Session invalidation if needed

### Access Control:
1. JWT tokens contain role and permissions
2. Every API call validates permissions
3. UI components render based on permissions
4. Audit trail for all access attempts

## 🛡️ SECURITY COMPLIANCE

### Banking Standards:
- **Segregation of Duties**: Enforced at code level
- **Principle of Least Privilege**: Minimum required permissions
- **Audit Trail**: Complete immutable logging
- **Role-Based Access**: Strict role enforcement

### Regulatory Requirements:
- **SOX Compliance**: Audit trail for all changes
- **PCI DSS**: Secure handling of financial data
- **GDPR**: Data protection and privacy
- **Banking Regulations**: Compliance with local banking laws

## 📋 VALIDATION CHECKLIST

### ✅ Implementation Must:
- [ ] Enforce User ≠ Customer ≠ Account separation
- [ ] Implement all 5 user types correctly
- [ ] Follow permission matrix strictly
- [ ] Audit all role changes
- [ ] Prevent forbidden operations
- [ ] Maintain immutable audit logs
- [ ] Validate role-permission integrity

### ❌ Implementation Must Not:
- [ ] Have generic USER role
- [ ] Allow admin balance modifications
- [ ] Permit staff transactions
- [ ] Create mutable audit logs
- [ ] Merge user and customer entities
- [ ] Bypass role-based access control

This model ensures banking compliance, security, and proper segregation of duties as required in real core-banking systems.
