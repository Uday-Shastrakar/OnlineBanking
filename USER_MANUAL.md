# 🏦 Online Banking System - Complete User Manual

## Table of Contents
1. [System Overview](#system-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Getting Started](#getting-started)
4. [Customer Portal Guide](#customer-portal-guide)
5. [Admin Portal Guide](#admin-portal-guide)
6. [API Documentation](#api-documentation)
7. [Troubleshooting](#troubleshooting)

---

## 📋 System Overview

The Online Banking System is a microservices-based application with the following components:

### **Services:**
- **API Gateway** (Port 8080) - Central entry point
- **Authentication Service** (Port 9093) - User management & security
- **Customer Service** (Port 9094) - Customer profiles
- **Accounts Service** (Port 9095) - Bank account management
- **Transaction Service** (Port 9096) - Money transfers
- **Audit Service** (Port 9099) - Compliance & logging
- **Discovery Service** (Port 8761) - Service registry
- **Client Service** (Port 3000) - React frontend

### **Infrastructure:**
- **Kafka** (Port 9092) - Event streaming
- **MySQL** - Multiple databases per service
- **Docker** - Containerized services

---

## 👥 User Roles & Permissions

### **1. CUSTOMER_USER**
**Access:** Customer Portal
**Permissions:** PERMISSION_READ, PERMISSION_WRITE

**Capabilities:**
- ✅ View account balances
- ✅ Transfer money between accounts
- ✅ View transaction history
- ✅ Update personal profile
- ✅ View statements
- ✅ Manage beneficiaries

### **2. ADMIN**
**Access:** Admin Portal
**Permissions:** ADMIN_ALL

**Capabilities:**
- ✅ All CUSTOMER_USER capabilities
- ✅ Manage users (create, update, delete, lock/unlock)
- ✅ View all customer accounts
- ✅ Monitor all transactions
- ✅ Access audit logs
- ✅ System administration
- ✅ Generate reports
- ✅ Manage roles and permissions

### **3. BANK_STAFF**
**Access:** Admin Portal (limited)
**Permissions:** STAFF_READ, STAFF_WRITE

**Capabilities:**
- ✅ View customer information
- ✅ Process account requests
- ✅ Generate basic reports
- ✅ View transaction logs
- ❌ Cannot delete users
- ❌ Cannot manage system settings

### **4. AUDITOR**
**Access:** Admin Portal (audit focus)
**Permissions:** AUDIT_READ, AUDIT_WRITE

**Capabilities:**
- ✅ View all audit logs
- ✅ Generate compliance reports
- ✅ Monitor system activity
- ✅ Export audit data
- ❌ Cannot modify customer data

---

## 🚀 Getting Started

### **1. System Startup**
```powershell
# Start all services
./run_services.ps1

# Start infrastructure (Kafka + MySQL)
docker-compose up -d

# Setup databases (one-time)
./setup-databases.ps1
```

### **2. Access URLs**
- **Customer Portal:** http://localhost:3000
- **Admin Portal:** http://localhost:3000/admin
- **API Gateway:** http://localhost:8080
- **Service Health:** http://localhost:8080/api/health/full

### **3. Default Credentials**
- **Admin User:** admin / admin123
- **Test Customer:** customer / customer123

---

## 👤 Customer Portal Guide

### **1. Registration & Login**

#### **New User Registration:**
1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Fill registration form:
   ```
   Username: john_doe
   Email: john.doe@example.com
   Password: SecurePass123!
   First Name: John
   Last Name: Doe
   Phone: +1234567890
   ```
4. Select account types (Savings, Current, etc.)
5. Click "Register"

#### **Login:**
1. Go to http://localhost:3000/login
2. Enter credentials
3. Click "Sign In"

### **2. Dashboard Overview**

**Customer Dashboard Features:**
- **Account Summary**: Total balance, number of accounts
- **Quick Actions**: Transfer money, view statements
- **Recent Transactions**: Last 10 transactions
- **Profile Information**: Personal details

### **3. Account Management**

#### **View Account Details:**
```
GET /api/account/details/{accountId}
Headers: Authorization: Bearer <JWT_TOKEN>
```

#### **Account Balance Inquiry:**
- Click "Accounts" in sidebar
- View all accounts with balances
- Click account for detailed view

### **4. Money Transfers**

#### **Transfer Money:**
1. Click "Transfer" in sidebar
2. Fill transfer form:
   ```
   From Account: Select from dropdown
   To Account: Enter account number
   Amount: Enter transfer amount
   Description: Optional note
   ```
3. Click "Transfer Money"

#### **Transfer API:**
```bash
curl -X POST "http://localhost:8080/api/transaction/transfer?receiverAmount=1000&receiverAccountNumber=1234567890" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Idempotency-Key: unique-key-123"
```

### **5. Transaction History**

#### **View Transactions:**
1. Click "Transactions" in sidebar
2. Filter by:
   - Date range
   - Transaction type
   - Amount range
   - Status

#### **Transaction API:**
```bash
# Get all transactions for account
curl -X GET "http://localhost:8080/api/transaction/getall?accountNumber=1234567890" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Get transaction by ID
curl -X GET "http://localhost:8080/api/transaction/123" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### **6. Profile Management**

#### **Update Profile:**
1. Click "Profile" in sidebar
2. Edit personal information
3. Click "Update Profile"

#### **Profile API:**
```bash
curl -X PUT "http://localhost:8080/api/customer/update" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Doe"}'
```

---

## 👨‍💼 Admin Portal Guide

### **1. Admin Login**

#### **Access Admin Portal:**
1. Navigate to http://localhost:3000/admin
2. Enter admin credentials
3. Click "Admin Login"

### **2. Admin Dashboard**

#### **Dashboard Overview:**
- **System Statistics**: Total users, accounts, transactions
- **Recent Activity**: Latest registrations and transactions
- **Health Status**: Service health indicators
- **Quick Actions**: Common admin tasks

### **3. User Management**

#### **View All Users:**
```
GET /api/users/all
Headers: Authorization: Bearer <ADMIN_JWT_TOKEN>
```

#### **Create New User:**
1. Click "Users" → "Add User"
2. Fill user form:
   ```
   Username: new_user
   Email: user@example.com
   Password: SecurePass123!
   Roles: [CUSTOMER_USER]
   Permissions: [PERMISSION_READ, PERMISSION_WRITE]
   ```
3. Click "Create User"

#### **User Creation API:**
```bash
curl -X POST "http://localhost:8080/api/users/create" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "new_user",
    "password": "SecurePass123!",
    "email": "user@example.com",
    "firstName": "New",
    "lastName": "User",
    "phoneNumber": "+1234567890",
    "roleNames": ["CUSTOMER_USER"],
    "permissionNames": ["PERMISSION_READ", "PERMISSION_WRITE"]
  }'
```

#### **Update User:**
```bash
curl -X PUT "http://localhost:8080/api/users/123" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Updated", "lastName": "Name"}'
```

#### **Delete User:**
```bash
curl -X DELETE "http://localhost:8080/api/users/123" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

#### **Lock/Unlock User:**
```bash
# Lock user
curl -X POST "http://localhost:8080/api/users/123/lock" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"

# Unlock user
curl -X POST "http://localhost:8080/api/users/123/unlock" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

### **4. Account Management**

#### **View All Accounts:**
1. Click "Accounts" in admin sidebar
2. View all customer accounts with details
3. Filter by account type, status, balance

#### **Account API:**
```bash
# Get all accounts
curl -X GET "http://localhost:8080/api/account/all" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"

# Get account by ID
curl -X GET "http://localhost:8080/api/account/123" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

#### **Create Account for Customer:**
```bash
curl -X POST "http://localhost:8080/api/account/create" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "customerId": 456,
    "accountType": "SAVING",
    "balance": 1000.00,
    "status": "ACTIVE"
  }'
```

### **5. Transaction Monitoring**

#### **View All Transactions:**
1. Click "Transactions" in admin sidebar
2. Filter by:
   - Date range
   - Customer
   - Account
   - Amount
   - Status
   - Transaction type

#### **Transaction API:**
```bash
# Get all transactions
curl -X GET "http://localhost:8080/api/transaction/all" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"

# Get transactions by status
curl -X GET "http://localhost:8080/api/transaction/by-status?status=COMPLETED" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"

# Get transactions by date range
curl -X GET "http://localhost:8080/api/transaction/by-date?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

### **6. Audit & Compliance**

#### **View Audit Logs:**
1. Click "Audit" in admin sidebar
2. Filter by:
   - Date range
   - Event type
   - User
   - Service
   - Action

#### **Audit API:**
```bash
# Get all audit logs
curl -X GET "http://localhost:8080/api/audit/all" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"

# Get audit logs by date
curl -X GET "http://localhost:8080/api/audit/by-date?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```

### **7. System Administration**

#### **Health Check:**
```bash
# Check all services health
curl -X GET "http://localhost:8080/api/health/full"

# Check specific service
curl -X GET "http://localhost:8080/api/health/service?name=authentication"
```

#### **Service Metrics:**
```bash
# Get Prometheus metrics
curl -X GET "http://localhost:9096/actuator/prometheus"

# Get application info
curl -X GET "http://localhost:9096/actuator/info"
```

---

## 🔧 API Documentation

### **Authentication Endpoints**

#### **Login:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

#### **Refresh Token:**
```bash
POST /api/auth/refresh
Content-Type: application/json
Authorization: Bearer <REFRESH_TOKEN>
```

### **Customer Endpoints**

#### **Create Customer:**
```bash
POST /api/customer/create-customer
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890",
  "gender": "Male",
  "address": "123 Main St",
  "dateOfBirth": "1990-01-15",
  "status": "Active"
}
```

#### **Get Customer:**
```bash
GET /api/customer/{userId}
Authorization: Bearer <JWT_TOKEN>
```

### **Account Endpoints**

#### **Create Account:**
```bash
POST /api/account/create
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "userId": 123,
  "customerId": 456,
  "accountType": "SAVING",
  "balance": 1000.00,
  "status": "ACTIVE"
}
```

#### **Get Account Details:**
```bash
GET /api/account/details/{accountId}
Authorization: Bearer <JWT_TOKEN>
```

### **Transaction Endpoints**

#### **Fund Transfer:**
```bash
POST /api/transaction/transfer?receiverAmount=1000&receiverAccountNumber=1234567890
Authorization: Bearer <JWT_TOKEN>
Idempotency-Key: unique-key-123
```

#### **Get Transactions:**
```bash
GET /api/transaction/getall?accountNumber=1234567890
Authorization: Bearer <JWT_TOKEN>
```

---

## 🛠️ Troubleshooting

### **Common Issues**

#### **1. Service Not Available**
```bash
# Check service status
curl -X GET "http://localhost:8080/api/health/full"

# Expected Response:
{
  "service": {"status": "UP", "port": 8080},
  "database": {"status": "UP"},
  "kafka": {"status": "UP"}
}
```

#### **2. Authentication Failed**
```bash
# Check JWT token
curl -X POST "http://localhost:8080/api/auth/validate" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### **3. Database Connection Issues**
```bash
# Check database health
curl -X GET "http://localhost:9093/api/health/database"

# Expected Response:
{
  "status": "UP",
  "database": "authdb",
  "connection": "VALID"
}
```

#### **4. Kafka Issues**
```bash
# Check Kafka health
curl -X GET "http://localhost:9093/api/health/kafka"

# Expected Response:
{
  "status": "UP",
  "bootstrap-servers": "localhost:9092"
}
```

### **Error Codes**

| Code | Description | Solution |
|------|-------------|---------|
| 400 | Bad Request | Check request body and parameters |
| 401 | Unauthorized | Check JWT token validity |
| 403 | Forbidden | Check user permissions |
| 404 | Not Found | Verify endpoint and resource ID |
| 500 | Internal Error | Check service logs |

### **Log Locations**

- **Authentication Service**: `logs/authentication.log`
- **Customer Service**: `logs/customer.log`
- **Account Service**: `logs/accounts.log`
- **Transaction Service**: `logs/transaction.log`
- **Audit Service**: `logs/audit.log`

---

## 📞 Support

### **Contact Information**
- **Technical Support**: tech-support@bank.com
- **Customer Support**: support@bank.com
- **Security Team**: security@bank.com

### **Documentation Updates**
- **API Documentation**: Always up-to-date
- **User Manual**: Updated regularly
- **System Status**: Available at /api/health

---

## 📚 Additional Resources

### **API Documentation**
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI Spec: http://localhost:8080/v3/api-docs

### **Development Resources**
- Git Repository: [Link to repo]
- API Gateway Configuration
- Database Schemas

### **Training Materials**
- Customer Portal Training Videos
- Admin Portal Training Videos
- API Usage Examples

---

**Last Updated:** January 28, 2026  
**Version:** 1.0  
**System Status:** Production Ready 🚀
