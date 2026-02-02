# 💳 Banking Application User Types - Real Banking Model

## 🏦 ROLES USED IN THE PROJECT (BANKING-GRADE)

### 1️⃣ CUSTOMER (Internet / Mobile Banking User)
**Who**: Real bank customer using the application.

**Can**:
- Login to customer portal
- View own accounts
- Transfer money
- View transaction history
- Manage limited profile data

**Cannot**:
- Access admin panel
- View other customers
- View audit logs
- Perform system actions

**Used in**:
- Customer UI
- Transaction Service
- Account Service (authorization check)
- Audit logs (as actor)

---

### 2️⃣ BANK_STAFF (Internal Bank Employee)
**Who**: Branch / operations staff.

**Can**:
- Login to internal portal
- View customer profiles (read-only)
- Assist customers operationally

**Cannot**:
- Transfer money
- Modify balances
- Block accounts
- Access audit center

**Used in**:
- Internal support screens
- Read-only customer lookups
- Audit logs

---

### 3️⃣ ADMIN (System Administrator)
**Who**: Core banking / platform admin.

**Can**:
- Manage system users
- Block / unblock accounts
- View system metrics
- Access full audit logs

**Cannot**:
- Credit or debit money
- Modify transaction records
- Override saga flows
- Edit balances manually

**Used in**:
- Admin UI
- User management
- Account lifecycle control
- Audit center

---

### 4️⃣ AUDITOR (Compliance / Regulatory Role)
**Who**: Compliance team / external auditor.

**Can**:
- Login to audit portal
- View immutable audit logs
- Trace transactions using correlation IDs
- Export reports

**Cannot**:
- Change any data
- Perform transactions
- Access customer UI
- Manage users

**Used in**:
- Audit Service
- Read-only admin endpoints

---

### 5️⃣ SYSTEM (Non-Human / Technical Role)
**Who**: Internal services (Kafka consumers, schedulers).

**Can**:
- Consume events
- Trigger notifications
- Perform background jobs

**Cannot**:
- Login via UI
- Call user APIs directly
- Act as a customer or admin

**Used in**:
- Notification Service
- Audit Service
- Background jobs

---

## 📊 ROLE SUMMARY TABLE (PROJECT TRUTH)

| Role | Login UI | Money Transfer | Admin Actions | Audit Access |
| :--- | :---: | :---: | :---: | :---: |
| **CUSTOMER_USER** | ✅ | ✅ | ❌ | ❌ |
| **BANK_STAFF** | ✅ | ❌ | ❌ | ❌ |
| **ADMIN** | ✅ | ❌ | ✅ | ✅ |
| **AUDITOR** | ✅ | ❌ | ❌ | ✅ |
| **SYSTEM** | ❌ | ❌ | ❌ | ❌ |

---

## 🔐 AUTHENTICATION & SECURITY RULES
1. **User ≠ Customer ≠ Account**: Every entity is strictly isolated.
2. **Segregation of Duties**: No single role can perform both a transaction and an audit override.
3. **Immutable Auditing**: Every action performed by any role is logged to the Audit Service and cannot be changed.
4. **Principle of Least Privilege**: Users are granted only the permissions necessary for their specific role.
