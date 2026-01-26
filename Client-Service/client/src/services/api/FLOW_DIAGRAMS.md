# 🔄 Complete API Gateway Flow Diagrams

## 🏗️ Overall System Architecture

```mermaid
graph TB
    Client[Frontend React App]
    Gateway[API Gateway :8080]
    
    subgraph "Authentication Layer"
        AuthFilter[Authentication Filter]
        TokenValidator[JWT Validator]
        RoleChecker[Role Checker]
    end
    
    subgraph "Backend Services"
        Auth[Auth Service :9093]
        Customer[Customer Service :9094]
        Account[Account Service :9095]
        Transaction[Transaction Service :9096]
        Audit[Audit Service :9099]
    end
    
    Client -->|HTTP + JWT| Gateway
    Gateway --> AuthFilter
    AuthFilter --> TokenValidator
    TokenValidator --> RoleChecker
    RoleChecker -->|Route Request| Auth
    RoleChecker -->|Route Request| Customer
    RoleChecker -->|Route Request| Account
    RoleChecker -->|Route Request| Transaction
    RoleChecker -->|Route Request| Audit
```

---

## 🔐 Authentication Flow Detail

### **Login Flow (No Authentication Required)**
```mermaid
sequenceDiagram
    participant Client as Frontend
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant DB as Database

    Client->>Gateway: POST /api/auth/login
    Note over Gateway: No auth required for login
    Gateway->>Auth: Forward login request
    Auth->>DB: Validate credentials
    DB-->>Auth: User data
    Auth->>Auth: Generate JWT
    Auth-->>Gateway: JWT + User Info
    Gateway-->>Client: Login Success + JWT
```

### **Protected API Flow**
```mermaid
sequenceDiagram
    participant Client as Frontend
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant Service as Backend Service

    Client->>Gateway: Request + Authorization: Bearer JWT
    Gateway->>Gateway: Extract JWT from header
    Gateway->>Auth: Validate JWT
    Auth-->>Gateway: Token Valid + User Context
    Gateway->>Gateway: Check Role Authorization
    Gateway->>Service: Forward Request + User Headers
    Service-->>Gateway: Response
    Gateway-->>Client: Response
```

---

## 🛡️ Authorization Flow by Role

### **Customer User Flow**
```mermaid
graph LR
    Client[CUSTOMER_USER] --> Gateway[API Gateway]
    Gateway -->|✅ Auth| AuthFilter
    AuthFilter -->|✅ Role| RoleChecker
    RoleChecker --> Customer[Customer Service]
    RoleChecker --> Account[Account Service]
    RoleChecker --> Transaction[Transaction Service]
    RoleChecker -->|❌ Admin| Audit[Audit Service]
    RoleChecker -->|❌ Admin| Users[User Management]
```

### **Admin Flow**
```mermaid
graph LR
    Client[ADMIN] --> Gateway[API Gateway]
    Gateway -->|✅ Auth| AuthFilter
    AuthFilter -->|✅ Role| RoleChecker
    RoleChecker --> Customer[Customer Service]
    RoleChecker --> Account[Account Service]
    RoleChecker --> Transaction[Transaction Service]
    RoleChecker -->|✅ Role| Audit[Audit Service]
    RoleChecker -->|✅ Role| Users[User Management]
```

### **Auditor Flow**
```mermaid
graph LR
    Client[AUDITOR] --> Gateway[API Gateway]
    Gateway -->|✅ Auth| AuthFilter
    AuthFilter -->|✅ Role| RoleChecker
    RoleChecker -->|❌ Customer| Customer Service
    RoleChecker -->|❌ Customer| Account Service
    RoleChecker -->|❌ Customer| Transaction Service
    RoleChecker -->|✅ Role| Audit[Audit Service]
    RoleChecker -->|❌ Admin| Users[User Management]
```

---

## 📋 Detailed API Flow Examples

### **1. Customer Registration Complete Flow**

```mermaid
sequenceDiagram
    participant Client as Frontend
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant Customer as Customer Service
    participant Account as Account Service
    participant Audit as Audit Service

    Note over Client, Audit: Step 1: User Login
    Client->>Gateway: POST /api/auth/login
    Gateway->>Auth: Validate credentials
    Auth-->>Gateway: JWT + User Info
    Gateway-->>Client: Login Success

    Note over Client, Audit: Step 2: Create Customer
    Client->>Gateway: POST /api/customer/create-customer
    Gateway->>Gateway: Validate JWT + Role Check
    Gateway->>Customer: Create customer
    Customer->>Audit: Log CUSTOMER_CREATED
    Customer-->>Gateway: Customer Created
    Gateway-->>Client: Success

    Note over Client, Audit: Step 3: Create Account
    Client->>Gateway: POST /api/account/create-account
    Gateway->>Gateway: Validate JWT + Role Check
    Gateway->>Account: Create account
    Account->>Audit: Log ACCOUNT_CREATED
    Account-->>Gateway: Account Created
    Gateway-->>Client: Success
```

### **2. Fund Transfer Security Flow**

```mermaid
sequenceDiagram
    participant Client as Frontend
    participant Gateway as API Gateway
    participant Transaction as Transaction Service
    participant Account as Account Service
    participant Audit as Audit Service

    Client->>Gateway: POST /api/transaction/transfer
    Note over Gateway: Headers: Authorization, Idempotency-Key
    
    Gateway->>Gateway: 1. Validate JWT
    Gateway->>Gateway: 2. Check Role (CUSTOMER_USER)
    Gateway->>Gateway: 3. Check Idempotency
    
    Gateway->>Transaction: Process transfer
    Note over Transaction: Headers: X-User-Id, X-Username, X-Roles
    
    Transaction->>Account: Validate source account
    Account-->>Transaction: Account valid
    
    Transaction->>Account: Debit source account
    Account-->>Transaction: Debit success
    
    Transaction->>Account: Credit destination account
    Account-->>Transaction: Credit success
    
    Transaction->>Audit: Log TRANSACTION_COMPLETED
    Audit-->>Transaction: Logged
    
    Transaction-->>Gateway: Transfer complete
    Gateway-->>Client: Success
```

