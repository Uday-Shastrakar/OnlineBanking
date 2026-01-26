package com.bank.authentication.repository;

import com.bank.authentication.model.UserCustomerMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserCustomerMappingRepository extends JpaRepository<UserCustomerMapping, Long> {

    Optional<UserCustomerMapping> findByUserIdAndCustomerIdAndIsActive(Long userId, Long customerId, Boolean isActive);

    List<UserCustomerMapping> findByUserIdAndIsActive(Long userId, Boolean isActive);

    List<UserCustomerMapping> findByCustomerIdAndIsActive(Long customerId, Boolean isActive);

    @Query("SELECT ucm FROM UserCustomerMapping ucm WHERE ucm.userId = :userId AND ucm.isActive = true " +
           "AND (ucm.effectiveTo IS NULL OR ucm.effectiveTo > :currentTime)")
    List<UserCustomerMapping> findActiveMappingsByUserId(@Param("userId") Long userId, 
                                                        @Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT ucm FROM UserCustomerMapping ucm WHERE ucm.customerId = :customerId AND ucm.isActive = true " +
           "AND (ucm.effectiveTo IS NULL OR ucm.effectiveTo > :currentTime)")
    List<UserCustomerMapping> findActiveMappingsByCustomerId(@Param("customerId") Long customerId, 
                                                            @Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT ucm FROM UserCustomerMapping ucm WHERE ucm.userId = :userId AND ucm.customerId = :customerId " +
           "AND ucm.relationshipType = :relationshipType AND ucm.isActive = true " +
           "AND (ucm.effectiveTo IS NULL OR ucm.effectiveTo > :currentTime)")
    Optional<UserCustomerMapping> findActiveMappingByUserCustomerAndType(@Param("userId") Long userId,
                                                                         @Param("customerId") Long customerId,
                                                                         @Param("relationshipType") UserCustomerMapping.RelationshipType relationshipType,
                                                                         @Param("currentTime") LocalDateTime currentTime);

    boolean existsByUserIdAndCustomerIdAndIsActive(Long userId, Long customerId, Boolean isActive);
}
