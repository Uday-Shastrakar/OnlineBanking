package com.bank.customer.repository;

import com.bank.customer.model.UserCustomerMapping;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserCustomerMappingRepository extends JpaRepository<UserCustomerMapping, Long> {

    Optional<UserCustomerMapping> findByUserId(Long userId);

    Optional<UserCustomerMapping> findByCustomerId(Long customerId);

    Optional<UserCustomerMapping> findByUserIdAndCustomerId(Long userId, Long customerId);

    boolean existsByUserIdAndCustomerId(Long userId, Long customerId);

    List<UserCustomerMapping> findAllByUserId(Long userId);

    List<UserCustomerMapping> findAllByCustomerId(Long customerId);
}
