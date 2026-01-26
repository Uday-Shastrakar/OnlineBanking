package com.bank.authentication.service;

import com.bank.authentication.model.UserCustomerMapping;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserCustomerMappingService {
    
    UserCustomerMapping createMapping(Long userId, Long customerId, UserCustomerMapping.RelationshipType relationshipType);
    
    Optional<UserCustomerMapping> getActiveMapping(Long userId, Long customerId);
    
    List<UserCustomerMapping> getActiveMappingsByUserId(Long userId);
    
    List<UserCustomerMapping> getActiveMappingsByCustomerId(Long customerId);
    
    UserCustomerMapping deactivateMapping(Long mappingId);
    
    UserCustomerMapping updateMapping(Long mappingId, UserCustomerMapping.RelationshipType relationshipType);
    
    boolean hasAccessToCustomer(Long userId, Long customerId);
    
    boolean isPrimaryUser(Long userId, Long customerId);
}
