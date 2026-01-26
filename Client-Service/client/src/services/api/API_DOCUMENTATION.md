# 🏦 Banking System API Documentation

## 📋 Overview

This document provides comprehensive API documentation for all backend services in the banking system. All APIs follow RESTful principles and use JWT authentication.

## 🔐 Authentication

All API calls (except login/register) require JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

## 🏠 Base URLs

- **API Gateway**: `http://localhost:8080/api`
- **Authentication Service**: `http://localhost:9093/api`
- **Customer Service**: `http://localhost:9094/api`
- **Accounts Service**: `http://localhost:9095/api`
- **Transaction Service**: `http://localhost:9096/api`
- **Audit Service**: `http://localhost:9099/api`

---

## 🔑 Authentication Service APIs

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john.doe",
  "password": "password123"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password?email=user@example.com
```

#### Verify OTP
```http
POST /api/auth/verify-otp?otp=123456
```

#### Reset Password
```http
POST /api/auth/reset-password?otp=123456&newPassword=newPass123
```

### User Management Endpoints

#### Create User
```http
POST /api/users/create
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "roleNames": ["CUSTOMER_USER"],
  "permissionNames": ["PERMISSION_READ"]
}
```

#### Create Customer User (Banking-Grade)
```http
POST /api/users/customer
Content-Type: application/json

{
  "username": "customeruser",
  "password": "password123",
  "roleNames": ["CUSTOMER_USER"],
  "createCustomerDto": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "address": "123 Main St",
    "dateOfBirth": "1990-01-01",
    "accountType": "SAVINGS"
  }
}
```

#### Get All Users
```http
GET /api/users/get
Authorization: Bearer <token>
```

---

## 👥 Customer Service APIs

### Customer Management

#### Create Customer
```http
POST /api/customer/create-customer
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "gender": "MALE",
  "address": "123 Main St, City, State",
  "dateOfBirth": "1990-01-01",
  "kycStatus": "PENDING",
  "status": "ACTIVE",
  "accountType": "SAVINGS"
}
```

#### Get Customer by ID
```http
GET /api/customer/single/{customerId}
Authorization: Bearer <token>
```

#### Get Customer by User ID (Legacy)
```http
GET /api/customer/{userId}
Authorization: Bearer <token>
```

#### Get All Customers
```http
GET /api/customer/getall
Authorization: Bearer <token>
```

#### Update Customer
```http
PUT /api/customer/{customerId}/update
Content-Type: application/json

{
  "fullName": "John Updated Doe",
  "email": "john.updated@example.com",
  "phoneNumber": "+1234567890",
  "kycStatus": "VERIFIED"
}
```

#### Delete Customer
```http
DELETE /api/customer/{customerId}/delete
Authorization: Bearer <token>
```

#### Upload Document
```http
POST /api/customer/{customerId}/upload
Content-Type: multipart/form-data

file: [document.pdf]
```

---

## 💳 Accounts Service APIs

### Account Management

#### Create Account
```http
POST /api/account/create-account
Content-Type: application/json

{
  "accountType": "SAVINGS",
  "balance": 1000.00,
  "status": "ACTIVE",
  "customerId": 12345
}
```

#### Get Account Details
```http
GET /api/account/get-details?userId=12345&receiverAccountNumber=987654
Authorization: Bearer <token>
```

#### Update Account
```http
PUT /api/account/update-details
Content-Type: application/json

{
  "accountId": "ACC123",
  "status": "ACTIVE",
  "accountType": "SAVINGS"
}
```

#### Get All Accounts
```http
GET /api/account/getall?userId=12345
Authorization: Bearer <token>
```

#### Debit Account
```http
POST /api/account/debit?accountId=ACC123&amount=100.00
Authorization: Bearer <token>
```

#### Credit Account
```http
POST /api/account/credit?accountId=ACC123&amount=100.00
Authorization: Bearer <token>
```

---

## 💸 Transaction Service APIs

### Transaction Management

#### Fund Transfer
```http
POST /api/transaction/transfer
Content-Type: application/json

{
  "receiverAmount": 500.00,
  "receiverAccountNumber": 987654
}
Headers:
Idempotency-Key: unique-key-123
```

#### Get Transaction History
```http
GET /api/transaction/getall?accountNumber=987654
Authorization: Bearer <token>
```

#### Get Session Info
```http
GET /api/transaction/session
Authorization: Bearer <token>
```

---

## 📊 Audit Service APIs

### Audit & Compliance

#### Get All Audit Logs
```http
GET /api/audit/all
Authorization: Bearer <token>
```

#### Get System Metrics
```http
GET /api/audit/metrics
Authorization: Bearer <token>
```

---

## 🔗 User-Customer Mapping APIs

### Mapping Management

#### Create Mapping
```http
POST /api/user-customer-mapping/create
Content-Type: application/json

{
  "userId": 12345,
  "customerId": 67890
}
```

#### Get Mapping by User ID
```http
GET /api/user-customer-mapping/user/{userId}
Authorization: Bearer <token>
```

#### Get Mapping by Customer ID
```http
GET /api/user-customer-mapping/customer/{customerId}
Authorization: Bearer <token>
```

#### Verify Access
```http
GET /api/user-customer-mapping/verify/{userId}/{customerId}
Authorization: Bearer <token>
```

---

## 🎯 Banking-Grade Role System

### Available Roles
- **CUSTOMER_USER**: Customer portal access
- **BANK_STAFF**: Banking operations
- **ADMIN**: System administration
- **AUDITOR**: Audit and compliance

### Role-Based Access Control
All protected routes require appropriate roles:
```typescript
// Example: Customer-only route
allowedRoles: ['CUSTOMER_USER']

// Example: Admin-only route
allowedRoles: ['ADMIN']

// Example: Multiple roles
allowedRoles: ['ADMIN', 'AUDITOR']
```

---

## 📝 Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "message": "Error description"
}
```

### Pagination (where applicable)
```json
{
  "success": true,
  "data": {
    "content": [ ... ],
    "totalElements": 100,
    "totalPages": 10,
    "size": 10,
    "number": 0
  },
  "message": "Data retrieved successfully"
}
```

---

## 🔒 Security Headers

All API responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

---

## 📞 Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |

---

## 🚀 Usage Examples

### TypeScript/React Example
```typescript
import { customerService, accountService } from '../services/api';

// Fetch customer data
const customer = await customerService.getCustomerById(12345);

// Create new account
const newAccount = await accountService.createAccount({
  accountType: 'SAVINGS',
  balance: 1000,
  status: 'ACTIVE',
  customerId: customer.customerId
});
```

### JavaScript Example
```javascript
// Using fetch API
const response = await fetch('/api/customer/getall', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const customers = await response.json();
```

---

## 📚 Additional Resources

- [API Gateway Documentation](./API_GATEWAY.md)
- [Authentication Guide](./AUTH_GUIDE.md)
- [Error Handling Guide](./ERROR_HANDLING.md)
- [Rate Limiting Info](./RATE_LIMITING.md)
