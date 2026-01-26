# 🏦 Banking System API Services

## 📋 Available API Services

This directory contains all the API service files for the banking system frontend. Each service corresponds to a backend microservice and provides TypeScript interfaces and methods for API communication.

## 🗂️ Service Files

### 1. **accountService.ts**
Handles all account-related operations:
- Create accounts
- Get account details
- Update account information
- Account debits/credits
- Get user/customer accounts

### 2. **transactionService.ts**
Manages financial transactions:
- Fund transfers
- Transaction history
- Session management
- Account validation

### 3. **auditService.ts**
Provides audit and compliance features:
- Get audit logs
- System metrics
- User activity tracking
- Compliance reporting

### 4. **userService.ts**
Handles user management:
- User CRUD operations
- User authentication
- Role management
- Profile management

### 5. **userCustomerMappingService.ts**
Manages user-customer relationships:
- Create mappings
- Verify access
- Get mapping information
- Banking-grade separation

### 6. **customerService.ts**
Customer profile management:
- Customer CRUD operations
- KYC management
- Document uploads
- Customer search

## 🚀 Quick Start

### Import All Services
```typescript
import {
  accountService,
  transactionService,
  auditService,
  userService,
  userCustomerMappingService
} from '../services/api';
```

### Import Individual Service
```typescript
import { accountService } from '../services/api/accountService';
```

### Import Types
```typescript
import type {
  AccountQueryDto,
  Transaction,
  UserDetailDto,
  CreateCustomerDTO
} from '../services/api';
```

## 🔐 Authentication

All API calls automatically include the JWT token from localStorage:
```typescript
// Token is automatically added to headers
const accounts = await accountService.getAllAccounts(userId);
```

## 🏗️ Banking-Grade Architecture

### User-Customer Separation
```typescript
// Get customer data using user-customer mapping
const mapping = await userCustomerMappingService.getMappingByUserId(userId);
const customer = await customerService.getCustomerById(mapping.customerId);
const accounts = await accountService.getAccountsByCustomerId(mapping.customerId);
```

### Role-Based Access
```typescript
// Services automatically handle role-based access
const users = await userService.getAllUsers(); // Requires ADMIN role
const auditLogs = await auditService.getAllLogs(); // Requires AUDITOR role
```

## 📝 Usage Examples

### Dashboard Data Fetching
```typescript
const fetchDashboardData = async () => {
  try {
    // Get current user
    const user = await userService.getUserProfile();
    
    // Get customer mapping
    const mapping = await userCustomerMappingService.getMappingByUserId(user.userId);
    
    // Get customer data
    const customer = await customerService.getCustomerById(mapping.customerId);
    
    // Get accounts
    const accounts = await accountService.getAccountsByCustomerId(mapping.customerId);
    
    return { user, customer, accounts };
  } catch (error) {
    console.error('Dashboard fetch error:', error);
  }
};
```

### Fund Transfer
```typescript
const transferFunds = async (fromAccount: string, toAccount: number, amount: number) => {
  try {
    // Verify account details
    const details = await accountService.getAccountDetails(userId, toAccount);
    
    // Perform transfer
    const result = await transactionService.fundTransfer({
      receiverAmount: amount,
      receiverAccountNumber: toAccount,
      idempotencyKey: `transfer-${Date.now()}`
    });
    
    return result;
  } catch (error) {
    console.error('Transfer failed:', error);
    throw error;
  }
};
```

### Customer Management
```typescript
const createNewCustomer = async (customerData: CreateCustomerDTO) => {
  try {
    // Create customer
    const customer = await customerService.createCustomer(customerData);
    
    // Create user-customer mapping
    await userCustomerMappingService.createMapping({
      userId: customerData.userId,
      customerId: customer.customerId
    });
    
    // Create initial account
    await accountService.createAccount({
      accountType: customerData.accountType || 'SAVINGS',
      balance: 0,
      status: 'ACTIVE',
      customerId: customer.customerId
    });
    
    return customer;
  } catch (error) {
    console.error('Customer creation failed:', error);
    throw error;
  }
};
```

## 🔍 Error Handling

All services use consistent error handling:
```typescript
try {
  const result = await someService.someMethod(params);
  return result;
} catch (error) {
  // Error is already logged by the API service
  // Handle UI-specific error display
  showErrorToast('Operation failed. Please try again.');
}
```

## 📊 Data Flow

```
Frontend Component
    ↓
API Service (TypeScript)
    ↓
HTTP Request with JWT
    ↓
API Gateway (Port 8080)
    ↓
Backend Microservice
    ↓
Database Response
    ↓
Frontend Component
```

## 🛠️ Development Tips

### 1. Use TypeScript Types
Always import and use the provided TypeScript interfaces:
```typescript
import type { AccountQueryDto } from '../services/api';
const account: AccountQueryDto = await accountService.getAccountDetails(userId, accountId);
```

### 2. Handle Loading States
```typescript
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);

const fetchData = async () => {
  setLoading(true);
  try {
    const result = await someService.getData();
    setData(result);
  } finally {
    setLoading(false);
  }
};
```

### 3. Use Idempotency Keys
For financial operations:
```typescript
const transfer = await transactionService.fundTransfer({
  receiverAmount: amount,
  receiverAccountNumber: accountNumber,
  idempotencyKey: `transfer-${Date.now()}-${Math.random()}`
});
```

### 4. Verify User Permissions
```typescript
const canAccessAdminPanel = () => {
  const roles = JSON.parse(localStorage.getItem('roles') || '[]');
  return roles.includes('ADMIN') || roles.includes('AUDITOR');
};
```

## 📚 Related Documentation

- [API Documentation](./api/API_DOCUMENTATION.md) - Complete API reference
- [TypeScript Types](./api/index.ts) - All available types
- [Authentication Guide](../auth/authService.ts) - Authentication implementation
- [Error Handling](./errorHandling.md) - Error handling patterns

## 🚀 Next Steps

1. **Explore Services**: Browse each service file to understand available methods
2. **Check Types**: Review TypeScript interfaces for data structures
3. **Implement Features**: Use services in your components
4. **Handle Errors**: Implement proper error handling
5. **Add Loading States**: Improve user experience with loading indicators

## 🎯 Best Practices

✅ Always use TypeScript interfaces  
✅ Handle errors gracefully  
✅ Show loading states  
✅ Use idempotency keys for financial operations  
✅ Verify user permissions before sensitive operations  
✅ Log errors for debugging  
✅ Use consistent error messages  
✅ Implement retry logic for network failures  

---

## 📞 Support

For API-related issues:
1. Check the [API Documentation](./api/API_DOCUMENTATION.md)
2. Review the specific service file
3. Check browser console for error details
4. Verify JWT token is valid
5. Ensure backend services are running
