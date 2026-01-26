# API Upgrade Guide - Gateway Security & New Features

## Overview

This document outlines the changes made to the frontend API layer to support the new backend security model with gateway headers, Redis idempotency, and enhanced audit compliance.

## Key Changes

### 1. Gateway Security Headers

All API requests now include gateway security headers automatically:

- **X-User-Id**: User identifier from localStorage
- **X-Permissions**: User permissions/roles
- **X-Request-ID**: Unique request tracking ID
- **Authorization**: JWT Bearer token

### 2. Enhanced Transaction API

#### New Transfer Endpoint
```typescript
// New API with proper gateway headers
const response = await transactionService.initiateTransfer({
  sourceAccountId: 123,
  destinationAccountId: 456,
  amount: 1000,
  currency: 'USD',
  description: 'Fund Transfer'
});
```

#### Legacy Support
```typescript
// Legacy endpoint still supported
const response = await transactionService.fundTransfer({
  receiverAmount: 1000,
  receiverAccountNumber: 456789,
  idempotencyKey: 'unique-key'
});
```

### 3. Enhanced Audit API

#### Paginated Audit Logs
```typescript
const auditData = await auditService.getAllAuditEvents({
  page: 0,
  size: 50,
  userId: 'user123',
  domain: 'TRANSACTION'
});
```

#### System Metrics
```typescript
const metrics = await auditService.getSystemMetrics();
// Returns: totalEvents, todayEvents, topDomains, recentActivity
```

## Updated Components

### TransferForm Component
- ✅ Uses new `transactionService.initiateTransfer()` API
- ✅ Proper error handling for 403 (permission denied)
- ✅ Enhanced transaction response with transaction ID
- ✅ Automatic idempotency key rotation

### AuditCenter Component
- ✅ Uses new `auditService.getAllAuditEvents()` API
- ✅ Paginated audit log viewing
- ✅ Filter by user ID and domain
- ✅ System metrics dashboard
- ✅ Proper 403 error handling for unauthorized access

## Migration Guide

### For Existing Code

1. **Update Imports**:
```typescript
// Before
import api from '../services/api';
import { transactionService } from '../services/api';

// After
import { transactionService } from '../services/api';
```

2. **Update Transaction Calls**:
```typescript
// Before
const response = await api.post('/transaction/transfer', null, {
  params: { receiverAmount, receiverAccountNumber },
  idempotencyKey
});

// After
const response = await transactionService.initiateTransfer({
  sourceAccountId: senderId,
  destinationAccountId: receiverId,
  amount,
  currency: 'USD',
  description
});
```

3. **Update Audit Calls**:
```typescript
// Before
const logs = await api.get('/audit/all');

// After
const logs = await auditService.getAllAuditEvents({
  page: 0,
  size: 50
});
```

## Security Benefits

### 1. Gateway Security
- **Request Tracking**: Every request has a unique ID
- **User Context**: Proper user identification
- **Permission Validation**: Role-based access control
- **Audit Trail**: Complete request tracking

### 2. Redis Idempotency
- **Performance**: Fast duplicate request detection
- **Reliability**: 24-hour key expiration
- **Consistency**: Prevents duplicate financial operations

### 3. Enhanced Audit
- **Immutability**: Audit records cannot be modified
- **Pagination**: Efficient large dataset handling
- **Filtering**: Search by user, domain, date range
- **Compliance**: Banking-grade audit trail

## Error Handling

### New Error Codes
- **403 Forbidden**: Insufficient permissions
- **410 Gone**: Deprecated endpoint (session endpoint)
- **409 Conflict**: Duplicate transaction

### Enhanced Error Messages
```typescript
if (err.response?.status === 403) {
  setError("You don't have permission to perform this action.");
} else if (err.response?.status === 410) {
  setError("This feature is no longer available.");
}
```

## Testing

### Transaction API
```typescript
// Test successful transfer
const transfer = await transactionService.initiateTransfer({
  sourceAccountId: 1,
  destinationAccountId: 2,
  amount: 100,
  currency: 'USD'
});
console.log('Transaction ID:', transfer.transactionId);

// Test duplicate prevention
const duplicate = await transactionService.initiateTransfer({
  sourceAccountId: 1,
  destinationAccountId: 2,
  amount: 100,
  currency: 'USD'
});
// Should return cached result or error
```

### Audit API
```typescript
// Test audit logs
const auditLogs = await auditService.getAllAuditEvents({
  page: 0,
  size: 10
});
console.log('Total events:', auditLogs.totalElements);

// Test metrics
const metrics = await auditService.getSystemMetrics();
console.log('Today\'s events:', metrics.todayEvents);
```

## Backward Compatibility

All existing code continues to work with legacy endpoints. The new APIs are additive and provide enhanced features while maintaining compatibility.

## Next Steps

1. **Update Components**: Gradually migrate to new APIs
2. **Test Integration**: Verify gateway headers are working
3. **Monitor Performance**: Check Redis idempotency efficiency
4. **Audit Compliance**: Ensure proper audit trail coverage

## Support

For any issues with the API upgrade, please refer to:
- API Documentation: `API_DOCUMENTATION.md`
- Error Handler: `errorHandler.ts`
- Type Definitions: Individual service files
