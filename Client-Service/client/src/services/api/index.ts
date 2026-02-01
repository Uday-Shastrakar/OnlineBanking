// Export all API services for easy import
export { accountService } from './accountService';
export { transactionService } from './transactionService';
export { auditService } from './auditService';
export { userService } from './userService';
export { userCustomerMappingService } from './userCustomerMappingService';

// Export customer service
export { customerService } from '../customerService';

// Re-export types
export type {
  AccountCommandDto,
  AccountQueryDto,
  AccountManagerDTO,
  CombineAccountDetailsDTO,
  UpdateAccountDetails
} from './accountService';

export type {
  TransactionRequest,
  TransactionResponse,
  UserSession,
  TransferRequest
} from './transactionService';

export type {
  Transaction,
  TransactionStatus
} from '../../types/banking';

export type {
  AuditEvent,
  SystemMetrics
} from './auditService';

export type {
  UserDetailDto,
  RoleDto,
  PermissionDto,
  UserCreationRequestDto,
  CustomerCredentialRequestDTO,
  AccountManagerRequestDTO
} from './userService';

export type {
  UserCustomerMapping,
  CreateMappingRequest,
  MappingResponse
} from './userCustomerMappingService';

export type {
  CreateCustomerDto,
  GetCustomer,
  CustomerRegisterForm
} from '../../Types';
