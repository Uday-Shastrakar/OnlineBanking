package com.bank.authentication.service.serviceImpl;

import com.bank.authentication.model.UserCustomerMapping;
import com.bank.authentication.repository.UserCustomerMappingRepository;
import com.bank.authentication.service.UserCustomerMappingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserCustomerMappingServiceImpl implements UserCustomerMappingService {

    @Autowired
    private UserCustomerMappingRepository mappingRepository;

    @Override
    public UserCustomerMapping createMapping(Long userId, Long customerId, UserCustomerMapping.RelationshipType relationshipType) {
        // Check if mapping already exists
        Optional<UserCustomerMapping> existingMapping = getActiveMapping(userId, customerId);
        if (existingMapping.isPresent()) {
            throw new IllegalArgumentException("Active mapping already exists for user " + userId + " and customer " + customerId);
        }

        UserCustomerMapping mapping = new UserCustomerMapping();
        mapping.setUserId(userId);
        mapping.setCustomerId(customerId);
        mapping.setRelationshipType(relationshipType);
        mapping.setEffectiveFrom(LocalDateTime.now());
        mapping.setIsActive(true);

        return mappingRepository.save(mapping);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserCustomerMapping> getActiveMapping(Long userId, Long customerId) {
        return mappingRepository.findActiveMappingByUserCustomerAndType(
            userId, customerId, UserCustomerMapping.RelationshipType.PRIMARY, LocalDateTime.now());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserCustomerMapping> getActiveMappingsByUserId(Long userId) {
        return mappingRepository.findActiveMappingsByUserId(userId, LocalDateTime.now());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserCustomerMapping> getActiveMappingsByCustomerId(Long customerId) {
        return mappingRepository.findActiveMappingsByCustomerId(customerId, LocalDateTime.now());
    }

    @Override
    public UserCustomerMapping deactivateMapping(Long mappingId) {
        Optional<UserCustomerMapping> mappingOpt = mappingRepository.findById(mappingId);
        if (mappingOpt.isEmpty()) {
            throw new IllegalArgumentException("Mapping not found with id: " + mappingId);
        }

        UserCustomerMapping mapping = mappingOpt.get();
        mapping.setIsActive(false);
        mapping.setEffectiveTo(LocalDateTime.now());

        return mappingRepository.save(mapping);
    }

    @Override
    public UserCustomerMapping updateMapping(Long mappingId, UserCustomerMapping.RelationshipType relationshipType) {
        Optional<UserCustomerMapping> mappingOpt = mappingRepository.findById(mappingId);
        if (mappingOpt.isEmpty()) {
            throw new IllegalArgumentException("Mapping not found with id: " + mappingId);
        }

        UserCustomerMapping mapping = mappingOpt.get();
        mapping.setRelationshipType(relationshipType);

        return mappingRepository.save(mapping);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasAccessToCustomer(Long userId, Long customerId) {
        List<UserCustomerMapping> mappings = getActiveMappingsByUserId(userId);
        return mappings.stream().anyMatch(mapping -> mapping.getCustomerId().equals(customerId));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isPrimaryUser(Long userId, Long customerId) {
        Optional<UserCustomerMapping> mapping = mappingRepository.findActiveMappingByUserCustomerAndType(
            userId, customerId, UserCustomerMapping.RelationshipType.PRIMARY, LocalDateTime.now());
        return mapping.isPresent();
    }
}