### **3. Admin User Management Flow**

```mermaid
sequenceDiagram
    participant Client as Admin Frontend
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant Audit as Audit Service

    Client->>Gateway: GET /api/users/get
    Gateway->>Gateway: Validate JWT
    Gateway->>Gateway: Check Role (ADMIN required)
    
    Gateway->>Auth: Get all users
    Auth->>Audit: Log USERS_ACCESSED
    Auth-->>Gateway: Users list
    Gateway-->>Client: Users data
```

---

## 🔒 Security Filter Implementation

### **Gateway Filter Chain**
```mermaid
graph TD
    Request[Incoming Request]
    
    Request --> PublicCheck{Public Endpoint?}
    PublicCheck -->|Yes| Service[Route to Service]
    PublicCheck -->|No| AuthCheck{Has JWT?}
    
    AuthCheck -->|No| Unauthorized[401 Unauthorized]
    AuthCheck -->|Yes| ValidateJWT{JWT Valid?}
    
    ValidateJWT -->|No| Unauthorized[401 Unauthorized]
    ValidateJWT -->|Yes| ExtractUser{Extract User Context}
    
    ExtractUser --> RoleCheck{Has Required Role?}
    RoleCheck -->|No| Forbidden[403 Forbidden]
    RoleCheck -->|Yes| AddContext{Add User Headers}
    
    AddContext --> Service[Route to Service]
    
    Unauthorized --> Response[Error Response]
    Forbidden --> Response[Error Response]
```

### **User Context Headers**
```http
# Headers added by Gateway after successful authentication
X-User-Id: 12345
X-Username: john.doe
X-Roles: CUSTOMER_USER,USER
X-Permissions: PERMISSION_READ,PERMISSION_WRITE
X-Customer-Id: 67890
X-Request-Id: req-123456
X-Timestamp: 2024-01-26T12:00:00Z
```

---

## 📊 Role-Based Access Matrix

| Endpoint | CUSTOMER_USER | BANK_STAFF | ADMIN | AUDITOR |
|----------|---------------|------------|-------|---------|
| `/api/auth/**` | ✅ | ✅ | ✅ | ✅ |
| `/api/customer/**` | ✅ | ✅ | ✅ | ❌ |
| `/api/account/**` | ✅ | ✅ | ✅ | ❌ |
| `/api/transaction/**` | ✅ | ✅ | ✅ | ❌ |
| `/api/audit/**` | ❌ | ❌ | ✅ | ✅ |
| `/api/users/**` | ❌ | ❌ | ✅ | ❌ |

---

## 🚨 Error Flow Examples

### **Authentication Error**
```mermaid
sequenceDiagram
    participant Client as Frontend
    participant Gateway as API Gateway

    Client->>Gateway: Request without JWT
    Gateway->>Gateway: Missing Authorization header
    Gateway-->>Client: 401 Unauthorized
    Note over Client: {"error": "Authentication required"}
```

### **Authorization Error**
```mermaid
sequenceDiagram
    participant Client as Frontend
    participant Gateway as API Gateway

    Client->>Gateway: Request with JWT (CUSTOMER_USER role)
    Gateway->>Gateway: User tries to access /api/audit/all
    Gateway->>Gateway: Role check fails (requires ADMIN/AUDITOR)
    Gateway-->>Client: 403 Forbidden
    Note over Client: {"error": "Insufficient permissions"}
```

### **Token Expired Error**
```mermaid
sequenceDiagram
    participant Client as Frontend
    participant Gateway as API Gateway
    participant Auth as Auth Service

    Client->>Gateway: Request with expired JWT
    Gateway->>Auth: Validate JWT
    Auth-->>Gateway: Token expired
    Gateway-->>Client: 401 Unauthorized
    Note over Client: {"error": "Token expired"}
```

---

## 🎯 Security Features Summary

### **Authentication Features**
✅ **JWT Validation**: Token signature and expiry  
✅ **Token Refresh**: Automatic token renewal  
✅ **Multi-factor Support**: Ready for 2FA integration  
✅ **Session Management**: Secure session handling  

### **Authorization Features**
✅ **Role-Based Access**: Banking-grade RBAC  
✅ **Resource Ownership**: Users access own data only  
✅ **Permission-Based**: Fine-grained permissions  
✅ **Dynamic Authorization**: Runtime permission checks  

### **Security Headers**
✅ **OWASP Compliance**: Security headers applied  
✅ **CORS Configuration**: Cross-origin security  
✅ **Rate Limiting**: DDoS protection  
✅ **Audit Logging**: Complete audit trail  

### **Monitoring & Logging**
✅ **Request Tracing**: End-to-end request tracking  
✅ **Security Events**: Real-time security monitoring  
✅ **Performance Metrics**: API performance tracking  
✅ **Error Tracking**: Comprehensive error logging  

---

## 🏆 Implementation Status

**✅ Authentication**: **COMPLETE**  
**✅ Authorization**: **COMPLETE**  
**✅ Role-Based Access**: **COMPLETE**  
**✅ Security Headers**: **COMPLETE**  
**✅ Audit Logging**: **COMPLETE**  
**✅ Error Handling**: **COMPLETE**  
**✅ Monitoring**: **COMPLETE**  

**🎉 RESULT**: **PRODUCTION-READY BANKING-GRADE SECURITY**
