package com.bank.customer.service;

import com.bank.customer.model.UserCustomerMapping;
import com.bank.customer.repository.UserCustomerMappingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * User-Customer Mapping Service - STRICT SECURITY MODEL
 * Manages the relationship between authentication users and business customers
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserCustomerMappingService {
    
    private final UserCustomerMappingRepository mappingRepository;
    
    /**
     * Create mapping between user and customer
     */
    public UserCustomerMapping createMapping(Long userId, Long customerId) {
        log.info("Creating user-customer mapping - UserId: {}, CustomerId: {}", userId, customerId);
        
        UserCustomerMapping mapping = UserCustomerMapping.builder()
                .userId(userId)
                .customerId(customerId)
                .status("ACTIVE")
                .createdAt(java.time.Instant.now())
                .updatedAt(java.time.Instant.now())
                .build();
        
        return mappingRepository.save(mapping);
    }
    
    /**
     * Get mapping by user ID
     */
    public Optional<UserCustomerMapping> findByUserId(Long userId) {
        return mappingRepository.findByUserId(userId);
    }
    
    /**
     * Get mapping by customer ID
     */
    public Optional<UserCustomerMapping> findByCustomerId(Long customerId) {
        return mappingRepository.findByCustomerId(customerId);
    }
    
    /**
     * Check if mapping exists by user ID and customer ID
     */
    public boolean existsByUserIdAndCustomerId(Long userId, Long customerId) {
        return mappingRepository.existsByUserIdAndCustomerId(userId, customerId);
    }
    
    /**
     * Get all mappings for a user
     */
    public List<UserCustomerMapping> findAllByUserId(Long userId) {
        return mappingRepository.findAllByUserId(userId);
    }
    
    /**
     * Get all mappings for a customer
     */
    public List<UserCustomerMapping> findAllByCustomerId(Long customerId) {
        return mappingRepository.findAllByCustomerId(customerId);
    }
    
    /**
     * Update mapping status
     */
    public UserCustomerMapping updateStatus(Long mappingId, String status) {
        UserCustomerMapping mapping = mappingRepository.findById(mappingId)
                .orElseThrow(() -> new RuntimeException("Mapping not found: " + mappingId));
        
        mapping.setStatus(status);
        mapping.setUpdatedAt(java.time.Instant.now());
        
        return mappingRepository.save(mapping);
    }
    
    /**
     * Delete mapping
     */
    public void deleteMapping(Long mappingId) {
        UserCustomerMapping mapping = mappingRepository.findById(mappingId)
                .orElseThrow(() -> new RuntimeException("Mapping not found: " + mappingId));
        
        mappingRepository.delete(mapping);
        log.info("Deleted user-customer mapping: {}", mappingId);
    }
    
    /**
     * Delete mapping by user and customer
     */
    public void deleteMappingByUserIdAndCustomerId(Long userId, Long customerId) {
        Optional<UserCustomerMapping> mapping = mappingRepository.findByUserIdAndCustomerId(userId, customerId);
        
        mapping.ifPresent(m -> {
            mappingRepository.delete(m);
            log.info("Deleted user-customer mapping - UserId: {}, CustomerId: {}", userId, customerId);
        });
    }
}
